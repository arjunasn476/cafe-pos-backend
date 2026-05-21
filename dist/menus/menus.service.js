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
exports.MenusService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../database/prisma.service");
let MenusService = class MenusService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(dto) {
        // Validasi: name tidak boleh kosong
        if (!dto.name || dto.name.trim().length === 0) {
            throw new common_1.BadRequestException('Nama menu tidak boleh kosong');
        }
        // Validasi: name minimal 3 karakter
        if (dto.name.trim().length < 3) {
            throw new common_1.BadRequestException('Nama menu minimal 3 karakter');
        }
        // Validasi: name maksimal 50 karakter
        if (dto.name.trim().length > 50) {
            throw new common_1.BadRequestException('Nama menu maksimal 50 karakter');
        }
        // Validasi: price harus > 0
        if (dto.price <= 0) {
            throw new common_1.BadRequestException('Harga menu harus lebih dari 0');
        }
        // Validasi: stock harus >= 0
        if (dto.stock < 0) {
            throw new common_1.BadRequestException('Stok menu tidak boleh negatif');
        }
        // Validasi: categoryId harus valid
        if (!dto.categoryId || dto.categoryId <= 0) {
            throw new common_1.BadRequestException('ID kategori tidak valid');
        }
        // Cek category exists
        const category = await this.prisma.category.findUnique({
            where: { id: dto.categoryId },
        });
        if (!category) {
            throw new common_1.NotFoundException(`Kategori dengan ID ${dto.categoryId} tidak ditemukan`);
        }
        // Cek duplicate name dalam category yang sama
        const existing = await this.prisma.menu.findFirst({
            where: {
                AND: [
                    {
                        name: {
                            equals: dto.name.trim(),
                            mode: 'insensitive',
                        },
                    },
                    { categoryId: dto.categoryId },
                ],
            },
        });
        if (existing) {
            throw new common_1.ConflictException(`Menu "${dto.name}" sudah ada di kategori ini. Gunakan nama lain.`);
        }
        // Create menu
        const menu = await this.prisma.menu.create({
            data: {
                name: dto.name.trim(),
                price: dto.price,
                stock: dto.stock,
                categoryId: dto.categoryId,
                isAvailable: true,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        const { description, imageUrl, ...menuData } = menu;
        return {
            statusCode: 201,
            message: 'Menu berhasil dibuat',
            data: menuData,
        };
    }
    async findAll() {
        const menus = await this.prisma.menu.findMany({
            include: {
                category: {
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
        // Jika tidak ada menu
        if (menus.length === 0) {
            return {
                statusCode: 200,
                message: 'Belum ada menu',
                data: [],
            };
        }
        // Remove description dan imageUrl dari setiap menu
        const cleanMenus = menus.map(menu => {
            const { description, imageUrl, ...rest } = menu;
            return rest;
        });
        return {
            statusCode: 200,
            message: 'Data menu berhasil diambil',
            data: cleanMenus,
            total: cleanMenus.length,
        };
    }
    async findOne(id) {
        // Validasi: id harus number positif
        if (!id || id <= 0) {
            throw new common_1.BadRequestException('ID menu tidak valid');
        }
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        // Menu tidak ditemukan
        if (!menu) {
            throw new common_1.NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
        }
        const { description, imageUrl, ...menuData } = menu;
        return {
            statusCode: 200,
            message: 'Data menu berhasil diambil',
            data: menuData,
        };
    }
    async update(id, dto) {
        // Validasi: id harus number positif
        if (!id || id <= 0) {
            throw new common_1.BadRequestException('ID menu tidak valid');
        }
        // Cek menu ada atau tidak
        const menu = await this.prisma.menu.findUnique({
            where: { id },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
        }
        // Validasi: name jika diupdate
        if (dto.name !== undefined) {
            if (dto.name.trim().length === 0) {
                throw new common_1.BadRequestException('Nama menu tidak boleh kosong');
            }
            if (dto.name.trim().length < 3) {
                throw new common_1.BadRequestException('Nama menu minimal 3 karakter');
            }
            if (dto.name.trim().length > 50) {
                throw new common_1.BadRequestException('Nama menu maksimal 50 karakter');
            }
            // Cek duplicate name dalam kategori
            const categoryId = dto.categoryId || menu.categoryId;
            const existing = await this.prisma.menu.findFirst({
                where: {
                    AND: [
                        {
                            name: {
                                equals: dto.name.trim(),
                                mode: 'insensitive',
                            },
                        },
                        { categoryId },
                        { id: { not: id } },
                    ],
                },
            });
            if (existing) {
                throw new common_1.ConflictException(`Menu "${dto.name}" sudah ada di kategori ini. Gunakan nama lain.`);
            }
        }
        // Validasi: price jika diupdate
        if (dto.price !== undefined) {
            if (dto.price <= 0) {
                throw new common_1.BadRequestException('Harga menu harus lebih dari 0');
            }
        }
        // Validasi: stock jika diupdate
        if (dto.stock !== undefined) {
            if (dto.stock < 0) {
                throw new common_1.BadRequestException('Stok menu tidak boleh negatif');
            }
        }
        // Validasi: categoryId jika diupdate
        if (dto.categoryId !== undefined) {
            if (dto.categoryId <= 0) {
                throw new common_1.BadRequestException('ID kategori tidak valid');
            }
            const category = await this.prisma.category.findUnique({
                where: { id: dto.categoryId },
            });
            if (!category) {
                throw new common_1.NotFoundException(`Kategori dengan ID ${dto.categoryId} tidak ditemukan`);
            }
        }
        // Update menu
        const updatedMenu = await this.prisma.menu.update({
            where: { id },
            data: {
                name: dto.name?.trim() || undefined,
                price: dto.price || undefined,
                stock: dto.stock !== undefined ? dto.stock : undefined,
                categoryId: dto.categoryId || undefined,
                isAvailable: dto.isAvailable !== undefined ? dto.isAvailable : undefined,
            },
            include: {
                category: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
        const { description, imageUrl, ...menuData } = updatedMenu;
        return {
            statusCode: 200,
            message: 'Menu berhasil diubah',
            data: menuData,
        };
    }
    async delete(id) {
        // Validasi: id harus number positif
        if (!id || id <= 0) {
            throw new common_1.BadRequestException('ID menu tidak valid');
        }
        // Cek menu ada atau tidak
        const menu = await this.prisma.menu.findUnique({
            where: { id },
            include: {
                orderDetails: {
                    select: { id: true },
                },
            },
        });
        if (!menu) {
            throw new common_1.NotFoundException(`Menu dengan ID ${id} tidak ditemukan`);
        }
        // Validasi: tidak boleh delete menu yang sudah ada di order
        if (menu.orderDetails.length > 0) {
            throw new common_1.ConflictException(`Menu "${menu.name}" sudah digunakan di ${menu.orderDetails.length} pesanan. Tidak bisa dihapus.`);
        }
        // Delete menu
        await this.prisma.menu.delete({
            where: { id },
        });
        return {
            statusCode: 200,
            message: 'Menu berhasil dihapus',
            data: {
                id: menu.id,
                name: menu.name,
            },
        };
    }
};
exports.MenusService = MenusService;
exports.MenusService = MenusService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MenusService);
//# sourceMappingURL=menus.service.js.map