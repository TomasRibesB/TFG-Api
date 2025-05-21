// src/documentos/documentos.service.ts
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Repository, Not, IsNull, In, Brackets } from 'typeorm';
import { Documento } from './entities/documento.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateDocumentoDto } from './dto/create-documento.dto';
import { UpdateDocumentoDto } from './dto/update-documento.dto';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';
import { PermisoDocumento } from './entities/permisoDocumento.entity';
import * as sharp from 'sharp';
import { User } from 'src/users/entities/user.entity';
import { v4 as uuidv4 } from 'uuid';
import { DocumentosEmailNotificationService } from './documentos.email.notification.service';
import { CryptoService } from './crypto.service';
@Injectable()
export class DocumentosService {
  constructor(
    @InjectRepository(Documento)
    private documentoRepository: Repository<Documento>,
    @InjectRepository(TipoProfesional)
    private tipoProfesionalRepository: Repository<TipoProfesional>,
    @InjectRepository(PermisoDocumento)
    private permisoDocumentoRepository: Repository<PermisoDocumento>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly documentosEmailNotificationService: DocumentosEmailNotificationService,
    private readonly cryptoService: CryptoService,
  ) {}
  private decryptDocumento(d: Documento): Documento {
    if (d.titulo) {
      d.titulo = this.cryptoService.decryptString(d.titulo);
    }
    if (d.descripcion) {
      d.descripcion = this.cryptoService.decryptString(d.descripcion);
    }
    return d;
  }

  private decryptDocumentos(docs: Documento[]): Documento[] {
    return docs.map((d) => this.decryptDocumento(d));
  }

  async create(createDocumentoDto: CreateDocumentoDto): Promise<Documento> {
    const documento: Partial<Documento> =
      this.documentoRepository.create(createDocumentoDto);
    if (createDocumentoDto.tipoProfesionalId) {
      const tipoProfesional = await this.tipoProfesionalRepository.findOne({
        where: { id: createDocumentoDto.tipoProfesionalId },
      });
      if (!tipoProfesional) {
        throw new Error(
          `TipoProfesional con id ${createDocumentoDto.tipoProfesionalId} no encontrado`,
        );
      }
      documento.tipoProfesional = tipoProfesional;
    }
    documento.titulo = this.cryptoService.encryptString(
      createDocumentoDto.titulo,
    );
    documento.descripcion = this.cryptoService.encryptString(
      createDocumentoDto.descripcion,
    );
    documento.usuario = { id: createDocumentoDto.usuarioId } as any;
    documento.profesional = { id: createDocumentoDto.profesionalId } as any;
    return this.decryptDocumento(
      await this.documentoRepository.save(documento),
    );
  }

  async update(updateDocumentoDto: UpdateDocumentoDto): Promise<Documento> {
    const documento = await this.documentoRepository.findOne({
      where: { id: updateDocumentoDto.id },
    });
    if (!documento) {
      throw new Error(
        `Documento con id ${updateDocumentoDto.id} no encontrado`,
      );
    }
    this.documentoRepository.merge(documento, updateDocumentoDto);
    if (updateDocumentoDto.tipoProfesionalId != null) {
      const tipoProfesional = await this.tipoProfesionalRepository.findOne({
        where: { id: updateDocumentoDto.tipoProfesionalId },
      });
      if (!tipoProfesional) {
        throw new Error(
          `TipoProfesional con id ${updateDocumentoDto.tipoProfesionalId} no encontrado`,
        );
      }
      documento.tipoProfesional = tipoProfesional;
    }

    documento.titulo = this.cryptoService.encryptString(
      updateDocumentoDto.titulo,
    );
    documento.descripcion = this.cryptoService.encryptString(
      updateDocumentoDto.descripcion,
    );
    documento.usuario = { id: updateDocumentoDto.usuarioId } as any;
    documento.profesional = { id: updateDocumentoDto.profesionalId } as any;

    return this.decryptDocumento(
      await this.documentoRepository.save(documento),
    );
  }

  async uploadDocumentoArchivo(id: number, archivoBuffer: Buffer) {
    // Procesar el buffer
    let processedBuffer: Buffer;
    try {
      const metadata = await sharp(archivoBuffer).metadata();
      if (
        metadata.format &&
        ['jpeg', 'png', 'webp', 'tiff'].includes(metadata.format)
      ) {
        processedBuffer = await sharp(archivoBuffer)
          .jpeg({ quality: 80 })
          .toBuffer();
      } else {
        processedBuffer = archivoBuffer;
      }
    } catch {
      // Si Sharp no puede leer los metadatos, consideramos que no es una imagen
      processedBuffer = archivoBuffer;
      console.error('El archivo no es una imagen, se guardará sin procesar');
    }

    // Actualizar directamente en la base de datos evitando volver a insertar

    const encryptedBuffer = this.cryptoService.encryptBuffer(processedBuffer);
    await this.documentoRepository.update(id, {
      archivo: encryptedBuffer,
      hasArchivo: true,
    });
    return await this.decryptDocumento(
      await this.documentoRepository.findOne({ where: { id } }),
    );
  }

