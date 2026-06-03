import { IsString, IsOptional, IsNumber, IsInt, Min, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuDto {
  @ApiProperty({ example: 'Nasi Goreng', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: 15000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 10, required: false })
  @IsInt()
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiProperty({ example: 1, required: false })
  @IsInt()
  @IsOptional()
  categoryId?: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isAvailable?: boolean;

  @ApiProperty({ 
    example: 'https://example.com/image-new.jpg', 
    description: 'URL Gambar Menu', 
    required: false 
  })
  @IsString()
  @IsOptional()
  imageUrl?: string;
}