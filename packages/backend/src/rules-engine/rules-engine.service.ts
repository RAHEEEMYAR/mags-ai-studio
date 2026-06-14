import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { RedisService } from '@/redis/redis.service';
import { RuleEvaluatorService } from './rule-evaluator.service';
import { RuleActionsService } from './rule-actions.service';
import { DEFAULT_SECURITY_RULES } from './default-rules';

@Injectable()
export class RulesEngineService {
  private readonly logger = new Logger(RulesEngineService.name);
  private rulesCache: Map<string, any> = new Map();

  constructor(
    private prisma: PrismaService,
    private redisService: RedisService,
    private evaluator: RuleEvaluatorService,
    private actions: RuleActionsService,
  ) {
    this.initializeDefaultRules();
  }

  /**
   * Initialize default security rules on startup
   */
  private async initializeDefaultRules(): Promise<void> {
    for (const rule of DEFAULT_SECURITY_RULES) {
      const exists = await this.prisma.securityRule.findFirst({
        where: { name: rule.name },
      });

      if (!exists) {
        await this.prisma.securityRule.create({
          data: rule,
        });
      }
    }
  }

  /**
   * Evaluate all rules against an event
   */
  async evaluateRulesForEvent(event: any): Promise<any[]> {
    // Get all enabled rules
    const rules = await this.getEnabledRules();

    const results: any[] = [];

    for (const rule of rules) {
      try {
        const matched = await this.evaluator.evaluate(rule.condition, event);

        if (matched) {
          this.logger.log(`Rule matched: ${rule.name}`);

          // Execute rule actions
          const executedActions = await this.actions.executeActions(
            rule.actions,
            event,
          );

          // Record execution
          await this.recordRuleExecution(rule.id, event.id, 'matched', executedActions);

          results.push({
            ruleId: rule.id,
            ruleName: rule.name,
            matched: true,
            executedActions,
          });

          // Update rule triggered count
          await this.prisma.securityRule.update({
            where: { id: rule.id },
            data: {
              triggeredCount: { increment: 1 },
              lastTriggeredAt: new Date(),
            },
          });
        }
      } catch (error) {
        this.logger.error(`Rule evaluation failed: ${rule.name}`, error);
      }
    }

    return results;
  }

  /**
   * Get all enabled rules
   */
  private async getEnabledRules(): Promise<any[]> {
    return await this.prisma.securityRule.findMany({
      where: { isEnabled: true },
      orderBy: { priority: 'desc' },
    });
  }

  /**
   * Create custom rule (admin)
   */
  async createRule(
    name: string,
    description: string,
    condition: any,
    actions: any,
    priority: number = 50,
  ): Promise<any> {
    return await this.prisma.securityRule.create({
      data: {
        name,
        description,
        condition,
        actions,
        priority,
        isSystem: false,
      },
    });
  }

  /**
   * Record rule execution
   */
  private async recordRuleExecution(
    ruleId: string,
    eventId: string | null,
    result: string,
    actionsExecuted: any,
  ): Promise<void> {
    await this.prisma.ruleExecution.create({
      data: {
        ruleId,
        eventId,
        result,
        actionsExecuted,
      },
    });
  }
}