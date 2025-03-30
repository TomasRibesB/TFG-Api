// email.service.ts
import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: 'smtp.hostinger.com',
      port: 465,
      secure: true,
      auth: {
        user: 'tuemail@gmail.com',
        pass: 'tu_contraseña_o_app_password',
      },
    });
  }

  async sendEmail(to: string, subject: string, html: string): Promise<any> {
    try {
      const info = await this.transporter.sendMail({
        from: '"Nexo Health" <tuemail@gmail.com>', // Remitente
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
}
