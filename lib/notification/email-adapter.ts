import "server-only";

import nodemailer from "nodemailer";

export type SendEmailInput = {
  eventId: string;
  to: string;
  subject: string;
  text: string;
  html: string;
};

export interface EmailAdapter {
  send(input: SendEmailInput): Promise<{ messageId: string }>;
}

class SinkEmailAdapter implements EmailAdapter {
  async send(input: SendEmailInput) {
    return { messageId: `staybali-preview-${input.eventId}` };
  }
}

class SmtpEmailAdapter implements EmailAdapter {
  private readonly transport;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);
    const from = process.env.EMAIL_FROM;
    if (!host || !Number.isInteger(port) || port < 1 || port > 65535 || !from) {
      throw new Error("SMTP_HOST, SMTP_PORT, and EMAIL_FROM are required for SMTP email.");
    }
    this.transport = nodemailer.createTransport({
      host,
      port,
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD ?? "" }
        : undefined,
    });
  }

  async send(input: SendEmailInput) {
    const from = process.env.EMAIL_FROM!;
    const result = await this.transport.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
      messageId: `<${input.eventId}@staybali.local>`,
    });
    return { messageId: result.messageId };
  }
}

export function createEmailAdapter(): EmailAdapter {
  const transport = process.env.EMAIL_TRANSPORT ?? "sink";
  if (transport === "sink") return new SinkEmailAdapter();
  if (transport === "smtp") return new SmtpEmailAdapter();
  throw new Error("EMAIL_TRANSPORT must be either sink or smtp.");
}
