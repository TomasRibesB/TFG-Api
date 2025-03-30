// email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { promises as fs } from 'fs';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    try {
      const info = await this.transporter.sendMail({
        from: 'Nexo Health' + `<${process.env.EMAIL_USER}>`, // Remitente
        to, // Destinatario
        subject, // Asunto del correo
        html, // Contenido en HTML (puedes incluir también texto plano)
      });
      Logger.log(`Correo enviado: ${info.messageId}`);
      return info;
    } catch (error) {
      Logger.error(`Error enviando email: ${error.message}`);
      throw error;
    }
  }

  async getIcon(): Promise<Buffer> {
    return await fs.readFile(`${process.cwd()}/src/assets/icon.png`);
  }
}
