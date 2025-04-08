import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Between, In, IsNull, Not, Repository } from 'typeorm';
import { Turno } from './entities/turno.entity';
import { EmailService } from 'src/email/email.service';
import * as cron from 'node-cron';
import { EstadoTurno } from './entities/estadosTurnos.enum';

@Injectable()
export class TurnosEmailNotificationService {
  private readonly logger = new Logger(TurnosEmailNotificationService.name);

  constructor(
    @InjectRepository(Turno)
    private readonly turnoRepository: Repository<Turno>,
    private readonly emailService: EmailService,
  ) {
    // Programa la tarea cada 5 minutos para pruebas (ajusta según necesidad)
    cron.schedule('*/5 * * * *', () => {
      this.enviarNotificacionesTurnos();
    });
  }

  async enviarNotificacionesTurnos() {
    const ahora = new Date();
    const fechaFinal = new Date(ahora.getTime() + 60 * 60 * 1000); // 1 hora en el futuro

    // Buscar todos los turnos entre ahora y 1 hora desde ahora
    const turnos = await this.turnoRepository.find({
      where: {
        fechaHora: Between(ahora, fechaFinal),
        notificado: IsNull(),
        estado: Not(
          In([EstadoTurno.Cancelado, EstadoTurno.Pendiente, EstadoTurno.Libre]),
        ),
      },
      relations: ['paciente', 'profesional'],
    });

    const logoUrl = `${process.env.SERVER_HOST}/api/v1/email`;

    for (const turno of turnos) {
      try {
        // Calcular el tiempo restante
        const ahoraEnLoop = new Date();
        const diffMs = turno.fechaHora.getTime() - ahoraEnLoop.getTime();
        const diffMin = Math.floor(diffMs / (1000 * 60));
        const diffSeg = Math.floor((diffMs % (1000 * 60)) / 1000);

        // Personalizar mensaje dinámico
        const tiempoRestante =
          diffMin > 0
            ? `${diffMin} minuto(s) y ${diffSeg} segundo(s)`
            : `${diffSeg} segundo(s)`;

        // Envío de correo para paciente
        const pacienteEmail = turno.paciente?.email;
        if (pacienteEmail) {
          const subjectPaciente = 'Recordatorio de Turno';
          const htmlPaciente = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <title>Recordatorio de Turno - Nexo Health</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f4f4f4;">
              <table role="presentation" style="width:100%; border-collapse:collapse; border:0; border-spacing:0;">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table role="presentation" style="width:602px; border-collapse:collapse; border:1px solid #cccccc; border-spacing:0; text-align:left; background-color:#ffffff;">
                      <!-- Encabezado -->
                      <tr>
                        <td style="padding:20px; background-color:rgb(120, 69, 172);">
                          <table role="presentation" style="width:100%; border-collapse:collapse; border:0; border-spacing:0;">
                            <tr>
                              <td style="width:50px; vertical-align:middle;">
                                <img src="${logoUrl}" alt="Logo Nexo Health" width="50" style="height:auto; display:block; border-radius: 50px;" />
                              </td>
                              <td style="vertical-align:middle; padding-left:10px;">
                                <h1 style="margin:0; font-family:Arial, sans-serif; font-size:24px; color:rgb(255,255,255);">
                                  Nexo Health
                                </h1>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Cuerpo del correo -->
                      <tr>
                        <td style="padding:25px; background-color:#ffffff;">
                          <h2 style="font-family:Arial, sans-serif; font-size:20px; color:#333333; margin-top:0;">Recordatorio de Turno</h2>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Estimado/a,
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Le recordamos que tiene un turno programado para dentro de <strong>${tiempoRestante}</strong>.
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            <strong>Fecha y hora:</strong> ${new Date(turno.fechaHora).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${new Date(turno.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Si necesita cancelar o reprogramar, contacte a su profesional: ${turno.profesional?.email}
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            ¡Gracias por confiar en nosotros!
                          </p>
                        </td>
                      </tr>
                      <!-- Pie de página -->
                      <tr>
                        <td style="padding:30px; background-color:rgb(120, 69, 172);">
                          <p style="font-family:Arial, sans-serif; font-size:12px; line-height:18px; color:rgb(255,255,255); text-align:center; margin:0;">
                            &copy; ${new Date().getFullYear()} Nexo Health. Todos los derechos reservados.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;
          await this.emailService.sendEmail(
            pacienteEmail,
            subjectPaciente,
            htmlPaciente,
          );
        }

        // Envío de correo para profesional
        const profesionalEmail = turno.profesional?.email;
        if (profesionalEmail) {
          const subjectProfesional = 'Recordatorio de Turno';
          const htmlProfesional = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
              <meta charset="UTF-8">
              <title>Recordatorio de Turno - Nexo Health</title>
            </head>
            <body style="margin:0; padding:0; background-color:#f4f4f4;">
              <table role="presentation" style="width:100%; border-collapse:collapse; border:0; border-spacing:0;">
                <tr>
                  <td align="center" style="padding:20px 0;">
                    <table role="presentation" style="width:602px; border-collapse:collapse; border:1px solid #cccccc; border-spacing:0; text-align:left; background-color:#ffffff;">
                      <!-- Encabezado -->
                      <tr>
                        <td style="padding:20px; background-color:rgb(120, 69, 172);">
                          <table role="presentation" style="width:100%; border-collapse:collapse; border:0; border-spacing:0;">
                            <tr>
                              <td style="width:50px; vertical-align:middle;">
                                <img src="${logoUrl}" alt="Logo Nexo Health" width="50" style="height:auto; display:block; border-radius: 50px;" />
                              </td>
                              <td style="vertical-align:middle; padding-left:10px;">
                                <h1 style="margin:0; font-family:Arial, sans-serif; font-size:24px; color:rgb(255,255,255);">
                                  Nexo Health
                                </h1>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                      <!-- Cuerpo del correo -->
                      <tr>
                        <td style="padding:25px; background-color:#ffffff;">
                          <h2 style="font-family:Arial, sans-serif; font-size:20px; color:#333333; margin-top:0;">Recordatorio de Turno</h2>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Estimado/a,
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Le recordamos que tiene un turno programado para dentro de <strong>${tiempoRestante}</strong>.
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            <strong>Fecha y hora:</strong> ${new Date(turno.fechaHora).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${new Date(turno.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Por favor, verifique su agenda y realice los ajustes necesarios para atender este turno.
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            ¡Gracias por su compromiso con Nexo Health!
                          </p>
                        </td>
                      </tr>
                      <!-- Pie de página -->
                      <tr>
                        <td style="padding:30px; background-color:rgb(120, 69, 172);">
                          <p style="font-family:Arial, sans-serif; font-size:12px; line-height:18px; color:rgb(255,255,255); text-align:center; margin:0;">
                            &copy; ${new Date().getFullYear()} Nexo Health. Todos los derechos reservados.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
          `;
          await this.emailService.sendEmail(
            profesionalEmail,
            subjectProfesional,
            htmlProfesional,
          );
        }

        // Después de enviar ambos correos se actualiza el campo "notificado"
        turno.notificado = new Date();
        await this.turnoRepository.save(turno);
        this.logger.log(`Emails enviados para turno ${turno.id}`);
      } catch (error) {
        this.logger.error(
          `Error enviando emails para turno ${turno.id}: ${error.message}`,
        );
      }
    }
  }

  async enviarNotificacionTurnoReservado(turno: Turno) {
    const logoUrl = `${process.env.SERVER_HOST}/api/v1/email`;

    // Notificación para el usuario (paciente) que reservó el turno
    if (turno.paciente?.email) {
      const subjectPaciente = 'Confirmación de Reserva de Turno';
      const htmlPaciente = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Reserva Confirmada - Nexo Health</title>
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
                  <!-- Cuerpo del correo -->
                  <tr>
                    <td style="padding:25px;">
                      <h2 style="font-family:Arial, sans-serif; color:#333;">Reserva Confirmada</h2>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Su reserva de turno ha sido confirmada exitosamente.
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        <strong>Profesional:</strong> ${turno.profesional?.firstName} ${turno.profesional?.lastName}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        <strong>Fecha y hora:</strong> ${new Date(
                          turno.fechaHora,
                        ).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })} a las ${new Date(
                          turno.fechaHora,
                        ).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Si necesita cancelar o reprogramar, por favor contacte a su profesional mediante el siguiente email: ${turno.profesional?.email}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        ¡Gracias por elegir Nexo Health!
                      </p>
                    </td>
                  </tr>
                  <!-- Pie de página -->
                  <tr>
                    <td style="padding:30px; background-color:rgb(120,69,172); text-align:center; font-family:Arial, sans-serif; color:#fff; font-size:12px;">
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
      await this.emailService.sendEmail(
        turno.paciente.email,
        subjectPaciente,
        htmlPaciente,
      );
      this.logger.log(
        `Notificación de reserva enviada a paciente ${turno.paciente.email} para turno ${turno.id}`,
      );
    }

    // Notificación para el profesional al recibir la reserva
    if (turno.profesional?.email) {
      const subjectProfesional = 'Nuevo Turno Reservado';
      const htmlProfesional = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Nuevo Turno Reservado - Nexo Health</title>
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
                  <!-- Cuerpo del correo -->
                  <tr>
                    <td style="padding:25px;">
                      <h2 style="font-family:Arial, sans-serif; color:#333;">Turno Reservado</h2>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Se ha reservado un nuevo turno.
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        <strong>Paciente:</strong> ${turno.paciente?.firstName} ${turno.paciente?.lastName}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        <strong>Fecha y hora:</strong> ${new Date(
                          turno.fechaHora,
                        ).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })} a las ${new Date(
                          turno.fechaHora,
                        ).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Por favor, revise los detalles en su panel de control.
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Si necesita cancelar o reprogramar, por favor contacte a su paciente mediante el siguiente email: ${turno.paciente?.email}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        ¡Gracias por su compromiso con Nexo Health!
                      </p>
                    </td>
                  </tr>
                  <!-- Pie de página -->
                  <tr>
                    <td style="padding:30px; background-color:rgb(120,69,172); text-align:center; font-family:Arial, sans-serif; color:#fff; font-size:12px;">
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
      await this.emailService.sendEmail(
        turno.profesional.email,
        subjectProfesional,
        htmlProfesional,
      );
      this.logger.log(
        `Notificación de reserva enviada a profesional ${turno.profesional.email} para turno ${turno.id}`,
      );
    }
  }

  async enviarNotificacionTurnoCancelado(turno: Turno) {
    const logoUrl = `${process.env.SERVER_HOST}/api/v1/email`;

    // Notificación para paciente
    if (turno.paciente?.email) {
      const subjectPaciente = 'Turno Cancelado';
      const htmlPaciente = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Turno Cancelado - Nexo Health</title>
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
                  <!-- Cuerpo del correo -->
                  <tr>
                    <td style="padding:25px;">
                      <h2 style="font-family:Arial, sans-serif; color:#333;">Turno Cancelado</h2>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Su turno ha sido cancelado.
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        <strong>Fecha y hora:</strong> ${new Date(
                          turno.fechaHora,
                        ).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })} a las ${new Date(
                          turno.fechaHora,
                        ).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Si tiene dudas, por favor contacte a soporte.
                      </p>
                    </td>
                  </tr>
                  <!-- Pie de página -->
                  <tr>
                    <td style="padding:30px; background-color:rgb(120,69,172); text-align:center; font-family:Arial, sans-serif; color:#fff; font-size:12px;">
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
      await this.emailService.sendEmail(
        turno.paciente.email,
        subjectPaciente,
        htmlPaciente,
      );
      this.logger.log(
        `Notificación de turno cancelado enviada a paciente ${turno.paciente.email} para turno ${turno.id}`,
      );
    }

    // Notificación para profesional
    if (turno.profesional?.email) {
      const subjectProfesional = 'Turno Cancelado';
      const htmlProfesional = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Turno Cancelado - Nexo Health</title>
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
                  <!-- Cuerpo del correo -->
                  <tr>
                    <td style="padding:25px;">
                      <h2 style="font-family:Arial, sans-serif; color:#333;">Turno Cancelado</h2>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Se ha cancelado un turno.
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        <strong>Fecha y hora:</strong> ${new Date(
                          turno.fechaHora,
                        ).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'long',
                        })} a las ${new Date(
                          turno.fechaHora,
                        ).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false,
                        })}
                      </p>
                      <p style="font-family:Arial, sans-serif; color:#555;">
                        Revise los detalles en su panel de control.
                      </p>
                    </td>
                  </tr>
                  <!-- Pie de página -->
                  <tr>
                    <td style="padding:30px; background-color:rgb(120,69,172); text-align:center; font-family:Arial, sans-serif; color:#fff; font-size:12px;">
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
      await this.emailService.sendEmail(
        turno.profesional.email,
        subjectProfesional,
        htmlProfesional,
      );
      this.logger.log(
        `Notificación de turno cancelado enviada a profesional ${turno.profesional.email} para turno ${turno.id}`,
      );
    }
  }
}
