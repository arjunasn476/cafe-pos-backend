import { Controller, Get, Post, Body, Param, Put, UseGuards, Request, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiBody, ApiResponse } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private ordersService: OrdersService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CUSTOMER', 'CASHIER', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buat order baru' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Order berhasil dibuat' })
  create(@Body() createOrderDto: CreateOrderDto, @Request() req) {
    return this.ordersService.create(
      createOrderDto,
      req.user.userId,
      req.user.role,
    );
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lihat order (sesuai role)' })
  @ApiResponse({ status: 200, description: 'Daftar order' })
  findAll(@Request() req) {
    return this.ordersService.findAll(req.user.userId, req.user.role);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Lihat detail order' })
  @ApiResponse({ status: 200, description: 'Detail order' })
  findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.ordersService.findOne(id, req.user.userId, req.user.role);
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('CASHIER', 'MANAGER')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update status order (CASHIER/MANAGER only)' })
  @ApiBody({ type: UpdateOrderStatusDto })
  @ApiResponse({ status: 200, description: 'Status order berhasil diupdate' })
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
    @Request() req,
  ) {
    return this.ordersService.updateStatus(
      id,
      updateOrderStatusDto,
      req.user.userId,
      req.user.role,
    );
  }
}