import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  express from 'express';
import { json } from 'body-parser';
import 'dotenv/config';
import { ExpressAdapter } from '@nestjs/platform-express/adapters/express-adapter';

async function bootstrap() {
  const server = express();
  server.use(json());

  const app = await NestFactory.create(AppModule,  new ExpressAdapter(server));
  app.enableCors({ origin: true }); 
  await app.listen(3001);
  console.log(`Backend listening on ${process.env.API_URL}:3001`);
}
bootstrap();
