import { HttpException, HttpStatus, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Connection, Repository } from 'typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Coffee } from './entities/coffee.entity';
import { Flavor } from './entities/flavor.entity';
import { Event } from '../events/entities/event.entity';
import { ConfigService, ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';


@Injectable()
export class CoffeesService {
    constructor(
        @InjectRepository(Coffee)
        private readonly coffeeRepository: Repository<Coffee>,
        @InjectRepository(Flavor)
        private readonly flavorRepository: Repository<Flavor>,

        @Inject(coffeesConfig.KEY)   //💡 Optimal / Best-practice
        private coffeesConfiguration: ConfigType<typeof coffeesConfig>,

        private readonly configService: ConfigService,
        private readonly connection: Connection,
    ) {
        /**
        const databaseHost = this.configService.get<string>(
            // 'DATABASE_HOST' , // 👈 using a .env file 
            'database.host',     // 👈 using a custom file 
            'localhost'          // is using such us a default value
            );  
        console.log(databaseHost);
        */

        /** Using partial registration strategy  'coffees.foo' */
        const coffeesConfig_v0 = this.configService.get<string>('coffees');
        console.log(coffeesConfig_v0);

        console.log(coffeesConfiguration.foo);   // 💡 Now strongly typed, and able to access properties via:

    }

    findAll(paginationQuery: PaginationQueryDto) {
        const { limit, offset } = paginationQuery;
        return this.coffeeRepository.find({
            relations: ['flavors'],
            skip: offset,
            take: limit
        });
    }

    async findOne(id: string) {
        const coffee = await this.coffeeRepository.findOne(id, {
            relations: ['flavors']
        });
        if (!coffee) {
            // throw 'A random error -> allow not show errors from extenarl apis integrations. Its show internal server error '
            // throw new HttpException(`Coffee #${id} not found`, HttpStatus.NOT_FOUND);
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return coffee;
    }

    async create(createCoffeeDto: CreateCoffeeDto) {
        const flavors = await Promise.all(
            createCoffeeDto.flavors.map(nameFlavor => this.preloadFlavorByName(nameFlavor))
        );

        const coffeeI = await this.coffeeRepository.create({ ...createCoffeeDto, flavors });
        return this.coffeeRepository.save(coffeeI);
    }

    async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
        const flavors =
            updateCoffeeDto.flavors &&
            (await Promise.all(
                updateCoffeeDto.flavors.map(nameFlavor => this.preloadFlavorByName(nameFlavor))
            ));

        const coffeeI = await this.coffeeRepository.preload({
            id: +id,
            ...updateCoffeeDto,
            flavors
        });
        if (!coffeeI) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.save(coffeeI);
    }

    async remove(id: string) {
        const coffeeI = await this.coffeeRepository.findOne(id);
        if (!coffeeI) {
            throw new NotFoundException(`Coffee #${id} not found`);
        }
        return this.coffeeRepository.remove(coffeeI);
    }

    async recommendCoffee(coffee: Coffee) {
        const queryRunner = this.connection.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            coffee.recommendations++;

            const recommendEvent = new Event();
            recommendEvent.name = 'recommend_coffee';
            recommendEvent.type = 'coffee';
            recommendEvent.payload = { coffeeId: coffee.id };

            await queryRunner.manager.save(coffee);
            await queryRunner.manager.save(recommendEvent);

            await queryRunner.commitTransaction();
        } catch (err) {
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    private async preloadFlavorByName(name: string): Promise<Flavor> {
        const existingFlavor = await this.flavorRepository.findOne({ name });
        if (existingFlavor) {
            return existingFlavor;
        }
        return this.flavorRepository.create({ name });
    }
}
