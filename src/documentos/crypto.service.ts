import { Injectable, OnModuleInit } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService implements OnModuleInit {
  private key: Buffer;

  async onModuleInit() {
    this.key = Buffer.from(process.env.FILE_ENCRYPTION_KEY, 'hex');
  }

  encryptBuffer(buffer: Buffer): Buffer {
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-cbc', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    return Buffer.concat([iv, encrypted]);
  }

  decryptBuffer(buffer: Buffer): Buffer {
    const iv = buffer.slice(0, 16);
    const content = buffer.slice(16);
    const decipher = createDecipheriv('aes-256-cbc', this.key, iv);
    return Buffer.concat([decipher.update(content), decipher.final()]);
  }

  // ——— Nuevas versiones con prefijo y try/catch ———

  encryptString(text: string): string {
    const buf = Buffer.from(text, 'utf8');
    const enc = this.encryptBuffer(buf).toString('base64');
    return `ENC:${enc}`;
  }

  decryptString(data: string): string {
    if (!data?.startsWith('ENC:')) {
      // No está marcado como cifrado, lo devuelvo tal cual
      return data;
    }

    try {
      const base64 = data.slice(4);
      const buf = Buffer.from(base64, 'base64');
      return this.decryptBuffer(buf).toString('utf8');
    } catch {
      // Si algo sale mal, devuelvo el string original
      return data;
    }
  }
}
