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
    // Programa la tarea cada 1 minuto para pruebas (ajusta según necesidad)
    cron.schedule('*/5 * * * *', () => {
      this.enviarNotificacionesTurnosPaciente();
      this.enviarNotificacionesTurnosProfesionales();
    });
  }

  async enviarNotificacionesTurnosPaciente() {
    const ahora = new Date();
    const fechaObjetivo = new Date(ahora.getTime() + 60 * 60 * 1000); // 1 hora en el futuro
    const margen = 5 * 60 * 1000; // margen de 5 minutos
    const inicioMin = new Date(fechaObjetivo.getTime() - margen);
    const inicioMax = new Date(fechaObjetivo.getTime() + margen);

    this.logger.log(
      `Buscando turnos entre ${inicioMin.toLocaleDateString()} ${inicioMin.toLocaleTimeString()} y ${inicioMax.toLocaleDateString()} ${inicioMax.toLocaleTimeString()}`,
    );
    const turnos = await this.turnoRepository.find({
      where: {
        fechaHora: Between(inicioMin, inicioMax),
        notificadoPaciente: IsNull(),
        estado: Not(
          In([EstadoTurno.Cancelado, EstadoTurno.Pendiente, EstadoTurno.Libre]),
        ),
      },
      relations: ['paciente', 'profesional'],
    });

    // URL pública de tu logo (asegúrate de que sea accesible desde internet)
    const logoUrl = `${process.env.SERVER_HOST}/api/v1/email`;

    for (const turno of turnos) {
      try {
        const pacienteEmail = turno.paciente?.email;
        if (pacienteEmail) {
          const subject = 'Recordatorio de Turno';
          const html = `
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
                            Le recordamos que tiene un turno programado para dentro de <strong>1 hora</strong>.
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            <strong>Fecha y hora:</strong> ${new Date(turno.fechaHora).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })} a las ${new Date(turno.fechaHora).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit', hour12: false })}
                          </p>
                          <p style="font-family:Arial, sans-serif; font-size:16px; line-height:24px; color:#555555;">
                            Por favor, asegúrese de estar preparado para su consulta. Si necesita cancelar o reprogramar, contacta a tu profesional mediante el siguiente email: ${turno.profesional.email}
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
          await this.emailService.sendEmail(pacienteEmail, subject, html);
          turno.notificadoPaciente = new Date();
          await this.turnoRepository.save(turno);
          this.logger.log(`Email enviado para turno ${turno.id}`);
        }
      } catch (error) {
        this.logger.error(
          `Error enviando email para turno ${turno.id}: ${error.message}`,
        );
      }
    }
  }

  async enviarNotificacionesTurnosProfesionales() {
    const ahora = new Date();
    const fechaObjetivo = new Date(ahora.getTime() + 60 * 60 * 1000); // 1 hora en el futuro
    const margen = 5 * 60 * 1000; // margen de 5 minutos
    const inicioMin = new Date(fechaObjetivo.getTime() - margen);
    const inicioMax = new Date(fechaObjetivo.getTime() + margen);

    const turnos = await this.turnoRepository.find({
      where: {
        fechaHora: Between(inicioMin, inicioMax),
        notificadoProfesional: IsNull(),
        estado: Not(
          In([EstadoTurno.Cancelado, EstadoTurno.Pendiente, EstadoTurno.Libre]),
        ),
      },
      relations: ['profesional', 'paciente'],
    });

    // URL pública de tu logo (asegúrate de que sea accesible desde internet)
    const logoUrl = `${process.env.SERVER_HOST}/api/v1/email`;

    for (const turno of turnos) {
      try {
        const profesionalEmail = turno.profesional?.email;
        if (profesionalEmail) {
          const subject = 'Recordatorio de Turno';
          const html = `
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
                            Le recordamos que tiene un turno programado para dentro de <strong>1 hora</strong>.
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
          await this.emailService.sendEmail(profesionalEmail, subject, html);
          turno.notificadoProfesional = new Date();
          await this.turnoRepository.save(turno);
          this.logger.log(
            `Email enviado para turno ${turno.id} al profesional`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error enviando email para turno ${turno.id} al profesional: ${error.message}`,
        );
      }
    }
  }
}
