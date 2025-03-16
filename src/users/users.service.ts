import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { EstadoTurno } from 'src/turnos/entities/estadosTurnos.enum';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Turno } from 'src/turnos/entities/turno.entity';
import * as sharp from 'sharp';
import { EstadoConsentimiento } from 'src/tickets/entities/estadoConsentimiento.enum';
import { Role } from './entities/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    createUserDto.password = await bcryptjs.hash(createUserDto.password, 10); // Hash the password
    return await this.userRepository.save(createUserDto);
  }

  async findAll() {
    return await this.userRepository.find();
  }

  async findOne(id: number) {
    return await this.userRepository.findOneBy({ id });
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

  async findOneByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.userTipoProfesionales', 'userTipoProfesionales')
      .leftJoinAndSelect(
        'userTipoProfesionales.tipoProfesional',
        'tipoProfesional',
      )
      .getOne();
  }

  async findOneByDni(dni: string) {
    return await this.userRepository.findOneBy({ dni });
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

  async uploadImage(id: number, image: Buffer) {
    if (!image) {
      return await this.userRepository.update(id, {
        image: null,
        hasImage: false,
      });
    }

    // Comprimir la imagen y convertirla a JPEG con calidad 80%
    const compressedImage = await sharp(image).jpeg({ quality: 80 }).toBuffer();

    return await this.userRepository.update(id, {
      image: compressedImage,
      hasImage: true,
    });
  }

  async remove(id: number) {
    return await this.userRepository.softDelete(id);
  }

  async getProfesionalesByUser(id: number) {
    const user =
      (await this.userRepository.find({
        where: { id },
        relations: ['profesionales', 'profesionales.turnosProfesional'],
      })) || [];

    const profesionales = user.map((u) => u.profesionales).flat();

    for (const profesional of profesionales) {
      profesional.turnosProfesional = profesional.turnosProfesional?.filter(
        (turno) => turno.estado === EstadoTurno.Libre,
      );
    }

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
      tipo, // 'Turno en dos días' o 'Turno pendiente'
      fecha: turno.fechaHora,
      descripcion: `Turno con ${tipo === 'Turno' ? turno.paciente.firstName : turno.profesional.lastName} en ${calcularTiempoRestante(turno.fechaHora).dias > 0 ? `${calcularTiempoRestante(turno.fechaHora).dias} días,` : ''} ${calcularTiempoRestante(turno.fechaHora).horas > 0 ? `${calcularTiempoRestante(turno.fechaHora).horas} horas y` : ''} ${calcularTiempoRestante(turno.fechaHora).minutos > 0 ? `${calcularTiempoRestante(turno.fechaHora).minutos} minutos` : ''}`,
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
}
