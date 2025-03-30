import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { EmailService } from './email.service';

@Controller('email')
export class EmailsController {
  constructor(private readonly emailService: EmailService) {}
  @Get()
  async getImage(@Res() res: Response) {
    console.log('getImage');
    res.setHeader('Content-Type', 'image/jpeg');
    res.send(await this.emailService.getIcon());
  }
}
