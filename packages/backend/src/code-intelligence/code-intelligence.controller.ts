import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CodeIntelligenceService } from './code-intelligence.service';
import { JwtGuard } from '@/auth/guards/jwt.guard';
import { CurrentUser } from '@/auth/decorators/current-user.decorator';

@Controller('repos/:repoId/intelligence')
@UseGuards(JwtGuard)
export class CodeIntelligenceController {
  constructor(private codeIntelligenceService: CodeIntelligenceService) {}

  /**
   * Explain file
   */
  @Get('files/:fileId/explain')
  async explainFile(
    @Param('repoId') repoId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    // Verify authorization
    const explanation = await this.codeIntelligenceService.explainFile(repoId, fileId);
    return { explanation };
  }

  /**
   * Summarize repository
   */
  @Get('summarize')
  async summarizeRepository(
    @Param('repoId') repoId: string,
    @CurrentUser() user: any,
  ) {
    const summary = await this.codeIntelligenceService.summarizeRepository(repoId);
    return { summary };
  }

  /**
   * Find bugs
   */
  @Post('find-bugs')
  @HttpCode(HttpStatus.OK)
  async findBugs(
    @Param('repoId') repoId: string,
    @Body() body: { fileId?: string },
    @CurrentUser() user: any,
  ) {
    const analysis = await this.codeIntelligenceService.findBugs(repoId, body.fileId);
    return analysis;
  }

  /**
   * Suggest improvements
   */
  @Get('files/:fileId/improve')
  async suggestImprovements(
    @Param('repoId') repoId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
  ) {
    const suggestions = await this.codeIntelligenceService.suggestImprovements(
      repoId,
      fileId,
    );
    return { suggestions };
  }

  /**
   * Answer question about code
   */
  @Post('query')
  @HttpCode(HttpStatus.OK)
  async answerQuestion(
    @Param('repoId') repoId: string,
    @Body() body: { question: string },
    @CurrentUser() user: any,
  ) {
    const result = await this.codeIntelligenceService.answerQuestion(repoId, body.question);
    return result;
  }
}
