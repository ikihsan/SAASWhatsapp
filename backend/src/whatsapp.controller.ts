import { Controller, Get, Post, Body, Res, HttpException, UseGuards } from '@nestjs/common';
import { WhatsappService } from './whatsapp.service';
import { ApiKeyGuard } from './auth/api-key.guard';

@Controller()
export class WhatsappController {
  constructor(private readonly wa: WhatsappService) {}

  @Get('qr')
  getQr() {
    const qr = this.wa.getQr();
    return { qr, ready: this.wa.isReady() };
  }
  
    @UseGuards(ApiKeyGuard)
  @Post('send')
  async send(@Body() body: { to: string; message: string }) {
    const { to, message } = body;
    if (!to || !message) throw new HttpException('Invalid payload', 400);
    try {
      const res = await this.wa.sendMessage(to, message);
      return { ok: true, res };
    } catch (err) {
      throw new HttpException(String(err), 500);
    }
  }
}
