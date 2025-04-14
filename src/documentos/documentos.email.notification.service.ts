import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { Documento } from './entities/documento.entity';

@Injectable()
export class DocumentosEmailNotificationService {
  private readonly logger = new Logger(DocumentosEmailNotificationService.name);

  constructor(private readonly emailService: EmailService) {}

  private getLogoUrl(): string {
    return `${process.env.SERVER_HOST}/api/v1/email`;
  }

  async enviarNotificacionArchivoProfesionalExterno(
    documento: Documento,
  ): Promise<void> {
    // Se asume que se notifica al usuario propietario del documento
    const destinatario = documento.usuario?.email;
    if (!destinatario) {
      this.logger.error(
        `No se encontró el email del usuario para el documento con id ${documento.id}`,
      );
      return;
    }

    const subject = 'Archivo de Profesional Externo Subido';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Archivo de Profesional Externo Subido - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table role="presentation" style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172);">
                    <table role="presentation" style="width:100%;">
                      <tr>
                        
                        <td style="padding-left:10px; color:#ffffff; font-family:Arial, sans-serif; font-size:24px;">
                          Nexo Health
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Archivo de Profesional Externo Subido</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Se ha subido un nuevo archivo de un profesional externo.
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      <strong>Nombre del Profesional:</strong> ${documento.nombreProfesional || 'No proporcionado'} ${documento.apellidoProfesional || ''}
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      <strong>Email del Profesional:</strong> ${documento.emailProfesional || 'No proporcionado'}
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Revise el archivo en la sección "MI SALUD" de la aplicación.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172); text-align:center; font-family:Arial, sans-serif; color:#fff; font-size:12px;">
                    &copy; ${new Date().getFullYear()} Nexo Health. Todos los derechos reservados.
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    try {
      await this.emailService.sendEmail(destinatario, subject, html);
      this.logger.log(
        `Notificación enviada a ${destinatario} para el documento ${documento.id}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando notificación para el documento ${documento.id}: ${error.message}`,
      );
    }
  }
}
