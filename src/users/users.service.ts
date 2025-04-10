import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Brackets, In, Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { EstadoTurno } from 'src/turnos/entities/estadosTurnos.enum';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Turno } from 'src/turnos/entities/turno.entity';
import * as sharp from 'sharp';
import { EstadoConsentimiento } from 'src/tickets/entities/estadoConsentimiento.enum';
import { Role } from './entities/role.enum';
import { TipoProfesional } from 'src/tipo-profesional/entities/tipo-profesional.entity';
import { UserTipoProfesional } from 'src/tipo-profesional/entities/user-tipo-profesional.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(TipoProfesional)
    private tipoProfesionalRepository: Repository<TipoProfesional>,
    @InjectRepository(UserTipoProfesional)
    private userTipoProfesionalRepository: Repository<UserTipoProfesional>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    console.log('createUserDto', createUserDto);
    createUserDto.password = await bcryptjs.hash(createUserDto.password, 10); // Hash the password
    return await this.userRepository.save(createUserDto);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      relations: ['userTipoProfesionales.tipoProfesional'],
    });
  }

  async findOneImage(id: number) {
    return await this.userRepository.findOne({
      where: { id },
      select: ['image'],
    });
  }

  async veifyUserIsProfesional(id: number) {
    return !!(await this.userRepository.findOne({
      where: {
        id,
        role: In([Role.Profesional, Role.Nutricionista, Role.Entrenador]),
      },
    }));
  }

  async findOneByEmail(email: string, isVerified = false) {
    const qb = this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .withDeleted()
      .leftJoinAndSelect('user.userTipoProfesionales', 'userTipoProfesionales')
      .leftJoinAndSelect(
        'userTipoProfesionales.tipoProfesional',
        'tipoProfesional',
      );

    if (isVerified) {
      qb.andWhere('user.isVerified = :isVerified', { isVerified: true });
    }
    return qb.getOne();
  }

  async findOneByDni(dni: string) {
    return await this.userRepository.findOne({
      where: { dni },
      withDeleted: true,
    });
  }

  async updateEmail(id: number, email: string) {
    return await this.userRepository.update(id, { email });
  }

  async updatePassword(id: number, newPassword: string, oldPassword: string) {
    console.log('newPassword', newPassword, 'oldPassword', oldPassword);
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['password'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return null;
    }

    const password = await bcryptjs.hash(newPassword, 10);
    return await this.userRepository.update(id, { password });
  }

  async findOneByEmailVerificationToken(token: string) {
    return await this.userRepository.findOne({
      where: { emailVerificationToken: token },
    });
  }

  async findOneByEmailPasswordResetToken(token: string) {
    return await this.userRepository.findOne({
      where: { resetPasswordToken: token },
    });
  }

  async updateUserVerificationToken(id: number) {
    return await this.userRepository.update(id, {
      isVerified: true,
      emailVerificationToken: null,
    });
  }

  async setPasswordResetToken(id: number, token: string) {
    return await this.userRepository.update(id, {
      resetPasswordToken: token,
    });
  }

  async denyPasswordResetToken(id: number) {
    return await this.userRepository.update(id, {
      resetPasswordToken: null,
    });
  }

  async updateUserResetPasswordToken(id: number, password: string) {
    return await this.userRepository.update(id, {
      resetPasswordToken: null,
      password,
    });
  }

  async uploadImage(id: number, image: Buffer) {
    try {
      if (!image) {
        return await this.userRepository.update(id, {
          image: null,
          hasImage: false,
        });
      }

      // Comprimir la imagen y convertirla a JPEG con calidad 80%
      const compressedImage = await sharp(image)
        .jpeg({ quality: 80 })
        .toBuffer();

      console.log('compressedImage', compressedImage);
      return await this.userRepository.update(id, {
        image: compressedImage,
        hasImage: true,
      });
    } catch (error) {
      console.log('error', error);
    }
  }

  async uploadCertificate(
    userTipoProfesionalId: number,
    userId: number,
    certificate: Buffer,
  ) {
    if (!certificate) {
      throw new NotFoundException('No se ha subido un certificado');
    }

    return await this.userTipoProfesionalRepository.update(
      { id: userTipoProfesionalId, user: { id: userId } },
      {
        archivo: certificate,
      },
    );
  }

  async softDelete(id: number) {
    if (!(await this.userRepository.findOneBy({ id }))) {
      throw new NotFoundException('User not found');
    }
    return await this.userRepository.softDelete(id);
  }

  async getProfesionalesByUser(id: number) {
    const userWithProfesionales = await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profesionales', 'profesional')
      .leftJoinAndSelect(
        'profesional.turnosProfesional',
        'turno',
        'turno.fechaHora > :fecha AND ((turno.estado = :estadoLibre AND turno.paciente IS NULL) OR turno.paciente.id = :id)',
        {
          fecha: new Date(new Date().getTime() - 1000 * 60 * 60),
          estadoLibre: EstadoTurno.Libre,
          id,
        },
      )
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .leftJoinAndSelect(
        'profesional.userTipoProfesionales',
        'userTipoProfesional',
      )
      .leftJoinAndSelect(
        'userTipoProfesional.tipoProfesional',
        'tipoProfesional',
      )
      .where('user.id = :id', { id })
      .orderBy('turno.fechaHora', 'ASC')
      .getOne();

    const profesionales = userWithProfesionales?.profesionales || [];

    return profesionales;
  }

  async getUsuariosByProfesional(id: number) {
    const user =
      (await this.userRepository.find({
        where: { id },
        relations: ['usuarios'],
      })) || [];

    const usuarios = user.map((user) => user.usuarios).flat();
    for (const usuario of usuarios) {
      delete usuario.password;
    }
    return usuarios;
  }

  async getRecordatoriosByProfesional(id: number) {
    const fechaObjetivo = new Date();
    fechaObjetivo.setDate(fechaObjetivo.getDate() + 2); // 2 días después
    const inicioDelDia = new Date(fechaObjetivo);
    inicioDelDia.setHours(0, 0, 0, 0);
    const finDelDia = new Date(fechaObjetivo);
    finDelDia.setHours(23, 59, 59, 999);

    // Si la hora actual ya es mayor al inicio del día dos días después, usamos la hora actual como inicio de la consulta
    const now = new Date();
    const inicioConsulta = now > inicioDelDia ? now : inicioDelDia;

    const turnosEnDosDias = await this.userRepository.manager
      .getRepository(Turno)
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.profesional', 'profesional')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .where('turno.profesional = :id', { id })
      .andWhere('turno.paciente IS NOT NULL')
      .andWhere('turno.fechaHora BETWEEN :inicioConsulta AND :finDelDia', {
        inicioConsulta,
        finDelDia,
      })
      .getMany();

    // Consulta para turnos pendientes
    const turnosPendientes = await this.userRepository.manager
      .getRepository(Turno)
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.profesional', 'profesional')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .where('turno.profesional = :id', { id })
      .andWhere('turno.paciente IS NOT NULL')
      .andWhere('turno.estado = :estado', { estado: EstadoTurno.Pendiente })
      .getMany();

    // Consulta para tickets pendientes (tomamos como pendientes aquellos no donde el concentimiento de alguno de los usuarios sea Pendiente)
    const ticketsPendientes = await this.userRepository.manager
      .getRepository(Ticket)
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.receptor', 'receptor')
      .leftJoinAndSelect('ticket.solicitante', 'solicitante')
      .where('ticket.receptor = :id', { id })
      .andWhere(
        'ticket.consentimientoReceptor = :aceptado OR ticket.consentimientoReceptor = :pendiente',
        {
          aceptado: EstadoConsentimiento.Aceptado,
          pendiente: EstadoConsentimiento.Pendiente,
        },
      )
      .andWhere(
        'ticket.consentimientoSolicitante = :aceptado OR ticket.consentimientoSolicitante = :pendiente',
        {
          aceptado: EstadoConsentimiento.Aceptado,
          pendiente: EstadoConsentimiento.Pendiente,
        },
      )
      .andWhere(
        'ticket.consentimientoUsuario = :aceptado OR ticket.consentimientoUsuario = :pendiente',
        {
          aceptado: EstadoConsentimiento.Aceptado,
          pendiente: EstadoConsentimiento.Pendiente,
        },
      )
      .andWhere('ticket.fechaBaja IS NULL')
      .getMany();

    const calcularTiempoRestante = (fecha: Date) => {
      const tiempoRestante = fecha.getTime() - new Date().getTime();
      const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutos = Math.floor(
        (tiempoRestante % (1000 * 60 * 60)) / (1000 * 60),
      );
      return { dias, horas, minutos };
    };

    // Formatear los resultados a { id, tipo, fecha, descripcion }
    const formatTurno = (turno: Turno, tipo: string) => ({
      id: turno.id,
      tipo,
      fecha: turno.fechaHora,
      descripcion: `Turno con ${turno.paciente.firstName} ${turno.paciente.lastName} en ${calcularTiempoRestante(turno.fechaHora).dias > 0 ? `${calcularTiempoRestante(turno.fechaHora).dias} días,` : ''} ${calcularTiempoRestante(turno.fechaHora).horas > 0 ? `${calcularTiempoRestante(turno.fechaHora).horas} horas y` : ''} ${calcularTiempoRestante(turno.fechaHora).minutos > 0 ? `${calcularTiempoRestante(turno.fechaHora).minutos} minutos` : ''}`,
    });

    const formatTicket = (ticket: Ticket) => ({
      id: ticket.id,
      tipo: 'Ticket',
      fecha: ticket.fechaCreacion,
      descripcion: `Ticket sobre ${ticket.asunto} de ${ticket.solicitante.firstName} ${ticket.solicitante.lastName} pendiente`,
    });

    // Mapear cada resultado según su tipo
    const recordatoriosTurnosEnDosDias = turnosEnDosDias.map((turno) =>
      formatTurno(turno, 'Turno'),
    );
    const recordatoriosTurnosPendientes = turnosPendientes.map((turno) =>
      formatTurno(turno, 'Turno'),
    );
    const recordatoriosTickets = ticketsPendientes.map((ticket) =>
      formatTicket(ticket),
    );

    return [
      ...recordatoriosTurnosEnDosDias,
      ...recordatoriosTurnosPendientes,
      ...recordatoriosTickets,
    ];
  }

  async getRecordatoriosByUser(id: number) {
    const fechaObjetivo = new Date();
    fechaObjetivo.setDate(fechaObjetivo.getDate() + 2); // 2 días después
    const inicioDelDia = new Date(fechaObjetivo);
    inicioDelDia.setHours(0, 0, 0, 0);
    const finDelDia = new Date(fechaObjetivo);
    finDelDia.setHours(23, 59, 59, 999);

    // Si la hora actual ya es mayor al inicio del día dos días después, usamos la hora actual como inicio de la consulta
    const now = new Date();
    const inicioConsulta = now > inicioDelDia ? now : inicioDelDia;

    // Obtener turnos en dos días donde el usuario es el paciente
    const turnosEnDosDias = await this.userRepository.manager
      .getRepository(Turno)
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.profesional', 'profesional')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .where('turno.paciente = :id', { id })
      .andWhere('turno.fechaHora BETWEEN :inicioConsulta AND :finDelDia', {
        inicioConsulta,
        finDelDia,
      })
      .getMany();

    // Obtener turnos pendientes para el usuario, donde es el paciente
    const turnosPendientes = await this.userRepository.manager
      .getRepository(Turno)
      .createQueryBuilder('turno')
      .leftJoinAndSelect('turno.profesional', 'profesional')
      .leftJoinAndSelect('turno.paciente', 'paciente')
      .where('turno.paciente = :id', { id })
      .andWhere('turno.estado = :estado', { estado: EstadoTurno.Pendiente })
      .getMany();

    // Obtener tickets pendientes donde el usuario es el solicitante
    const ticketsPendientes = await this.userRepository.manager
      .getRepository(Ticket)
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.receptor', 'receptor')
      .leftJoinAndSelect('ticket.solicitante', 'solicitante')
      .where('ticket.solicitante = :id', { id })
      .andWhere(
        new Brackets((qb) => {
          qb.where('ticket.consentimientoReceptor = :aceptado', {
            aceptado: EstadoConsentimiento.Aceptado,
          }).orWhere('ticket.consentimientoReceptor = :pendiente', {
            pendiente: EstadoConsentimiento.Pendiente,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('ticket.consentimientoSolicitante = :aceptado', {
            aceptado: EstadoConsentimiento.Aceptado,
          }).orWhere('ticket.consentimientoSolicitante = :pendiente', {
            pendiente: EstadoConsentimiento.Pendiente,
          });
        }),
      )
      .andWhere(
        new Brackets((qb) => {
          qb.where('ticket.consentimientoUsuario = :aceptado', {
            aceptado: EstadoConsentimiento.Aceptado,
          }).orWhere('ticket.consentimientoUsuario = :pendiente', {
            pendiente: EstadoConsentimiento.Pendiente,
          });
        }),
      )
      .andWhere('ticket.fechaBaja IS NULL')
      .getMany();

    const calcularTiempoRestante = (fecha: Date) => {
      const tiempoRestante = fecha.getTime() - new Date().getTime();
      const dias = Math.floor(tiempoRestante / (1000 * 60 * 60 * 24));
      const horas = Math.floor(
        (tiempoRestante % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutos = Math.floor(
        (tiempoRestante % (1000 * 60 * 60)) / (1000 * 60),
      );
      return { dias, horas, minutos };
    };

    // Formatear los turnos mostrando el nombre del profesional
    const formatTurno = (turno: Turno) => {
      if (turno.estado !== EstadoTurno.Confirmado || !turno.fechaHora) {
        return {
          id: turno.id,
          tipo: 'Turno',
          fecha: turno.fechaHora,
          descripcion: `Turno con ${turno.profesional.firstName} ${turno.profesional.lastName} en estado ${turno.estado}`,
        };
      }
      return {
        id: turno.id,
        tipo: 'Turno',
        fecha: turno.fechaHora,
        descripcion: `Turno con ${turno.profesional.firstName} ${turno.profesional.lastName} en ${
          calcularTiempoRestante(turno.fechaHora).dias > 0
            ? `${calcularTiempoRestante(turno.fechaHora).dias} días, `
            : ''
        }${
          calcularTiempoRestante(turno.fechaHora).horas > 0
            ? `${calcularTiempoRestante(turno.fechaHora).horas} horas y `
            : ''
        }${
          calcularTiempoRestante(turno.fechaHora).minutos > 0
            ? `${calcularTiempoRestante(turno.fechaHora).minutos} minutos`
            : ''
        }`,
      };
    };

    // Formatear los tickets mostrando el nombre del receptor (por lo general, el profesional)
    const formatTicket = (ticket: Ticket) => ({
      id: ticket.id,
      tipo: 'Ticket',
      fecha: ticket.fechaCreacion,
      descripcion: `Ticket sobre ${ticket.asunto} de ${ticket.receptor.firstName} ${ticket.receptor.lastName} pendiente`,
    });

    const recordatoriosTurnosEnDosDias = turnosEnDosDias.map((turno) =>
      formatTurno(turno),
    );
    const recordatoriosTurnosPendientes = turnosPendientes.map((turno) =>
      formatTurno(turno),
    );
    const recordatoriosTickets = ticketsPendientes.map((ticket) =>
      formatTicket(ticket),
    );

    return [
      ...recordatoriosTurnosEnDosDias,
      ...recordatoriosTurnosPendientes,
      ...recordatoriosTickets,
    ];
  }

  async getUserByProfesional(profesionalId: number, userId: number) {
    return await this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.profesionales', 'profesional')
      .where('user.id = :userId', { userId })
      .andWhere('profesional.id = :profesionalId', { profesionalId })
      .getOne();
  }

  async getUserByDNIForProfesional(profesionalId: number, dni: string) {
    if (!dni) throw new NotFoundException('DNI no encontrado');
    return await this.userRepository
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.dni',
        'user.firstName',
        'user.lastName',
        'user.hasImage',
      ])
      .where('user.dni = :dni', { dni })
      .andWhere('user.id != :profesionalId', { profesionalId })
      .andWhere('user.role = :role', { role: Role.Usuario })
      .getOne();
  }

  async getProfesionalsByUserForTicketsCreation(
    userId: number,
    profesionalId: number,
  ) {
    console.log('userId', userId, 'profesionalId', profesionalId);
    const user = await this.getUserByProfesional(profesionalId, userId);
    if (!user) {
      throw new NotFoundException('Profesional no encontrado');
    }

    return await this.userRepository
      .createQueryBuilder('user')
      .select(['user.id', 'user.firstName', 'user.lastName'])
      .leftJoin('user.profesionales', 'profesional')
      .leftJoin('profesional.userTipoProfesionales', 'userTipoProfesional')
      .leftJoinAndSelect(
        'userTipoProfesional.tipoProfesional',
        'tipoProfesional',
      )
      .addSelect([
        'profesional.id',
        'profesional.firstName',
        'profesional.lastName',
      ])
      .where('user.id = :userId', { userId })
      .andWhere('profesional.id != :profesionalId', { profesionalId })
      .getOne();
  }

  async asignarUsuarioAProfesional(profesionalId: number, userId: number) {
    if (!(await this.veifyUserIsProfesional(profesionalId)))
      throw new NotFoundException('El profesional no existe');
    if (await this.veifyUserIsProfesional(userId))
      throw new NotFoundException('El usuario es un profesional');

    const profesional = await this.userRepository.findOne({
      where: { id: profesionalId },
      relations: ['usuarios'],
    });
    if (!profesional) throw new NotFoundException('El profesional no existe');

    const usuario = await this.userRepository.findOneBy({ id: userId });
    if (!usuario) throw new NotFoundException('El usuario no existe');

    profesional.usuarios = [...(profesional.usuarios || []), usuario];
    const result = await this.userRepository.save(profesional);

    if (!result) throw new NotFoundException('Error al asignar el usuario');
    return await this.getUserByProfesional(profesionalId, userId);
  }

  async assignTipoProfesionales(
    userId: number,
    tipoProfesionalIds: number[] = [],
  ) {
    if (tipoProfesionalIds.length === 0) {
      const userTipoProf = new UserTipoProfesional();
      userTipoProf.user = { id: userId } as User;
      userTipoProf.tipoProfesional = null;
      await this.userTipoProfesionalRepository.save(userTipoProf);
    } else {
      for (const tipoId of tipoProfesionalIds) {
        const tipo = await this.tipoProfesionalRepository.findOne({
          where: { id: tipoId },
        });
        if (!tipo) {
          throw new NotFoundException(
            `TipoProfesional con id ${tipoId} no encontrado`,
          );
        }
        const userTipoProf = new UserTipoProfesional();
        userTipoProf.user = { id: userId } as User;
        userTipoProf.tipoProfesional = tipo;
        await this.userTipoProfesionalRepository.save(userTipoProf);
      }
    }
  }

  async getTiposProfesional() {
    return await this.tipoProfesionalRepository.find();
  }

  async getUserByUser(id: number) {
    return await this.userRepository.findOneBy({ id });
  }

  async incrementLoginAttempts(userId: number) {
    await this.userRepository.increment({ id: userId }, 'loginAttempts', 1);
  }

  async setLockUntil(userId: number, lockUntil: Date) {
    await this.userRepository.update(userId, { lockUntil });
  }

  async resetLoginAttempts(userId: number) {
    await this.userRepository.update(userId, {
      loginAttempts: 0,
      lockUntil: null,
    });
  }

  async getAllProfesionales(userId: number) {
    //verifico si eres administrador
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) throw new NotFoundException('El usuario no existe');
    if (user.role === Role.Administrador) {
      return await this.userRepository
        .createQueryBuilder('user')
        .addSelect('user.deletedAt')
        .leftJoinAndSelect(
          'user.userTipoProfesionales',
          'userTipoProfesionales',
        )
        .leftJoinAndSelect(
          'userTipoProfesionales.tipoProfesional',
          'tipoProfesional',
        )
        .where('user.role IN (:...roles)', {
          roles: [Role.Profesional, Role.Nutricionista, Role.Entrenador],
        })
        .orderBy('userTipoProfesionales.isCertified', 'ASC')
        .addOrderBy('user.firstName', 'ASC')
        .withDeleted()
        .getMany();
    } else {
      throw new UnauthorizedException(
        'No tienes permisos para ver todos los profesionales',
      );
    }
  }

  async setBajaOrCertificate(
    userId: number,
    userTipoProfesionalId: number,
    profesionalId: number,
    isCertified: boolean,
  ) {
    //verifico si eres administrador
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('El usuario no existe');
    if (user.role === Role.Administrador) {
      const profesional = await this.userRepository.findOne({
        where: { id: profesionalId },
        relations: ['userTipoProfesionales'],
        withDeleted: true,
      });
      if (!profesional) throw new NotFoundException('El profesional no existe');
      if (isCertified) {
        await this.userTipoProfesionalRepository.update(
          {
            id: userTipoProfesionalId,
          },
          { isCertified: true },
        );
        await this.userRepository.restore(profesionalId);
        return true;
      } else {
        await this.userTipoProfesionalRepository.update(
          {
            id: userTipoProfesionalId,
          },
          { isCertified: false },
        );
        await this.userRepository.softDelete(profesionalId);

        return true;
      }
    } else {
      throw new UnauthorizedException(
        'No tienes permisos para ver todos los profesionales',
      );
    }
  }

  async getCertificadoByProfesional(
    userId: number,
    profesionalId: number,
    userTipoProfesionalId: number,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });
    if (!user) throw new NotFoundException('El usuario no existe');
    if (user.role !== Role.Administrador) {
      throw new UnauthorizedException(
        'No tienes permisos para ver todos los profesionales',
      );
    }

    const userTipoProfesional =
      await this.userTipoProfesionalRepository.findOne({
        where: { id: userTipoProfesionalId, user: { id: profesionalId } },
        relations: ['tipoProfesional'],
        select: { id: true, archivo: true },
      });
    if (!userTipoProfesional) {
      throw new NotFoundException('El certificado no existe');
    }
    return userTipoProfesional.archivo;
  }
}
