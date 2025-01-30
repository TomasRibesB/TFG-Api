import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcryptjs from 'bcryptjs';

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
    return await this.userRepository.findOneBy({ email });
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
    console.log('id', id);
    const user =
      (await this.userRepository.find({
        where: { id },
        relations: ['profesionales'],
      })) || [];

    const profesionales = user.map((user) => user.profesionales).flat();
    for (const profesional of profesionales) {
      delete profesional.password;
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
}
