import {
  Injectable,
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCategoryDto) {
    // Validasi: name tidak boleh kosong
    if (!dto.name || dto.name.trim().length === 0) {
      throw new BadRequestException('Nama kategori tidak boleh kosong');
    }

    // Validasi: name minimal 3 karakter
    if (dto.name.trim().length < 3) {
      throw new BadRequestException('Nama kategori minimal 3 karakter');
    }

    // Validasi: name tidak boleh lebih dari 50 karakter
    if (dto.name.trim().length > 50) {
      throw new BadRequestException('Nama kategori maksimal 50 karakter');
    }

    // Cek duplicate name
    const existing = await this.prisma.category.findFirst({
      where: {
        name: {
          equals: dto.name.trim(),
          mode: 'insensitive',
        },
      },
    });

    if (existing) {
      throw new ConflictException(
        `Kategori "${dto.name}" sudah terdaftar. Gunakan nama lain.`
      );
    }

    // Create category
    const category = await this.prisma.category.create({
      data: {
        name: dto.name.trim(),
        description: dto.description?.trim() || null,
        imageUrl: dto.imageUrl?.trim() || null,
      },
    });

    const { imageUrl, ...categoryData } = category;
    return {
      statusCode: 201,
      message: 'Kategori berhasil dibuat',
      data: categoryData,
    };
  }

  async findAll() {
    const categories = await this.prisma.category.findMany({
      include: {
        menus: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Jika tidak ada kategori
    if (categories.length === 0) {
      return {
        statusCode: 200,
        message: 'Belum ada kategori',
        data: [],
      };
    }

    // Remove imageUrl dari setiap kategori
    const cleanCategories = categories.map(cat => {
      const { imageUrl, ...rest } = cat;
      return rest;
    });

    return {
      statusCode: 200,
      message: 'Data kategori berhasil diambil',
      data: cleanCategories,
      total: cleanCategories.length,
    };
  }

  async findOne(id: number) {
    // Validasi: id harus number positif
    if (!id || id <= 0) {
      throw new BadRequestException('ID kategori tidak valid');
    }

    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        menus: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
          },
        },
      },
    });

    // Kategori tidak ditemukan
    if (!category) {
      throw new NotFoundException(
        `Kategori dengan ID ${id} tidak ditemukan`
      );
    }

    const { imageUrl, ...categoryData } = category;
    return {
      statusCode: 200,
      message: 'Data kategori berhasil diambil',
      data: categoryData,
    };
  }

  async update(id: number, dto: UpdateCategoryDto) {
    // Validasi: id harus number positif
    if (!id || id <= 0) {
      throw new BadRequestException('ID kategori tidak valid');
    }

    // Cek kategori ada atau tidak
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(
        `Kategori dengan ID ${id} tidak ditemukan`
      );
    }

    // Jika name diupdate, validasi
    if (dto.name !== undefined) {
      if (dto.name.trim().length === 0) {
        throw new BadRequestException('Nama kategori tidak boleh kosong');
      }

      if (dto.name.trim().length < 3) {
        throw new BadRequestException('Nama kategori minimal 3 karakter');
      }

      if (dto.name.trim().length > 50) {
        throw new BadRequestException('Nama kategori maksimal 50 karakter');
      }

      // Cek duplicate name (exclude current category)
      const existing = await this.prisma.category.findFirst({
        where: {
          AND: [
            {
              name: {
                equals: dto.name.trim(),
                mode: 'insensitive',
              },
            },
            { id: { not: id } },
          ],
        },
      });

      if (existing) {
        throw new ConflictException(
          `Kategori "${dto.name}" sudah terdaftar. Gunakan nama lain.`
        );
      }
    }

    // Update category
    const updatedCategory = await this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name?.trim() || undefined,
        description: dto.description?.trim() || undefined,
        imageUrl: dto.imageUrl?.trim() || undefined,
      },
      include: {
        menus: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const { imageUrl, ...categoryData } = updatedCategory;
    return {
      statusCode: 200,
      message: 'Kategori berhasil diubah',
      data: categoryData,
    };
  }

  async delete(id: number) {
    // Validasi: id harus number positif
    if (!id || id <= 0) {
      throw new BadRequestException('ID kategori tidak valid');
    }

    // Cek kategori ada atau tidak
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        menus: {
          select: { id: true },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(
        `Kategori dengan ID ${id} tidak ditemukan`
      );
    }

    // Validasi: tidak boleh delete kategori yang memiliki menu
    if (category.menus.length > 0) {
      throw new ConflictException(
        `Kategori "${category.name}" memiliki ${category.menus.length} menu. Hapus semua menu terlebih dahulu sebelum menghapus kategori.`
      );
    }

    // Delete category
    await this.prisma.category.delete({
      where: { id },
    });

    return {
      statusCode: 200,
      message: 'Kategori berhasil dihapus',
      data: {
        id: category.id,
        name: category.name,
      },
    };
  }
}