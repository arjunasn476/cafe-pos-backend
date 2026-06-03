import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // VALIDATION
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // CORS
  app.enableCors({
    origin: '*',
    credentials: true,
  });

  // SWAGGER
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

  // PORT RAILWAY
  const port = process.env.PORT || 3000;

  await app.listen(port, '0.0.0.0');

  console.log(`Application is running on port ${port}`);
}

bootstrap();