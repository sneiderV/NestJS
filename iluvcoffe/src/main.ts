import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ApiKeyGuard } from './common/guards/api-key.guard';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';
import { WrapResponseInterceptor } from './common/interceptors/wrap-response.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Only cast fields in Dto
    forbidNonWhitelisted: true, // Throw errors when whitelisted properties are found
    transform: true, // allow do instanceOf of a global body to Dto; it used to validate types 
    transformOptions: {
      enableImplicitConversion: true //this allow remove @Type in attribute
    }
  }));

  app.useGlobalFilters(new HttpExceptionFilter());
  //app.useGlobalGuards(new ApiKeyGuard()); remove because en /common have a module that use a guards such us guards
  app.useGlobalInterceptors(
    new WrapResponseInterceptor(),
    new TimeoutInterceptor()
    );
  await app.listen(3000);
}
bootstrap();
