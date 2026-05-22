"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const app_module_1 = require("./app.module");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    // Swagger Config
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Cafe POS API')
        .setDescription('API dokumentasi untuk Cafe POS Backend - UKL SMK Telkom')
        .setVersion('1.0.0')
        .addBearerAuth()
        .addTag('Auth', 'Authentication endpoints')
        .addTag('Categories', 'Category management')
        .addTag('Menus', 'Menu management')
        .addTag('Orders', 'Order management')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('docs', app, document);
    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
//# sourceMappingURL=main.js.map