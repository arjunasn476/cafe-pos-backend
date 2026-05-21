import { IsArray, IsNotEmpty, IsInt, Min, IsOptional } from 'class-validator';

export class CreateOrderItemDto {
  @IsInt()
  @IsNotEmpty()
  menuId: number;

  @IsInt()
  @IsNotEmpty()
  @Min(1)
  quantity: number;
}

export class CreateOrderDto {
  @IsArray()
  @IsNotEmpty()
  items: CreateOrderItemDto[];

  @IsInt()
  @IsOptional()
  userId?: number; // Hanya untuk kasir input order untuk customer
}