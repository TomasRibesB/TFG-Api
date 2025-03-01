import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';
import { EstadoTurno } from 'src/turnos/entities/estadosTurnos.enum';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { Turno } from 'src/turnos/entities/turno.entity';

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

  async findOneByEmail(email: string) {
    return await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .leftJoinAndSelect('user.userTipoProfesionales', 'userTipoProfesionales')
      .leftJoinAndSelect('userTipoProfesionales.tipoProfesional', 'tipoProfesional')
      .getOne();
  }

  async findOneByDni(dni: string) {
    return await this.userRepository.findOneBy({ dni });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    updateUserDto.password = await bcryptjs.hash(updateUserDto.password, 10); // Hash the password
    return await this.userRepository.update(id, updateUserDto);
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
      .andWhere('turno.estado = :estado', { estado: EstadoTurno.Pendiente })
      .getMany();

    // Consulta para tickets pendientes (tomamos como pendientes aquellos no aceptados)
    const ticketsPendientes = await this.userRepository.manager
      .getRepository(Ticket)
      .createQueryBuilder('ticket')
      .leftJoinAndSelect('ticket.receptor', 'receptor')
      .leftJoinAndSelect('ticket.solicitante', 'solicitante')
      .where('ticket.receptor = :id', { id })
      .andWhere('ticket.isAceptado = :aceptado', { aceptado: false })
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
}
