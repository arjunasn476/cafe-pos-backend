import { IsArray, IsNotEmpty, IsInt, Min, IsOptional, IsEnum } from 'class-validator';

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
  EWALLETQ = 'EWALLETQ',
  BANK_TRANSFER = 'BANK_TRANSFER',
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @IsInt()
  @IsOptional()
  userId?: number;

  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  paymentMethod: PaymentMethodEnum;
}