import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateOrderDto, userId: number, userRole: string) {
    if (!dto.items || dto.items.length === 0) {
      throw new BadRequestException('Minimal harus ada 1 item pesanan');
    }

    if (!dto.paymentMethod) {
      throw new BadRequestException('Metode pembayaran harus dipilih');
    }

    let actualUserId = userId;
    
    if (dto.userId) {
      if (userRole !== 'CASHIER' && userRole !== 'MANAGER') {
        throw new ForbiddenException(
          'Hanya kasir atau manager yang bisa membuat order untuk customer lain'
        );
      }
      
      const customer = await this.prisma.user.findUnique({
        where: { id: dto.userId },
      });
      
      if (!customer) {
        throw new NotFoundException(
          `Customer dengan ID ${dto.userId} tidak ditemukan`
        );
      }
      
      actualUserId = dto.userId;
    }

    const menuIds = dto.items.map(item => item.menuId);
    const menus = await this.prisma.menu.findMany({
      where: { id: { in: menuIds } },
    });

    if (menus.length !== menuIds.length) {
      throw new BadRequestException('Beberapa menu tidak ditemukan');
    }

    const orderDetails = [];
    let totalPrice = 0;

    for (const item of dto.items) {
      const menu = menus.find(m => m.id === item.menuId);

      if (!menu) {
        throw new BadRequestException(`Menu ID ${item.menuId} tidak ditemukan`);
      }

      if (!menu.isAvailable) {
        throw new BadRequestException(`Menu "${menu.name}" tidak tersedia`);
      }

      if (menu.stock < item.quantity) {
        throw new BadRequestException(
          `Stok "${menu.name}" tidak mencukupi. Tersedia: ${menu.stock}`
        );
      }

      const subtotal = Number(menu.price) * item.quantity;
      totalPrice += subtotal;

      orderDetails.push({
        menuId: item.menuId,
        quantity: item.quantity,
        unitPrice: menu.price,
        subtotal: subtotal,
      });
    }

    const today = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const lastOrder = await this.prisma.order.findFirst({
      where: {
        orderNumber: {
          startsWith: `ORD-${today}`,
        },
      },
      orderBy: {
        id: 'desc',
      },
      take: 1,
    });

    const sequence = lastOrder
      ? parseInt(lastOrder.orderNumber.split('-')[2]) + 1
      : 1;
    const orderNumber = `ORD-${today}-${String(sequence).padStart(5, '0')}`;

    const isPaidMap = {
      CASH: false,
      QRIS: true,
      EWALLETQ: true,
      BANK_TRANSFER: true,
    };
    const isPaid = isPaidMap[dto.paymentMethod] ?? false;

    const order = await this.prisma.order.create({
      data: {
        orderNumber,
        userId: actualUserId,
        totalPrice,
        status: 'PENDING',
        paymentMethod: dto.paymentMethod,
        isPaid: isPaid,
        orderDetails: {
          create: orderDetails,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        orderDetails: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    for (const item of dto.items) {
      await this.prisma.menu.update({
        where: { id: item.menuId },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    return {
      statusCode: 201,
      message: 'Order berhasil dibuat',
      data: order,
    };
  }

  async findAll(userId: number, userRole: string) {
    let orders;

    if (userRole === 'CUSTOMER') {
      orders = await this.prisma.order.findMany({
        where: { userId },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          orderDetails: {
            include: {
              menu: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      orders = await this.prisma.order.findMany({
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          orderDetails: {
            include: {
              menu: {
                select: {
                  id: true,
                  name: true,
                  price: true,
                  imageUrl: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    if (orders.length === 0) {
      return {
        statusCode: 200,
        message: 'Belum ada pesanan',
        data: [],
      };
    }

    return {
      statusCode: 200,
      message: 'Data pesanan berhasil diambil',
      data: orders,
      total: orders.length,
    };
  }

  async findOne(id: number, userId: number, userRole: string) {
    if (!id || id <= 0) {
      throw new BadRequestException('ID pesanan tidak valid');
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        orderDetails: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
    }

    if (userRole === 'CUSTOMER' && order.userId !== userId) {
      throw new ForbiddenException(
        'Anda tidak memiliki akses ke pesanan ini'
      );
    }

    return {
      statusCode: 200,
      message: 'Data pesanan berhasil diambil',
      data: order,
    };
  }

  async updateStatus(
    id: number,
    dto: UpdateOrderStatusDto,
    userId: number,
    userRole: string,
  ) {
    if (!id || id <= 0) {
      throw new BadRequestException('ID pesanan tidak valid');
    }

    if (userRole === 'CUSTOMER') {
      throw new ForbiddenException(
        'Anda tidak memiliki akses untuk update status pesanan'
      );
    }

    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        orderDetails: {
          include: {
            menu: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Pesanan dengan ID ${id} tidak ditemukan`);
    }

    if (dto.status === 'CANCELLED' && order.status !== 'CANCELLED') {
      for (const detail of order.orderDetails) {
        await this.prisma.menu.update({
          where: { id: detail.menuId },
          data: {
            stock: {
              increment: detail.quantity,
            },
          },
        });
      }
    }

    const updatedOrder = await this.prisma.order.update({
      where: { id },
      data: {
        status: dto.status,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        orderDetails: {
          include: {
            menu: {
              select: {
                id: true,
                name: true,
                price: true,
                imageUrl: true,
              },
            },
          },
        },
      },
    });

    return {
      statusCode: 200,
      message: 'Status pesanan berhasil diubah',
      data: updatedOrder,
    };
  }
}