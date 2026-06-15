import { IsNumber, IsPositive, IsString, IsOptional } from 'class-validator';

export class AddCreditsDto {
  @IsNumber()
  @IsPositive()
  amount: number;

  @IsString()
  paymentMethodId: string;

  @IsOptional()
  @IsString()
  description?: string;
}
