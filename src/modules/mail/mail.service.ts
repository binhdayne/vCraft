import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer, { Transporter } from "nodemailer";
import {
  BatchCompletionEmailPayload,
  SentEmailRecord,
} from "./interfaces/mail-payload.interface";
import { buildBatchCompletionEmail } from "./templates/batch-completion.template";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly fromAddress: string;
  private readonly isTest: boolean;
  private readonly outbox: SentEmailRecord[] = [];

  constructor(private readonly config: ConfigService) {
    this.isTest = this.config.get<string>("NODE_ENV") === "test";
    const host = this.config.get<string>("SMTP_HOST", "").trim();
    const port = Number(this.config.get<string>("SMTP_PORT", "587"));
    const secure =
      String(this.config.get<string>("SMTP_SECURE", "false")).toLowerCase() ===
      "true";
    const user = this.config.get<string>("SMTP_USER", "").trim();
    const pass = this.config
      .get<string>("SMTP_PASS", "")
      .replace(/\s+/g, "")
      .trim();

    this.fromAddress =
      this.config.get<string>("MAIL_FROM", "").trim() ||
      (user
        ? `vCraft · Sắc mộc Đông Hồ <${user}>`
        : "vCraft · Sắc mộc Đông Hồ <no-reply@vcraft.vn>");

    if (!this.isTest && host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: Number.isFinite(port) && port > 0 ? port : 587,
        secure,
        auth: { user, pass },
        connectionTimeout: 8000,
        greetingTimeout: 8000,
        socketTimeout: 10000,
      });
      this.logger.log(`SMTP MailService initialized (${host}:${port})`);
    } else {
      this.transporter = null;
      if (!this.isTest) {
        this.logger.warn(
          "SMTP credentials not configured in .env (SMTP_HOST/SMTP_USER/SMTP_PASS). MailService running in mock/outbox mode.",
        );
      }
    }
  }

  isSmtpConfigured(): boolean {
    return this.transporter !== null;
  }

  getOutbox(): SentEmailRecord[] {
    return [...this.outbox];
  }

  clearOutbox(): void {
    this.outbox.length = 0;
  }

  async sendBatchCompletionEmail(
    payload: BatchCompletionEmailPayload,
  ): Promise<SentEmailRecord> {
    const { subject, text, html } = buildBatchCompletionEmail(payload);
    const filename = `vcraft-qr-${payload.batchCode}.png`;

    const attachments = [
      {
        filename: `inline-${filename}`,
        content: payload.qrBuffer,
        contentType: "image/png",
        cid: "vcraft-qr-code",
        contentDisposition: "inline" as const,
      },
      {
        filename,
        content: payload.qrBuffer,
        contentType: "image/png",
        contentDisposition: "attachment" as const,
      },
    ];

    const record: SentEmailRecord = {
      to: payload.to,
      from: this.fromAddress,
      subject,
      text,
      html,
      attachments: attachments.map((att) => ({
        filename: att.filename,
        cid: att.cid,
        size: payload.qrBuffer.length,
        contentType: att.contentType,
      })),
      sentAt: new Date().toISOString(),
      mode: this.transporter ? "smtp" : "mock",
    };

    if (this.transporter) {
      const info = await this.transporter.sendMail({
        from: this.fromAddress,
        to: payload.to,
        subject,
        text,
        html,
        attachments,
      });
      record.messageId = info.messageId;
      this.logger.log(
        `Sent batch completion QR email to ${payload.to} (batch ${payload.batchCode}, messageId: ${info.messageId})`,
      );
    } else if (!this.isTest) {
      this.logger.log(
        `[MOCK MAIL] Batch completion QR email queued for ${payload.to} | Batch: ${payload.batchCode} | Trace: ${payload.traceUrl}`,
      );
    }

    this.outbox.push(record);
    return record;
  }
}
