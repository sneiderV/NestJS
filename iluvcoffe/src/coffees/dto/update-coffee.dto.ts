import { PartialType } from '@nestjs/swagger';
import { CreateCoffeeDto } from './create-coffee.dto';

export class UpdateCoffeeDto extends PartialType(CreateCoffeeDto) {
    
    // > Using Partial Type not require doing this 
    // readonly name?: string;
    // readonly brand?: string;
    // readonly flavors?: string[];
}