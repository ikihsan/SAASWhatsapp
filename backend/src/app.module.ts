import { Module } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { WhatsappController } from './whatsapp.controller';
import { ApiKeyGuard } from './auth/api-key.guard';
@Module({
  imports: [],
  controllers: [WhatsappController],
  providers: [WhatsappService, ApiKeyGuard],
})
export class AppModule {}
