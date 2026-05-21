import { IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string; // <-- Hanya ganti nama properti di sini

  @IsString()
  @IsNotEmpty()
  password: string;
}