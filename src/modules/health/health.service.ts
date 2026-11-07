import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection } from "mongoose";
@Injectable()
export class HealthService {
  constructor(
    @InjectConnection()
    private readonly connection: Connection,
  ) {}
  async check() {
    try {
      if (!this.connection.db) throw new Error("Disconnected");
      await this.connection.db.admin().ping();
      return { status: "ok", database: "connected" };
    } catch {
      throw new ServiceUnavailableException("Database unavailable");
    }
  }
}
