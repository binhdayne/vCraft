import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}
  @Get()
  async check() {
    try {
      if (!this.connection.db) throw new Error('Disconnected');
      await this.connection.db.admin().ping();
      return { status: 'ok', database: 'connected' };
    } catch { throw new ServiceUnavailableException('Database unavailable'); }
  }
}
