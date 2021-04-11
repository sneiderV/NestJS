import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Only cast fields in Dto
    forbidNonWhitelisted: true, // Throw errors when whitelisted properties are found
    transform: true, // allow do instanceOf of a global body to Dto
  }));
  await app.listen(3000);
}
bootstrap();