  async remove(id: number, profesionalId: number) {
    //le doy fecha de baja al documento
    const documento = await this.documentoRepository.findOne({
      where: { id, profesional: { id: profesionalId } },
    });
    if (!documento) {
      throw new Error(`Documento con id ${id} no encontrado`);
    }

    if (documento.fechaBaja) {
      documento.fechaBaja = null;
    } else {
      documento.fechaBaja = new Date();
    }
    return await this.decryptDocumento(
      await this.documentoRepository.save(documento),
    );
  }

  async findByUser(id: number): Promise<Documento[]> {
    const datos = await this.documentoRepository.find({
      where: { usuario: { id }, fechaBaja: IsNull() },
      relations: ['profesional', 'visibilidad'],
    });
    return this.decryptDocumentos(datos);
  }

  async findDocumentsForProfessionalByUser(
    profesionalId: number,
    userId: number,
  ): Promise<Documento[]> {
    const datos = await this.documentoRepository.find({
      where: {
        usuario: { id: userId },
        profesional: { id: profesionalId },
      },
      relations: ['usuario'],
    });
    return this.decryptDocumentos(datos);
  }

  async findVisibleDocumentsForProfessionalByUser(
    profesionalId: number,
    userId: number,
  ): Promise<Documento[]> {
    const commonWhere = {
      usuario: { id: userId },
      visibilidad: { id: profesionalId },
      fechaBaja: IsNull(),
    };

    const datos = await this.documentoRepository.find({
      where: [
        {
          ...commonWhere,
          profesional: { id: Not(profesionalId) },
        },
        {
          ...commonWhere,
          profesional: IsNull(),
        },
      ],
      relations: ['usuario', 'profesional', 'visibilidad'],
    });

    return this.decryptDocumentos(datos);
  }

  async asignarVisibilidadDocumento(
    documentoId: number,
    profesionalesIds: number[],
    userId: number,
  ) {
    const documento = await this.documentoRepository.findOne({
      where: { id: documentoId, usuario: { id: userId } },
    });
    if (!documento) {
      throw new Error(`Documento con id ${documentoId} no encontrado`);
    }

    const profesionales = await this.userRepository.findBy({
      id: In(profesionalesIds),
    });

    documento.visibilidad = profesionales;
    return await this.decryptDocumento(
      await this.documentoRepository.save(documento),
    );
  }

  async findOneWithArchivo(id: number, userId: number): Promise<Documento> {
    const documento = await this.documentoRepository
      .createQueryBuilder('documento')
      .addSelect('documento.archivo')
      .leftJoin('documento.profesional', 'profesional')
      .leftJoin('documento.visibilidad', 'visibilidad')
      .leftJoin('documento.usuario', 'usuario')
      .where('documento.id = :id', { id })
      .andWhere('documento.fechaBaja IS NULL')
      .andWhere(
        new Brackets((qb) => {
          qb.where('visibilidad.id = :userId', { userId })
            .orWhere('usuario.id = :userId', { userId })
            .orWhere('profesional.id = :userId', { userId });
        }),
      )
      .getOne();

    if (!documento) {
      throw new Error(`Documento con id ${id} no encontrado`);
    }
    return this.decryptDocumento(documento);
  }

  async createPermisoDocumento(usuarioId: number): Promise<PermisoDocumento> {
    const permisoActivo = await this.permisoDocumentoRepository.findOne({
      where: { usuario: { id: usuarioId }, fechaBaja: IsNull() },
    });

    if (permisoActivo) {
      throw new UnauthorizedException(
        `PermisoDocumento para el usuario con id ${usuarioId} ya existe`,
      );
    }

    const permisoDocumento = this.permisoDocumentoRepository.create({
      code: uuidv4(),
      usuario: { id: usuarioId } as User,
    });
    return await this.permisoDocumentoRepository.save(permisoDocumento);
  }

  async getUserPermisoDocumento(code: string): Promise<PermisoDocumento> {
    const permisoDocumento = await this.permisoDocumentoRepository.findOne({
      where: { code },
      relations: ['usuario'],
    });
    if (!permisoDocumento) {
      throw new NotFoundException(
        `PermisoDocumento con code ${code} no encontrado`,
      );
    }
    if (permisoDocumento.fechaBaja) {
      throw new UnauthorizedException(
        `PermisoDocumento con code ${code} dado de baja`,
      );
    }
    return permisoDocumento;
  }

