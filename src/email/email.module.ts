import { Module } from '@nestjs/common';
import { EmailService } from './email.service';
import { EmailsController } from './email.controller';

@Module({
  providers: [EmailService],
  exports: [EmailService],
  controllers: [EmailsController],
})
export class EmailModule {}