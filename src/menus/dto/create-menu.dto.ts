import { IsString, IsNotEmpty, IsNumber, IsInt, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuDto {
  @ApiProperty({ example: 'Nasi Goreng', description: 'Nama menu' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 15000, description: 'Harga menu' })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({ example: 10, description: 'Stok menu' })
  @IsInt()
  @IsNotEmpty()
  @Min(0)
  stock: number;

  @ApiProperty({ example: 1, description: 'ID Kategori' })
  @IsInt()
  @IsNotEmpty()
  categoryId: number;

  @ApiProperty({ 
    example: 'https://example.com/image.jpg', 
    description: 'URL Gambar Menu', 
    required: false 
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}