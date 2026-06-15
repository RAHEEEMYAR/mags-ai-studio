import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddCreditsDto } from '../dto/add-credits.dto';
import { PaymentService } from './payment.service';

@Injectable()
export class CreditWalletService {
  constructor(
    private prisma: PrismaService,
    private paymentService: PaymentService,
  ) {}

  async getBalance(userId: string) {
    const wallet = await this.prisma.creditWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Credit wallet not found');
    }

    return {
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      totalSpent: wallet.totalSpent,
      isFrozen: wallet.isFrozen,
    };
  }

  async addCredits(
    userId: string,
    dto: AddCreditsDto,
  ) {
    // Ensure wallet exists
    const wallet = await this.prisma.creditWallet.upsert({
      where: { userId },
      create: { userId, balance: 0 },
      update: {},
    });

    if (wallet.isFrozen) {
      throw new BadRequestException('Wallet is frozen');
    }

    const transaction = await this.prisma.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'PURCHASE',
        amount: dto.amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + dto.amount,
        description: dto.description || 'Credits purchased',
        reason: 'MANUAL_PURCHASE',
      },
    });

    // Update wallet balance
    const updated = await this.prisma.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + dto.amount,
        totalEarned: wallet.totalEarned + dto.amount,
      },
    });

    return {
      transaction,
      wallet: updated,
    };
  }

  async deductCredits(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string,
  ) {
    const wallet = await this.prisma.creditWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Credit wallet not found');
    }

    if (wallet.isFrozen) {
      throw new BadRequestException('Wallet is frozen');
    }

    if (wallet.balance < amount) {
      throw new BadRequestException('Insufficient credits');
    }

    const transaction = await this.prisma.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'USAGE',
        amount: -amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance - amount,
        description: `${reason} deduction`,
        referenceId,
        reason,
      },
    });

    // Update wallet balance
    const updated = await this.prisma.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance - amount,
        totalSpent: wallet.totalSpent + amount,
      },
    });

    return {
      transaction,
      wallet: updated,
    };
  }

  async refundCredits(
    userId: string,
    amount: number,
    reason: string,
    referenceId?: string,
  ) {
    const wallet = await this.prisma.creditWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Credit wallet not found');
    }

    const transaction = await this.prisma.creditTransaction.create({
      data: {
        walletId: wallet.id,
        userId,
        type: 'REFUND',
        amount,
        balanceBefore: wallet.balance,
        balanceAfter: wallet.balance + amount,
        description: `Refund: ${reason}`,
        referenceId,
        reason,
      },
    });

    // Update wallet balance
    const updated = await this.prisma.creditWallet.update({
      where: { id: wallet.id },
      data: {
        balance: wallet.balance + amount,
      },
    });

    return {
      transaction,
      wallet: updated,
    };
  }

  async getTransactionHistory(
    userId: string,
    limit: number,
    offset: number,
  ) {
    const wallet = await this.prisma.creditWallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Credit wallet not found');
    }

    const [transactions, total] = await Promise.all([
      this.prisma.creditTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
      }),
      this.prisma.creditTransaction.count({ where: { walletId: wallet.id } }),
    ]);

    return {
      transactions,
      total,
      limit,
      offset,
    };
  }

  async freezeWallet(userId: string, reason: string) {
    return this.prisma.creditWallet.update({
      where: { userId },
      data: {
        isFrozen: true,
        frozenReason: reason,
      },
    });
  }

  async unfreezeWallet(userId: string) {
    return this.prisma.creditWallet.update({
      where: { userId },
      data: {
        isFrozen: false,
        frozenReason: null,
      },
    });
  }
}
