import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';
import { Ticket } from './entities/ticket.entity';

@Injectable()
export class TicketsEmailNotificationService {
  private readonly logger = new Logger(TicketsEmailNotificationService.name);

  constructor(private readonly emailService: EmailService) {}

  private getLogoUrl(): string {
    return `${process.env.SERVER_HOST}/api/v1/email`;
  }

  async enviarNotificacionTicketAprobado(ticket: Ticket): Promise<void> {
    const logoUrl = this.getLogoUrl();
    // Se notifica a los involucrados: solicitante y receptor.
    const destinatarios: string[] = [];
    if (ticket.solicitante?.email) {
      destinatarios.push(ticket.solicitante.email);
    }
    if (ticket.receptor?.email) {
      destinatarios.push(ticket.receptor.email);
    }

    const participantes = [
      `${ticket.receptor?.firstName} ${ticket.receptor?.lastName}`,
      `${ticket.solicitante?.firstName} ${ticket.solicitante?.lastName}`,
    ];

    if (
      ticket.usuario?.id !== ticket.receptor?.id &&
      ticket.usuario?.id !== ticket.solicitante?.id
    ) {
      destinatarios.push(ticket.usuario.email);
      participantes.push(
        `${ticket.usuario.firstName} ${ticket.usuario.lastName}`,
      );
    }

    const subject = 'Ticket Aprobado';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ticket Aprobado - Nexo Health</title>
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
                        <td style="width:50px;">
                          <img src="${logoUrl}" alt="Logo Nexo Health" width="50" style="display:block; border-radius:50px;">
                        </td>
                        <td style="padding-left:10px; color:#ffffff; font-family:Arial, sans-serif; font-size:24px;">
                          Nexo Health
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Ticket Aprobado</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      El ticket con ${participantes.join(', ')} ha sido aprobado.
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Revise los detalles en la seccion de tickets.
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

    for (const email of destinatarios) {
      try {
        await this.emailService.sendEmail(email, subject, html);
        this.logger.log(
          `Notificación de ticket aprobado enviada a ${email} para ticket ${ticket.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando notificación de ticket aprobado para ticket ${ticket.id} a ${email}: ${error.message}`,
        );
      }
    }
  }

  async enviarNotificacionTicketPendiente(ticket: Ticket): Promise<void> {
    const logoUrl = this.getLogoUrl();
    // Para ticket pendiente, notifica al receptor (quien debe aprobar)
    const destinatarios: string[] = [];
    if (ticket.consentimientoReceptor === 'Pendiente') {
      destinatarios.push(ticket.receptor.email);
    }

    if (ticket.consentimientoSolicitante === 'Pendiente') {
      destinatarios.push(ticket.solicitante.email);
    }

    const participantes = [
      `${ticket.receptor?.firstName} ${ticket.receptor?.lastName}`,
      `${ticket.solicitante?.firstName} ${ticket.solicitante?.lastName}`,
    ];

    if (
      ticket.consentimientoUsuario === 'Pendiente' &&
      ticket.usuario?.email !== ticket.receptor?.email &&
      ticket.usuario?.email !== ticket.solicitante?.email
    ) {
      // Si el usuario no es el receptor ni el solicitante, se le notifica también.
      destinatarios.push(ticket.usuario.email);
      participantes.push(
        `${ticket.usuario.firstName} ${ticket.usuario.lastName}`,
      );
    }

    const subject = 'Ticket Pendiente de Aprobación';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ticket Pendiente - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172);">
                    <table style="width:100%;">
                      <tr>
                        <td style="width:50px;">
                          <img src="${logoUrl}" alt="Logo Nexo Health" width="50" style="display:block; border-radius:50px;">
                        </td>
                        <td style="padding-left:10px; color:#ffffff; font-family:Arial, sans-serif; font-size:24px;">
                          Nexo Health
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Ticket Pendiente de Aprobación</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Existe un ticket pendiente de aprobación:
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      <strong>Participantes:</strong>
                      ${participantes.join(', ')}.
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Por favor, revise en la sección de tickets para aprobar o rechazar el ticket.
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

    for (const email of destinatarios) {
      try {
        await this.emailService.sendEmail(email, subject, html);
        this.logger.log(
          `Notificación de ticket pendiente enviada a ${email} para ticket ${ticket.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando notificación de ticket pendiente para ticket ${ticket.id} a ${email}: ${error.message}`,
        );
      }
    }
  }

  async enviarNotificacionTicketRechazado(ticket: Ticket): Promise<void> {
    const logoUrl = this.getLogoUrl();
    // Para ticket rechazado se notifica a solicitante y receptor.
    const destinatarios: string[] = [];
    if (ticket.solicitante?.email) {
      destinatarios.push(ticket.solicitante.email);
    }
    if (ticket.receptor?.email) {
      destinatarios.push(ticket.receptor.email);
    }

    const participantes = [
      `${ticket.receptor?.firstName} ${ticket.receptor?.lastName}`,
      `${ticket.solicitante?.firstName} ${ticket.solicitante?.lastName}`,
    ];

    if (
      ticket.usuario?.id !== ticket.receptor?.id &&
      ticket.usuario?.id !== ticket.solicitante?.id
    ) {
      destinatarios.push(ticket.usuario.email);
      participantes.push(
        `${ticket.usuario.firstName} ${ticket.usuario.lastName}`,
      );
    }

    const subject = 'Ticket Rechazado';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Ticket Rechazado - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172);">
                    <table style="width:100%;">
                      <tr>
                        <td style="width:50px;">
                          <img src="${logoUrl}" alt="Logo Nexo Health" width="50" style="display:block; border-radius:50px;">
                        </td>
                        <td style="padding-left:10px; color:#ffffff; font-family:Arial, sans-serif; font-size:24px;">
                          Nexo Health
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Ticket Rechazado</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      El ticket con ${participantes.join(
                        ', ',
                      )} ha sido rechazado.
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Si tiene dudas, contacte con el soporte.
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

    for (const email of destinatarios) {
      try {
        await this.emailService.sendEmail(email, subject, html);
        this.logger.log(
          `Notificación de ticket rechazado enviada a ${email} para ticket ${ticket.id}`,
        );
      } catch (error) {
        this.logger.error(
          `Error enviando notificación de ticket rechazado para ticket ${ticket.id} a ${email}: ${error.message}`,
        );
      }
    }
  }
}