  async getPermisoDocumentoByUser(userId: number): Promise<PermisoDocumento> {
    console.log(userId);
    return await this.permisoDocumentoRepository.findOne({
      where: { usuario: { id: userId }, fechaBaja: IsNull() },
    });
  }

  async deletePermisoDocumentoByUser(userId: number) {
    const permisoDocumento = await this.permisoDocumentoRepository.findOne({
      where: { usuario: { id: userId }, fechaBaja: IsNull() },
    });
    if (!permisoDocumento) {
      throw new NotFoundException(
        `PermisoDocumento para el usuario con id ${userId} no encontrado`,
      );
    }
    permisoDocumento.fechaBaja = new Date();
    return await this.permisoDocumentoRepository.save(permisoDocumento);
  }

  async createByNoUser(createDocumentoDto: CreateDocumentoDto, code: string) {
    const permisoDocumento = await this.permisoDocumentoRepository.findOne({
      where: { code },
      relations: ['usuario'],
    });

    if (!permisoDocumento) {
      throw new NotFoundException(
        `PermisoDocumento con code ${code} no encontrado`,
      );
    }
    if (permisoDocumento.fechaBaja) {
      throw new UnauthorizedException(
        `PermisoDocumento con code ${code} dado de baja`,
      );
    }
    createDocumentoDto.titulo = this.cryptoService.encryptString(
      createDocumentoDto.titulo,
    );
    createDocumentoDto.descripcion = this.cryptoService.encryptString(
      createDocumentoDto.descripcion,
    );
    const newDocumento = this.documentoRepository.create({
      ...createDocumentoDto,
      usuario: { id: permisoDocumento.usuario.id },
      tipoProfesional: { id: createDocumentoDto.tipoProfesionalId },
    });
    const result = await this.documentoRepository.save(newDocumento);

    let documentoResult: Documento = await this.documentoRepository.findOne({
      where: { id: result.id },
      relations: ['usuario'],
    });

    documentoResult = this.decryptDocumento(documentoResult);

    // Enviar notificación por correo electrónico
    await this.documentosEmailNotificationService.enviarNotificacionArchivoProfesionalExterno(
      documentoResult,
    );

    return this.decryptDocumento(result);
  }

  async uploadDocumentoArchivoByNoUser(
    id: number,
    archivoBuffer: Buffer,
    code: string,
  ) {
    const permisoDocumento = await this.permisoDocumentoRepository.findOne({
      where: { code },
      relations: ['usuario'],
    });
    if (!permisoDocumento) {
      throw new NotFoundException(
        `PermisoDocumento con code ${code} no encontrado`,
      );
    }
    if (permisoDocumento.fechaBaja) {
      throw new UnauthorizedException(
        `PermisoDocumento con code ${code} dado de baja`,
      );
    }

    permisoDocumento.fechaBaja = new Date();
    await this.permisoDocumentoRepository.save(permisoDocumento);
    // Procesar el buffer
    let processedBuffer: Buffer;
    try {
      const metadata = await sharp(archivoBuffer).metadata();
      if (
        metadata.format &&
        ['jpeg', 'png', 'webp', 'tiff'].includes(metadata.format)
      ) {
        processedBuffer = await sharp(archivoBuffer)
          .jpeg({ quality: 80 })
          .toBuffer();
      } else {
        processedBuffer = archivoBuffer;
      }
    } catch {
      // Si Sharp no puede leer los metadatos, consideramos que no es una imagen
      processedBuffer = archivoBuffer;
      console.error('El archivo no es una imagen, se guardará sin procesar');
    }

    // Actualizar directamente en la base de datos evitando volver a insertar
    const encryptedBuffer = this.cryptoService.encryptBuffer(processedBuffer);
    await this.documentoRepository.update(id, {
      archivo: encryptedBuffer,
      hasArchivo: true,
    });
    return await this.decryptDocumento(
      await this.documentoRepository.findOne({ where: { id } }),
    );
  }
  async deleteDocumentoHard(
    documentoId: number,
    userId: number,
  ): Promise<void> {
    const documento = await this.documentoRepository.findOne({
      where: { id: documentoId },
      relations: ['usuario', 'visibilidad'],
    });
    if (!documento) {
      throw new NotFoundException(
        `Documento con id ${documentoId} no encontrado`,
      );
    }
    if (documento.usuario.id !== userId) {
      throw new UnauthorizedException(
        `No tienes permisos para eliminar este documento`,
      );
    }
    // Limpiar las relaciones de visibilidad
    documento.visibilidad = [];
    await this.decryptDocumento(await this.documentoRepository.save(documento));
    // Borrar definitivamente el documento
    await this.documentoRepository.remove(documento);
  }
}
