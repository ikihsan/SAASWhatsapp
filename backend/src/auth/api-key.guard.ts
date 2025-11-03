import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    // Accept either Authorization: Bearer <key> OR x-api-key header
    const auth = req.headers['authorization'];
    const apiKeyHeader = (req.headers['x-api-key'] as string) || null;
    const supplied = (auth && auth.startsWith('Bearer ')) ? auth.slice(7) : apiKeyHeader;

    const expected = process.env.API_KEY;
    if (!supplied || supplied !== expected) {
      throw new UnauthorizedException('Invalid API key');
    }
    return true;
  }
}