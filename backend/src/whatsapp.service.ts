import { Injectable, OnModuleInit } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import qrcode from 'qrcode';
import { Server as IOServer } from 'socket.io';
import path from 'path/win32';


@Injectable()
export class WhatsappService implements OnModuleInit {
  public client: Client;
  private io: IOServer | null = null;
  private qrDataUrl: string | null = null;
  private ready = false;

  onModuleInit() {
    this.initClient();
  }

  initClient() {
    const dataPath = path.join('.wwebjs_auth');
    // Use LocalAuth so sessions are saved to './.wwebjs_auth'
    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath, clientId :'default'}),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--single-process',
          '--disable-gpu'
        ],
      },
    });

    // QR code
    this.client.on('qr', async (qr) => {
      // generate data URL for the frontend
      this.qrDataUrl = await qrcode.toDataURL(qr);
      this.io?.emit('qr', this.qrDataUrl);
      console.log('QR received');
    });

    this.client.on('ready', () => {
      this.ready = true;
      this.io?.emit('ready', true);
      console.log('WhatsApp client ready');
    });

    this.client.on('message', (msg: Message) => {
      // Send message to frontend via Socket.IO if attached
      this.io?.emit('message', {
        from: msg.from,
        body: msg.body,
        timestamp: msg.timestamp,
      });
    });

    this.client.initialize().catch(err => {
      console.error('Client init error', err);
    });
  }

  // Called from main.ts after the Nest HTTP server is created
  setIo(io: IOServer) {
    this.io = io;
    // re-emit current state so clients connecting after startup get the latest info
    if (this.qrDataUrl) this.io.emit('qr', this.qrDataUrl);
    if (this.ready) this.io.emit('ready', true);
  }

  getQr() {
    return this.qrDataUrl;
  }

  isReady() {
    return this.ready;
  }

  async sendMessage(to: string, message: string) {
    if (!this.ready) throw new Error('Client not ready');
    let jid = to;
    if (!jid.includes('@')) jid = `${to}@c.us`;
    const res = await this.client.sendMessage(jid, message);
    return res;
  }
}