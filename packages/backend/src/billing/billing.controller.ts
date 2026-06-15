import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
  HttpCode,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { BillingService } from './billing.service';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import { UpgradePlanDto } from './dto/upgrade-plan.dto';
import { AddCreditsDto } from './dto/add-credits.dto';
import { InvoiceFilterDto } from './dto/invoice-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('billing')
@UseGuards(JwtAuthGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  // ==================== PLANS ====================
  @Get('plans')
  async getPlans() {
    return this.billingService.getActivePlans();
  }

  @Get('plans/:planId')
  async getPlanDetails(@Param('planId') planId: string) {
    return this.billingService.getPlanDetails(planId);
  }

  // ==================== SUBSCRIPTION ====================
  @Get('subscription')
  async getSubscription(@Req() req: any) {
    const userId = req.user.id;
    return this.billingService.getUserSubscription(userId);
  }

  @Post('create-checkout')
  async createCheckout(
    @Body() dto: CreateCheckoutDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.createCheckoutSession(userId, dto);
  }

  @Post('upgrade')
  async upgradePlan(
    @Body() dto: UpgradePlanDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.upgradePlan(userId, dto.planId);
  }

  @Post('downgrade')
  async downgradePlan(
    @Body() dto: UpgradePlanDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.downgradePlan(userId, dto.planId);
  }

  @Post('cancel')
  @HttpCode(200)
  async cancelSubscription(
    @Body() body: { reason?: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.cancelSubscription(userId, body.reason);
  }

  @Post('resume')
  async resumeSubscription(@Req() req: any) {
    const userId = req.user.id;
    return this.billingService.resumeSubscription(userId);
  }

  // ==================== CREDITS ====================
  @Get('credits/balance')
  async getCreditBalance(@Req() req: any) {
    const userId = req.user.id;
    return this.billingService.getCreditBalance(userId);
  }

  @Get('credits/history')
  async getCreditHistory(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.getCreditHistory(userId, limit, offset);
  }

  @Post('credits/add')
  async addCredits(
    @Body() dto: AddCreditsDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.addCredits(userId, dto);
  }

  @Post('credits/deduct')
  async deductCredits(
    @Body() body: { amount: number; reason: string; referenceId?: string },
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.deductCredits(
      userId,
      body.amount,
      body.reason,
      body.referenceId,
    );
  }

  // ==================== INVOICES ====================
  @Get('invoices')
  async getInvoices(
    @Query() filterDto: InvoiceFilterDto,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.getInvoices(userId, filterDto);
  }

  @Get('invoices/:invoiceId')
  async getInvoiceDetails(
    @Param('invoiceId') invoiceId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.getInvoiceDetails(userId, invoiceId);
  }

  @Post('invoices/:invoiceId/download')
  async downloadInvoice(
    @Param('invoiceId') invoiceId: string,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.downloadInvoice(userId, invoiceId);
  }

  // ==================== USAGE ====================
  @Get('usage/current-cycle')
  async getCurrentUsage(@Req() req: any) {
    const userId = req.user.id;
    return this.billingService.getCurrentUsage(userId);
  }

  @Get('usage/forecast')
  async getUsageForecast(@Req() req: any) {
    const userId = req.user.id;
    return this.billingService.getUsageForecast(userId);
  }

  // ==================== BILLING HISTORY ====================
  @Get('history/payments')
  async getPaymentHistory(
    @Query('limit') limit = 50,
    @Query('offset') offset = 0,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.getPaymentHistory(userId, limit, offset);
  }

  @Get('history/cycles')
  async getBillingCycleHistory(
    @Query('limit') limit = 12,
    @Query('offset') offset = 0,
    @Req() req: any,
  ) {
    const userId = req.user.id;
    return this.billingService.getBillingCycles(userId, limit, offset);
  }
}
