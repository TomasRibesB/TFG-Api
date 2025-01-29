import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { PlanNutricionalService } from './plan-nutricional.service';
import { CreatePlanNutricionalDto } from './dto/create-plan-nutricional.dto';
import { UpdatePlanNutricionalDto } from './dto/update-plan-nutricional.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';

@Controller('plan-nutricional')
export class PlanNutricionalController {
  constructor(private readonly planNutricionalService: PlanNutricionalService) {}

  @UseGuards(AuthGuard)
  @Post()
  create(@Body() createPlanNutricionalDto: CreatePlanNutricionalDto) {
    return this.planNutricionalService.create(createPlanNutricionalDto);
  }

  @UseGuards(AuthGuard)
  @Get()
  findByUser(@Req() request: RequestWithUser) {
    return this.planNutricionalService.findByUser(request.user.id);
  }
  
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.planNutricionalService.findOne(+id);
  }

  @UseGuards(AuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePlanNutricionalDto: UpdatePlanNutricionalDto) {
    return this.planNutricionalService.update(+id, updatePlanNutricionalDto);
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.planNutricionalService.remove(+id);
  }
}
