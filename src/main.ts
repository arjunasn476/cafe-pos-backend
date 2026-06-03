import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common'; // <-- 1. Tambahan import
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // --- 2. Tambahan: Mengaktifkan Global Pipe biar @Transform di DTO jalan ---
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Wajib true supaya input teks bisa diubah jadi kapital
      whitelist: true, // Menolak properti ga jelas yang nggak ada di DTO
    }),
  );
  // --------------------------------------------------------------------------

  // Swagger Config (Utuh, tidak ada yang dihapus)
  const config = new DocumentBuilder()
    .setTitle('Cafe POS API')
    .setDescription('API dokumentasi untuk Cafe POS Backend - UKL SMK Telkom')
    .setVersion('1.0.0')
    .addBearerAuth()
    .addTag('Auth', 'Authentication endpoints')
    .addTag('Categories', 'Category management')
    .addTag('Menus', 'Menu management')
    .addTag('Orders', 'Order management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  // --- 3. Penyesuaian Port untuk Railway ---
  // Railway pakai port dinamis, kalau dipaksa 3000 terus, dia bisa error.
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
  
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();