import { Injectable, Logger } from '@nestjs/common';
import * as cron from 'node-cron';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as mysql from 'mysql2/promise';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private lockFile = path.join(process.cwd(), 'backup.lock');

  constructor() {
    this.scheduleBackup();
  }

  private scheduleBackup() {
    // Para pruebas se ejecuta cada 10 minutos; ajustar cron según necesidades (por ejemplo, 3:00 AM)
    cron.schedule('0 3 * * *', async () => {
      await this.backupDatabase();
    });
    this.logger.log('Servicio de backup programado.');
  }

  // Función auxiliar para formatear valores a cadenas compatibles con MySQL
  private formatValue(val: any): string {
    if (val === null) return 'NULL';
    if (typeof val === 'number') return val.toString();
    if (val instanceof Date) {
      return `'${val.toISOString().replace('T', ' ').substring(0, 19)}'`;
    }
    const parsed = Date.parse(val);
    if (!isNaN(parsed)) {
      const d = new Date(parsed);
      return `'${d.toISOString().replace('T', ' ').substring(0, 19)}'`;
    }
    return `'${(val + '').replace(/'/g, "''")}'`;
  }

  private async backupDatabase() {
    if (fs.existsSync(this.lockFile)) {
      this.logger.warn('Backup ya en ejecución. Se salta esta ejecución.');
      return;
    }
    fs.writeFileSync(this.lockFile, String(Date.now()));

    const dateStr = new Date().toISOString().split('T')[0]; // formato YYYY-MM-DD
    const dumpsDir = path.join(process.cwd(), 'dumps');
    if (!fs.existsSync(dumpsDir)) {
      fs.mkdirSync(dumpsDir, { recursive: true });
      this.logger.log(`Carpeta 'dumps' creada en: ${dumpsDir}`);
    }
    const backupFile = path.join(dumpsDir, `backup-${dateStr}.sql`);
    const tempDumpFile = path.join(dumpsDir, `temp-${dateStr}.sql`);

    // Ruta de mysqldump con opción --set-gtid-purged=OFF si es necesario
    const mysqldumpPath =
      '"C:\\Program Files\\MySQL\\MySQL Server 8.4\\bin\\mysqldump.exe"';

    // -----------------------------------------------------------
    // PARTE 1: Obtener volcado normal (omitimos las tablas con datos binarios y visibilidad)
    // -----------------------------------------------------------
    const ignoreTables = [
      `--ignore-table=${process.env.DB_NAME}.documento`,
      `--ignore-table=${process.env.DB_NAME}.documento_visibilidad_user`,
      `--ignore-table=${process.env.DB_NAME}.user`,
      `--ignore-table=${process.env.DB_NAME}.user_tipo_profesional`,
    ].join(' ');
    const dumpNormalCmd = `${mysqldumpPath} --set-gtid-purged=OFF ${ignoreTables} -h${process.env.DB_HOST} -P${process.env.DB_PORT} -u${process.env.DB_USER} -p${process.env.DB_PASS} ${process.env.DB_NAME} > "${tempDumpFile}"`;

    try {
      await new Promise<void>((resolve, reject) => {
        exec(dumpNormalCmd, (err, _stdout, stderr) => {
          if (err) {
            this.logger.error(`Error en dump normal: ${stderr || err.message}`);
            fs.unlinkSync(this.lockFile);
            return reject(err);
          }
          this.logger.log('Dump normal creado (tablas ignoradas omitidas).');
          resolve();
        });
      });
    } catch (error) {
      this.logger.error('Error al crear el dump normal:', error);
      return;
    }

    // -----------------------------------------------------------
    // PARTE 2: Generar bloque custom para las tablas ignoradas
    // -----------------------------------------------------------
    const customDDL = {
      documento: `
DROP TABLE IF EXISTS \`documento\`;
CREATE TABLE \`documento\` (
  \`id\` INT PRIMARY KEY,
  \`tipo\` VARCHAR(255),
  \`titulo\` VARCHAR(255),
  \`descripcion\` TEXT,
  \`fechaSubida\` DATETIME,
  \`fechaBaja\` DATETIME,
  \`nombreProfesional\` VARCHAR(255),
  \`apellidoProfesional\` VARCHAR(255),
  \`dniProfesional\` VARCHAR(50),
  \`emailProfesional\` VARCHAR(255),
  \`tipoProfesionalId\` INT,
  \`profesionalId\` INT,
  \`usuarioId\` INT,
  \`hasArchivo\` TINYINT(1)
);
`,
      documento_visibilidad_user: `
DROP TABLE IF EXISTS \`documento_visibilidad_user\`;
CREATE TABLE \`documento_visibilidad_user\` (
  \`documentoId\` INT,
  \`userId\` INT
);
`,
      user: `
DROP TABLE IF EXISTS \`user\`;
CREATE TABLE \`user\` (
  \`id\` INT PRIMARY KEY,
  \`firstName\` VARCHAR(255),
  \`lastName\` VARCHAR(255),
  \`dni\` VARCHAR(50),
  \`password\` VARCHAR(255),
  \`email\` VARCHAR(255),
  \`role\` VARCHAR(50),
  \`deletedAt\` DATETIME NULL,
  \`hasImage\` TINYINT(1),
  \`isVerified\` TINYINT(1),
  \`emailVerificationToken\` VARCHAR(255),
  \`registerVerificationToken\` VARCHAR(255),
  \`resetPasswordToken\` VARCHAR(255),
  \`loginAttempts\` INT,
  \`lockUntil\` DATETIME NULL
);
`,
      user_tipo_profesional: `
DROP TABLE IF EXISTS \`user_tipo_profesional\`;
CREATE TABLE \`user_tipo_profesional\` (
  \`id\` INT PRIMARY KEY,
  \`userId\` INT,
  \`tipoProfesionalId\` INT,
  \`isCertified\` TINYINT(1)
);
`,
    };

    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10),
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    });

    const customDataQueries: { [table: string]: string } = {
      user: 'SELECT id, firstName, lastName, dni, password, email, `role`, deletedAt, hasImage, isVerified, emailVerificationToken, registerVerificationToken, resetPasswordToken, loginAttempts, lockUntil FROM `user`',
      user_tipo_profesional:
        'SELECT id, userId, tipoProfesionalId, isCertified FROM `user_tipo_profesional`',
    };

    let customBlock = '\n-- Definiciones y datos de tablas limpias\n';
    for (const table of Object.keys(customDDL)) {
      customBlock += customDDL[table] + '\n';
    }
    for (const table of Object.keys(customDataQueries)) {
      const [rows] = await connection.execute<any[]>(customDataQueries[table]);
      for (const row of rows) {
        const cols = Object.keys(row)
          .map((col) => `\`${col}\``)
          .join(', ');
        const vals = Object.values(row)
          .map((val) => this.formatValue(val))
          .join(', ');
        customBlock += `INSERT INTO \`${table}\` (${cols}) VALUES (${vals});\n`;
      }
    }
    await connection.end();

    // -----------------------------------------------------------
    // PARTE 3: Combinar todo en el archivo final
    // -----------------------------------------------------------
    const normalDumpContent = fs.readFileSync(tempDumpFile, 'utf8');
    const finalContent =
      'SET FOREIGN_KEY_CHECKS=0;\n' +
      customBlock +
      '\n' +
      normalDumpContent +
      '\nSET FOREIGN_KEY_CHECKS=1;\n';

    fs.writeFileSync(backupFile, finalContent, 'utf8');
    fs.unlinkSync(tempDumpFile);
    this.logger.log(`Copia de seguridad creada exitosamente en: ${backupFile}`);
    fs.unlinkSync(this.lockFile);
  }
}
