import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvoiceFilterDto } from '../dto/invoice-filter.dto';
import { v4 as uuid } from 'uuid';

@Injectable()
export class InvoiceService {
  constructor(private prisma: PrismaService) {}

  async createInvoice(
    subscriptionId: string,
    billingCycleId: string,
    periodStart: Date,
    periodEnd: Date,
  ) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true, user: true },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Generate invoice number
    const invoiceNumber = await this.generateInvoiceNumber(
      subscription.userId,
    );

    // Get usage records for the period
    const usageRecords = await this.prisma.usageRecord.findMany({
      where: {
        subscriptionId,
        billingCycleId,
        createdAt: {
          gte: periodStart,
          lte: periodEnd,
        },
      },
    });

    // Calculate totals
    const subtotal = subscription.plan.monthlyPrice;
    const usageAmount = usageRecords.reduce((sum, r) => sum + r.totalCost, 0);
    const totalAmount = subtotal + usageAmount;

    // Create invoice
    const invoice = await this.prisma.invoice.create({
      data: {
        invoiceNumber,
        subscriptionId,
        userId: subscription.userId,
        periodStart,
        periodEnd,
        subtotal,
        taxAmount: 0, // Tax calculation can be added
        totalAmount,
        amountDue: totalAmount,
        status: 'SENT',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Create line items
    const lineItems = [
      {
        invoiceId: invoice.id,
        description: `${subscription.plan.name} - ${periodStart.toDateString()} to ${periodEnd.toDateString()}`,
        quantity: 1,
        unitPrice: subtotal,
        total: subtotal,
        type: 'subscription',
      },
    ];

    // Add usage line items
    if (usageRecords.length > 0) {
      const usageByType: Record<string, any> = {};

      for (const record of usageRecords) {
        if (!usageByType[record.usageType]) {
          usageByType[record.usageType] = {
            quantity: 0,
            total: 0,
          };
        }
        usageByType[record.usageType].quantity += record.quantity;
        usageByType[record.usageType].total += record.totalCost;
      }

      for (const [type, data] of Object.entries(usageByType)) {
        lineItems.push({
          invoiceId: invoice.id,
          description: `${type} Usage`,
          quantity: data.quantity,
          unitPrice: data.total / data.quantity,
          total: data.total,
          type: 'usage',
        });
      }
    }

    // Batch create line items
    await Promise.all(
      lineItems.map(item =>
        this.prisma.invoiceLineItem.create({ data: item }),
      ),
    );

    return invoice;
  }

  async getUserInvoices(
    userId: string,
    filterDto: InvoiceFilterDto,
  ) {
    const where: any = { userId };

    if (filterDto.status) {
      where.status = filterDto.status;
    }

    if (filterDto.startDate) {
      where.createdAt = {
        ...where.createdAt,
        gte: new Date(filterDto.startDate),
      };
    }

    if (filterDto.endDate) {
      where.createdAt = {
        ...where.createdAt,
        lte: new Date(filterDto.endDate),
      };
    }

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filterDto.limit,
        skip: filterDto.offset,
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      invoices,
      total,
      limit: filterDto.limit,
      offset: filterDto.offset,
    };
  }

  async getInvoiceDetails(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        lineItems: true,
        subscription: {
          include: { plan: true },
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Mark as viewed
    if (invoice.status === 'SENT') {
      await this.prisma.invoice.update({
        where: { id: invoiceId },
        data: { status: 'VIEWED' },
      });
    }

    return invoice;
  }

  async generatePdfUrl(userId: string, invoiceId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: {
        id: invoiceId,
        userId,
      },
      include: {
        lineItems: true,
        subscription: { include: { plan: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    // Generate PDF (mock implementation)
    // In production, use a library like pdfkit or html2pdf
    const pdfUrl = `https://invoices.example.com/${invoice.invoiceNumber}.pdf`;

    // Update PDF URL
    await this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        pdfUrl,
        pdfGeneratedAt: new Date(),
      },
    });

    return { pdfUrl };
  }

  async markInvoiceAsPaid(
    invoiceId: string,
    paidAmount: number,
  ) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id: invoiceId },
    });

    if (!invoice) {
      throw new NotFoundException('Invoice not found');
    }

    const newAmountDue = invoice.amountDue - paidAmount;

    return this.prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        amountPaid: invoice.amountPaid + paidAmount,
        amountDue: newAmountDue > 0 ? newAmountDue : 0,
        status: newAmountDue <= 0 ? 'PAID' : 'PARTIALLY_PAID',
        paidAt: newAmountDue <= 0 ? new Date() : invoice.paidAt,
      },
    });
  }

  private async generateInvoiceNumber(userId: string): Promise<string> {
    const year = new Date().getFullYear();
    const month = String(new Date().getMonth() + 1).padStart(2, '0');

    const count = await this.prisma.invoice.count({
      where: {
        userId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lte: new Date(`${year}-12-31`),
        },
      },
    });

    return `INV-${year}-${month}-${String(count + 1).padStart(4, '0')}`;
  }
}
