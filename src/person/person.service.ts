import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { FindOptionsOrderValue, Repository } from 'typeorm';
import { Person } from './entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashProtocolService } from 'src/auth/hashing/hash.service';
import { PayloadDto } from 'src/auth/dto/Payload.dto';
import path from 'path';
import * as fs from 'fs/promises';

@Injectable()
export class PersonService {
  constructor(
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
    private readonly hashForPassword: HashProtocolService,
  ) {}

  async create(createPersonDto: CreatePersonDto): Promise<Person> {
    const passwordHash = await this.hashForPassword.hash(
      createPersonDto.password,
    );
    try {
      const newPerson = this.personRepository.create({
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash,
      });

      const person = await this.personRepository.save(newPerson);

      return person;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === '23505')
        throw new ConflictException(
          'duplicate key value violates unique constraint',
        );
      throw new BadRequestException('Error trying to create the person');
    }
  }

  async findAll() {
    const filter: { createAt: FindOptionsOrderValue } = {
      createAt: 'desc',
    };

    const people = await this.personRepository.find({
      order: filter,
    });

    return people;
  }

  async findOne(id: number) {
    const person = await this.personRepository.findOneBy({ id });
    if (!person) {
      throw new NotFoundException('Error trying to find the person');
    }
    return person;
  }

  async update(
    id: number,
    updatePersonDto: UpdatePersonDto,
    payloadDto: PayloadDto,
  ) {
    if (payloadDto.sub !== id)
      throw new UnauthorizedException(
        'Credentials do not match the this person',
      );

    const personUpdated = await this.personRepository.preload({
      id,
      name: updatePersonDto.name,
      passwordHash:
        updatePersonDto.password &&
        (await this.hashForPassword.hash(updatePersonDto.password)),
    });

    if (!personUpdated)
      throw new BadRequestException('Error trying to update the person');

    const person = this.personRepository.save(personUpdated);

    return person;
  }

  async remove(id: number, payloadDto: PayloadDto) {
    if (payloadDto.sub !== id)
      throw new UnauthorizedException(
        'Credentials do not match the this person',
      );
    const person = await this.personRepository.findOneBy({ id });

    if (!person) throw new NotFoundException('Error to find Person');
    const personDeleted = this.personRepository.remove(person);

    return personDeleted;
  }

  async uploadImage(payloadDto: PayloadDto, file: Express.Multer.File) {
    const { size, mimetype, buffer } = file;

    if (size < 1024) throw new BadRequestException('Size too small');

    const fileExtention = mimetype.split('/')[1];
    const newFileName = `${payloadDto.sub}.${fileExtention}`;
    const pathFile = path.resolve(process.cwd(), 'picture', newFileName);

    const person = await this.findOne(payloadDto.sub);
    person.pictureName = newFileName;

    await fs.writeFile(pathFile, buffer);

    const personUpdated = this.personRepository.save(person);

    return personUpdated;
  }
}
