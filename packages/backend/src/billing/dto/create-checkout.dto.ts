import { IsString, IsEnum, IsOptional, IsEmail } from 'class-validator';

export enum BillingCycleEnum {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export class CreateCheckoutDto {
  @IsString()
  planId: string;

  @IsEnum(BillingCycleEnum)
  billingCycle: BillingCycleEnum;

  @IsOptional()
  @IsString()
  couponCode?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  successUrl?: string;

  @IsOptional()
  @IsString()
  cancelUrl?: string;
}
