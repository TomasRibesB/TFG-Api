import { Injectable, OnModuleInit } from '@nestjs/common';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

@Injectable()
export class CryptoService implements OnModuleInit {
  private key: Buffer;
  async onModuleInit() {
    // Lee tu clave de entorno, hex string de 64 chars → 32 bytes
    this.key = Buffer.from(process.env.FILE_ENCRYPTION_KEY, 'hex');
  }

  encrypt(buffer: Buffer): Buffer {
    const iv = randomBytes(16); // AES block size
    const cipher = createCipheriv('aes-256-cbc', this.key, iv);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);
    // Prepend IV para descifrar luego
    return Buffer.concat([iv, encrypted]);
  }

  decrypt(buffer: Buffer): Buffer {
    // Extrae el IV de los primeros 16 bytes
    const iv = buffer.slice(0, 16);
    const content = buffer.slice(16);
    const decipher = createDecipheriv('aes-256-cbc', this.key, iv);
    return Buffer.concat([decipher.update(content), decipher.final()]);
  }
}
