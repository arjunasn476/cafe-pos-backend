"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let CategoriesService = class CategoriesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        // Validasi: name tidak boleh kosong
        if (!dto.name || dto.name.trim().length === 0) {
            throw new common_1.BadRequestException('Nama kategori tidak boleh kosong');
        }
        // Validasi: name minimal 3 karakter
        if (dto.name.trim().length < 3) {
            throw new common_1.BadRequestException('Nama kategori minimal 3 karakter');
        }
        // Validasi: name tidak boleh lebih dari 50 karakter
        if (dto.name.trim().length > 50) {
            throw new common_1.BadRequestException('Nama kategori maksimal 50 karakter');
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
            throw new common_1.ConflictException(`Kategori "${dto.name}" sudah terdaftar. Gunakan nama lain.`);
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
    async findOne(id) {
        // Validasi: id harus number positif
        if (!id || id <= 0) {
            throw new common_1.BadRequestException('ID kategori tidak valid');
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
            throw new common_1.NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
        }
        const { imageUrl, ...categoryData } = category;
        return {
            statusCode: 200,
            message: 'Data kategori berhasil diambil',
            data: categoryData,
        };
    }
    async update(id, dto) {
        // Validasi: id harus number positif
        if (!id || id <= 0) {
            throw new common_1.BadRequestException('ID kategori tidak valid');
        }
        // Cek kategori ada atau tidak
        const category = await this.prisma.category.findUnique({
            where: { id },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
        }
        // Jika name diupdate, validasi
        if (dto.name !== undefined) {
            if (dto.name.trim().length === 0) {
                throw new common_1.BadRequestException('Nama kategori tidak boleh kosong');
            }
            if (dto.name.trim().length < 3) {
                throw new common_1.BadRequestException('Nama kategori minimal 3 karakter');
            }
            if (dto.name.trim().length > 50) {
                throw new common_1.BadRequestException('Nama kategori maksimal 50 karakter');
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
                throw new common_1.ConflictException(`Kategori "${dto.name}" sudah terdaftar. Gunakan nama lain.`);
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
    async delete(id) {
        // Validasi: id harus number positif
        if (!id || id <= 0) {
            throw new common_1.BadRequestException('ID kategori tidak valid');
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
            throw new common_1.NotFoundException(`Kategori dengan ID ${id} tidak ditemukan`);
        }
        // Validasi: tidak boleh delete kategori yang memiliki menu
        if (category.menus.length > 0) {
            throw new common_1.ConflictException(`Kategori "${category.name}" memiliki ${category.menus.length} menu. Hapus semua menu terlebih dahulu sebelum menghapus kategori.`);
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
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map