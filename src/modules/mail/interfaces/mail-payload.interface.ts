export interface BatchEmailItem {
  artworkName: string;
  dimensions?: string;
  quantity: number;
  category?: string;
}

export interface BatchCompletionEmailPayload {
  to: string;
  recipientName: string;
  quoteTitle: string;
  batchCode: string;
  workshopName: string;
  quantity: number;
  traceUrl: string;
  items: BatchEmailItem[];
  qrBuffer: Buffer;
}

export interface SentEmailRecord {
  to: string;
  from: string;
  subject: string;
  text: string;
  html: string;
  attachments: Array<{
    filename: string;
    cid?: string;
    size: number;
    contentType: string;
  }>;
  sentAt: string;
  mode: "smtp" | "mock";
  messageId?: string;
}
