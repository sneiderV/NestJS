import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch, Post, Query, Res, SetMetadata } from '@nestjs/common';
import { Public } from 'src/common/decorators/public.decorator';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {

  constructor(
    private readonly coffeesService: CoffeesService
  ) {}


  //@SetMetadata('isPublic',true)
  @Public()  //👈 its the best practice of use @SetMetadata()
  @Get()
  //findAll(@Res() response) {
  async findAll(@Query() paginationQuery: PaginationQueryDto) {
   
    // await new Promise( resolve => { setTimeout(resolve, 5000)} ) //👈 use it if you want test Timeout interceptor
   
    const { limit, offset } = paginationQuery;
    console.log(`This action returns all coffees. Limit ${limit}, offset: ${offset}`);
    //response.status(200).send(`This action returns all coffees`);
    return this.coffeesService.findAll(paginationQuery);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
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
