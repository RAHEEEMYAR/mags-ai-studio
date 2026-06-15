import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';

export enum InvoiceStatusEnum {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  VIEWED = 'VIEWED',
  PAID = 'PAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAST_DUE = 'PAST_DUE',
  CANCELLED = 'CANCELLED',
}

export class InvoiceFilterDto {
  @IsOptional()
  @IsEnum(InvoiceStatusEnum)
  status?: InvoiceStatusEnum;

  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;

  @IsOptional()
  @IsString()
  searchQuery?: string;

  limit?: number = 50;
  offset?: number = 0;
}
