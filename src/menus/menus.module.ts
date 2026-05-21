import { Module } from '@nestjs/common';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { PrismaService } from '../database/prisma.service';

@Module({
  providers: [MenusService, PrismaService],
  controllers: [MenusController],
})
export class MenusModule {}