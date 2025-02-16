import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TurnosModule } from './turnos/turnos.module';
import { TicketsModule } from './tickets/tickets.module';
import { TicketMensajesModule } from './ticket-mensajes/ticket-mensajes.module';
import { EjerciciosModule } from './ejercicios/ejercicios.module';
import { RutinaEjercicioModule } from './rutina-ejercicio/rutina-ejercicio.module';
import { RoutinesModule } from './routines/routines.module';
import { PlanNutricionalModule } from './plan-nutricional/plan-nutricional.module';
import { DocumentosModule } from './documentos/documentos.module';
import { ChatModule } from './tickets/chat/chat.module';
import { LoggerMiddleware } from './middlewares/logger/logger.middleware';
import { TipoProfesionalModule } from './tipo-profesional/tipo-profesional.module';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: true,
      logging: false,
    }),
    UsersModule,
    AuthModule,
    EjerciciosModule,
    RutinaEjercicioModule,
    RoutinesModule,
    TurnosModule,
    TicketsModule,
    TicketMensajesModule,
    PlanNutricionalModule,
    DocumentosModule,
    ChatModule,
    TipoProfesionalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
