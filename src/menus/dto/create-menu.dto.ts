import { IsString, IsNotEmpty, IsNumber, IsInt, Min } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @IsInt()
  @IsNotEmpty()
  categoryId: number;
}