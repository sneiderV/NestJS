import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, SetMetadata } from '@nestjs/common';
import { ApiForbiddenResponse, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Protocol } from '../common/decorators/protocol.decorator';
import { Public } from '../common/decorators/public.decorator';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { ParseIntPipe } from '../common/pipes/parse-int.pipe';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@ApiTags('Coffees')
@Controller('coffees')
export class CoffeesController {

  constructor(
    private readonly coffeesService: CoffeesService
  ) {}


  //@ApiResponse({ status: 403, description: 'Forbidden.' })
  @ApiForbiddenResponse({description: 'Forbidden.'})
  //@SetMetadata('isPublic',true)
  @Public()  //👈 its the best practice of use @SetMetadata()
  @Get()
  //findAll(@Res() response) {
  async findAll(@Protocol('something') protocol: string, @Query() paginationQuery: PaginationQueryDto) {
   console.log(protocol);
    // await new Promise( resolve => { setTimeout(resolve, 5000)} ) //👈 use it if you want test Timeout interceptor
   
    const { limit, offset } = paginationQuery;
    console.log(`This action returns all coffees. Limit ${limit}, offset: ${offset}`);
    //response.status(200).send(`This action returns all coffees`);
    return this.coffeesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.coffeesService.findOne(id);;
  }

  @Post()
  //@HttpCode(HttpStatus.GONE)
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    console.log(createCoffeeDto instanceof CreateCoffeeDto);
    return this.coffeesService.create(createCoffeeDto);
    // return `This action creates a coffee`;
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    return this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.coffeesService.remove(id);
  }
}
