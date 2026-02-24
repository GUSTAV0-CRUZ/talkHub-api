import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app/app.module';
import helmet from 'helmet';
import { ParseIntIdPipe } from './common/pipes/parserIntId.pipe';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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

  const config = new DocumentBuilder()
    .setTitle('TalkHub Api')
    .setDescription('service of message to people')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Entry with token JWT',
        in: 'header',
      },
      'bearer',
    )
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.APP_PORT ?? 3000);
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap();
