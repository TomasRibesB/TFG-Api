import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
  Put,
} from '@nestjs/common';
import { PlanNutricionalService } from './plan-nutricional.service';
import { CreatePlanNutricionalDto } from './dto/create-plan-nutricional.dto';
import { UpdatePlanNutricionalDto } from './dto/update-plan-nutricional.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { RequestWithUser } from 'src/auth/interfaces/requestWithUser.interface';

@Controller('plan-nutricional')
export class PlanNutricionalController {
  constructor(
    private readonly planNutricionalService: PlanNutricionalService,
  ) {}

  @UseGuards(AuthGuard)
  @Post()
  create(
    @Req() request: RequestWithUser,
    @Body() createPlanNutricionalDto: CreatePlanNutricionalDto,
  ) {
    return this.planNutricionalService.create(
      createPlanNutricionalDto,
      request.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Put()
  update(
    @Req() request: RequestWithUser,
    @Body() updatePlanNutricionalDto: UpdatePlanNutricionalDto,
  ) {
    return this.planNutricionalService.update(
      updatePlanNutricionalDto,
      request.user.id,
    );
  }

  @UseGuards(AuthGuard)
  @Get()
  findByUser(@Req() request: RequestWithUser) {
    return this.planNutricionalService.findByUser(request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findForNutricionistByUser(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ) {
    return this.planNutricionalService.findForNutricionistByUser(
      request.user.id,
      +id,
    );
  }

  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Req() request: RequestWithUser, @Param('id') id: string) {
    return this.planNutricionalService.remove(+id, request.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':userId/visible')
  findVisiblePlansForProfesionalByUser(
    @Param('userId') userId: string,
    @Req() request: RequestWithUser,
  ) {
    return this.planNutricionalService.findVisiblePlansForProfesionalByUser(
      request.user.id,
      +userId,
    );
  }

  @UseGuards(AuthGuard)
  @Post('visibilidad/:planId')
  asignarVisibilidadDocumento(
    @Param('planId') planId: string,
    @Body('profesionalesIds') profesionalesIds: number[],
    @Req() request: RequestWithUser,
  ) {
    return this.planNutricionalService.asignarVisibilidadPlan(
      +planId,
      profesionalesIds,
      request.user.id,
    );
  }
}
