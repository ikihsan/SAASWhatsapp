import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import  express from 'express';
import { json } from 'body-parser';
import 'dotenv/config';
import { ExpressAdapter } from '@nestjs/platform-express/adapters/express-adapter';
import { Server as IOServer } from 'socket.io';
import { WhatsappService } from './whatsapp.service';

async function bootstrap() {
  const server = express();
  server.use(json());

  const app = await NestFactory.create(AppModule,  new ExpressAdapter(server));
  app.enableCors({ origin: true }); 
  const port = process.env.PORT || 3006;
  await app.listen(port);


  const httpServer = app.getHttpServer();
  const io = new IOServer(httpServer, { cors: { origin: true } });


  const waService = app.get(WhatsappService);
  waService.setIo(io);

  console.log(`Backend listening on port ${port} (API_URL=${process.env.API_URL || 'not set'})`);
}
bootstrap();