import { Injectable, ConflictException, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { JwtService } from '@nestjs/jwt'; // <-- TAMBAH INI
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  // <-- UPDATE CONSTRUCTOR
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: any) {
    // Validasi username
    if (!dto.username || dto.username.trim().length === 0) {
      throw new BadRequestException('Username tidak boleh kosong');
    }

    if (dto.username.length < 3) {
      throw new BadRequestException('Username minimal 3 karakter');
    }

    // Validasi password
    if (!dto.password || dto.password.trim().length === 0) {
      throw new BadRequestException('Password tidak boleh kosong');
    }

    if (dto.password.length < 6) {
      throw new BadRequestException('Password minimal 6 karakter');
    }

    // Validasi role
    const validRoles = ['MANAGER', 'CASHIER', 'CUSTOMER'];
    if (!dto.role) {
      throw new BadRequestException('Role tidak boleh kosong');
    }

    if (!validRoles.includes(dto.role)) {
      throw new BadRequestException(
        `Role tidak valid. Gunakan salah satu: ${validRoles.join(', ')}`
      );
    }

    // Cek username duplikasi
    const existing = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });

    if (existing) {
      throw new ConflictException('Username sudah terdaftar');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        username: dto.username,
        password: hashedPassword,
        email: dto.email || `${dto.username}@cafe.local`,
        fullName: dto.fullName || `User_${dto.username}`,
        phoneNumber: dto.phoneNumber || null,
        role: dto.role,
      },
    });

    return {
      statusCode: 201,
      message: 'Registrasi berhasil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
      },
    };
  }

  async login(dto: any) {
    // Validasi username (Hanya ganti dari dto.identifier ke dto.username)
    if (!dto.username || dto.username.trim().length === 0) {
      throw new BadRequestException('Username tidak boleh kosong');
    }

    // Validasi password
    if (!dto.password || dto.password.trim().length === 0) {
      throw new BadRequestException('Password tidak boleh kosong');
    }

    // Cari user (Hanya ganti dari dto.identifier ke dto.username)
    const user = await this.prisma.user.findFirst({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Validasi password
    const isValid = await bcrypt.compare(dto.password, user.password);

    if (!isValid) {
      throw new UnauthorizedException('Username atau password salah');
    }

    // Cek user aktif
    if (!user.isActive) {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan');
    }

    // <-- TAMBAH INI: Generate JWT token
    const accessToken = this.jwtService.sign({
      sub: user.id,
      username: user.username,
      role: user.role,
    });

    return {
      statusCode: 200,
      message: 'Login berhasil',
      data: {
        id: user.id,
        username: user.username,
        role: user.role,
        accessToken: accessToken, // <-- TAMBAH INI
      },
    };
  }
}