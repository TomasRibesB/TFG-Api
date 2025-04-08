import { Injectable, Logger } from '@nestjs/common';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AuthEmailNotificationService {
  private readonly logger = new Logger(AuthEmailNotificationService.name);

  constructor(private readonly emailService: EmailService) {}

  async sendValidationEmail(email: string, token: string): Promise<void> {
    const validationUrl = `${process.env.CLIENT_HOST}/auth/validate/${token}`;
    const subject = 'Valida tu cuenta - Nexo Health';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Valida tu cuenta - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172); text-align:center; color:#fff; font-family:Arial, sans-serif; font-size:24px;">
                    Nexo Health
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Valida tu cuenta</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Gracias por registrarte. Por favor, valida tu cuenta haciendo clic en el siguiente enlace:
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      <a href="${validationUrl}" style="display:inline-block; padding:12px 20px; color:#ffffff; background-color:rgb(120,69,172); text-decoration:none; border-radius:8px; font-family:Arial, sans-serif;">
                        Validar Cuenta
                      </a>
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Si no solicitaste este registro, ignora este mensaje.
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
      await this.emailService.sendEmail(email, subject, html);
      this.logger.log(`Email de validación enviado a ${email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de validación a ${email}: ${error.message}`,
      );
    }
  }

  async sendValidationSuccessEmail(email: string): Promise<void> {
    const subject = 'Validación exitosa - Nexo Health';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Validación exitosa - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172); text-align:center; color:#fff; font-family:Arial, sans-serif; font-size:24px;">
                    Nexo Health
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Validación exitosa</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Tu cuenta ha sido validada exitosamente. Ahora puedes iniciar sesión.
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
      await this.emailService.sendEmail(email, subject, html);
      this.logger.log(`Email de validación exitosa enviado a ${email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de validación exitosa a ${email}: ${error.message}`,
      );
    }
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.CLIENT_HOST}/auth/reset-password/${token}`;
    const denyUrl = `${process.env.CLIENT_HOST}/auth/deny-reset-password/${token}`;
    const subject = 'Restablecer contraseña - Nexo Health';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Restablecer contraseña - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172); text-align:center; color:#fff; font-family:Arial, sans-serif; font-size:24px;">
                    Nexo Health
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Restablecer contraseña</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Recibiste este correo porque solicitaste restablecer tu contraseña. Haz clic en el siguiente botón para restablecerla:
                    </p>
                    <p>
                      <a href="${resetUrl}" style="display:inline-block; padding:12px 20px; color:#ffffff; background-color:rgb(120,69,172); text-decoration:none; border-radius:8px; font-family:Arial, sans-serif;">
                        Restablecer Contraseña
                      </a>
                    </p>
                    <p style="font-family:Arial, sans-serif; color:#555; margin-top:20px;">
                      Si no solicitaste este cambio, cancela la solicitud haciendo clic en el siguiente botón:
                    </p>
                    <p>
                      <a href="${denyUrl}" style="display:inline-block; padding:12px 20px; color:#ffffff; background-color:#dc3545; text-decoration:none; border-radius:8px; font-family:Arial, sans-serif;">
                        Cancelar Solicitud
                      </a>
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
      await this.emailService.sendEmail(email, subject, html);
      this.logger.log(
        `Email de restablecimiento de contraseña enviado a ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email de restablecimiento de contraseña a ${email}: ${error.message}`,
      );
    }
  }

  async confirmPasswordResetEmail(email: string): Promise<void> {
    const subject =
      'Confirmación de restablecimiento de contraseña - Nexo Health';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Confirmación de restablecimiento de contraseña - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172); text-align:center; color:#fff; font-family:Arial, sans-serif; font-size:24px;">
                    Nexo Health
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Confirmación de restablecimiento de contraseña</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Has restablecido tu contraseña exitosamente.
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
      await this.emailService.sendEmail(email, subject, html);
      this.logger.log(
        `Email de confirmación de restablecimiento enviado a ${email}`,
      );
    } catch (error) {
      this.logger.error(
        `Error enviando email de confirmación a ${email}: ${error.message}`,
      );
    }
  }

  async denyPasswordResetEmail(email: string): Promise<void> {
    const subject =
      'Solicitud de restablecimiento de contraseña cancelada - Nexo Health';
    const html = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8">
        <title>Solicitud de restablecimiento de contraseña cancelada - Nexo Health</title>
      </head>
      <body style="margin:0; padding:0; background-color:#f4f4f4;">
        <table role="presentation" style="width:100%; border-collapse:collapse;">
          <tr>
            <td align="center" style="padding:20px;">
              <table style="width:600px; background:#ffffff; border:1px solid #cccccc;">
                <tr>
                  <td style="padding:20px; background-color:rgb(120,69,172); text-align:center; color:#fff; font-family:Arial, sans-serif; font-size:24px;">
                    Nexo Health
                  </td>
                </tr>
                <tr>
                  <td style="padding:25px;">
                    <h2 style="font-family:Arial, sans-serif; color:#333;">Solicitud de restablecimiento de contraseña cancelada</h2>
                    <p style="font-family:Arial, sans-serif; color:#555;">
                      Has cancelado la solicitud de restablecimiento de contraseña.
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
      await this.emailService.sendEmail(email, subject, html);
      this.logger.log(`Email de cancelación enviado a ${email}`);
    } catch (error) {
      this.logger.error(
        `Error enviando email de cancelación a ${email}: ${error.message}`,
      );
    }
  }
}
