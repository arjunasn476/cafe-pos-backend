import { IsArray, IsNotEmpty, IsInt, Min, IsOptional, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  menuId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export enum PaymentMethodEnum {
  CASH = 'CASH',
  QRIS = 'QRIS',
  EWALLET = 'EWALLET',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @IsInt()
  @IsOptional()
  userId?: number;

  @Transform(({ value }) => (typeof value === 'string' ? value.toUpperCase() : value))
  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  paymentMethod: PaymentMethodEnum;
}