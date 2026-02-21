import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import { ParseIntIdPipe } from './common/pipes/parserIntId.pipe';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Remove campos não definidos no DTO
      forbidNonWhitelisted: true, // Lança erro se campos extras forem enviados
      transform: true, // Converte tipos automaticamente
    }),
    new ParseIntIdPipe(),
  );

  if (process.env.APP_ESTAGE === 'production') {
    app.use(helmet());
    app.enableCors({
      origin: process.env.APP_CORS_ORIGIN,
    });
  }

  await app.listen(process.env.APP_PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
