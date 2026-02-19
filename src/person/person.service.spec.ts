/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */
import { Repository } from 'typeorm';
import { PersonService } from './person.service';
import { Person } from './entities/person.entity';
import { HashProtocolService } from 'src/auth/hashing/hash.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePersonDto } from './dto/create-person.dto';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UpdatePersonDto } from './dto/update-person.dto';
import { creatPersonMock } from 'src/utils/testsUnitary/creatPerson.mock';
import path from 'path';
import * as fs from 'fs/promises';
jest.mock('fs/promises');

describe('person.service', () => {
  let personService: PersonService;
  let personRepository: Repository<Person>;
  let hashForPassword: HashProtocolService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PersonService,
        {
          provide: getRepositoryToken(Person),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOneBy: jest.fn(),
            preload: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: HashProtocolService,
          useValue: {
            hash: jest.fn(),
          },
        },
      ],
    }).compile();

    personService = module.get<PersonService>(PersonService);
    personRepository = module.get<Repository<Person>>(
      getRepositoryToken(Person),
    );
    hashForPassword = module.get<HashProtocolService>(HashProtocolService);
  });
  it('PersonService should to defined.', () => {
    expect(personService).toBeDefined();
  });

  describe('Creat', () => {
    it('Should created new Person', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'teste@gmail.com',
        name: 'Teste',
        password: '123456',
      };

      const passwordHash = 'HASHPASSWORD';

      const newPerson = creatPersonMock(passwordHash);

      jest.spyOn(hashForPassword, 'hash').mockResolvedValue(passwordHash);
      jest.spyOn(personRepository, 'create').mockReturnValue(newPerson);
      jest.spyOn(personRepository, 'save').mockResolvedValue(newPerson);

      const result = await personService.create(createPersonDto);

      expect(hashForPassword.hash).toHaveBeenCalledWith(
        createPersonDto.password,
      );

      expect(personRepository.create).toHaveBeenCalledWith({
        email: createPersonDto.email,
        name: createPersonDto.name,
        passwordHash,
      });

      expect(personRepository.save).toHaveBeenCalledWith(newPerson);

      expect(result).toEqual(newPerson);
    });

    it('Should generet error with code 23505 (duplicate key...)', async () => {
      jest.spyOn(personRepository, 'save').mockRejectedValue({
        code: '23505',
      });
      await expect(personService.create({} as any)).rejects.toThrow(
        ConflictException,
      );
    });

    it('Should generet error BadRequestException', async () => {
      jest.spyOn(personRepository, 'save').mockRejectedValue(new Error());
      await expect(personService.create({} as any)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findAll', () => {
    it('Should return array of Person', async () => {
      const filter = {
        createAt: 'desc',
      };

      const arrayPerson: Person[] = [];

      jest.spyOn(personRepository, 'find').mockResolvedValue(arrayPerson);

      const result = await personService.findAll();

      expect(personRepository.find).toHaveBeenCalledWith({
        order: filter,
      });

      expect(result).toEqual(arrayPerson);
    });
  });

  describe('finOne', () => {
    it('Should return one Person', async () => {
      const id = 1;

      const person = creatPersonMock();

      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(person);

      const result = await personService.findOne(id);

      expect(result).toEqual(person);
    });

    it('Should generet the error "NotFoundException"', async () => {
      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(null);
      await expect(personService.findOne(1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    let id = 1;

    const updatePersonDto: UpdatePersonDto = {
      name: 'newName',
    };

    const payloadDto = {
      sub: 1,
      email: 'teste@gmail.com',
    } as any;
    it('Should updated one person', async () => {
      const person = creatPersonMock();

      jest.spyOn(personRepository, 'preload').mockResolvedValue(person);
      jest.spyOn(personRepository, 'save').mockResolvedValue(person);

      const result = await personService.update(
        id,
        updatePersonDto,
        payloadDto,
      );

      expect(personRepository.preload).toHaveBeenCalledWith({
        id,
        name: updatePersonDto.name,
        passwordHash:
          updatePersonDto.password &&
          (await hashForPassword.hash(updatePersonDto.password)),
      });

      expect(personRepository.save).toHaveBeenCalledWith(person);

      expect(result).toEqual(person);
    });

    it('Shold generet the error "UnauthorizedException"', async () => {
      id = 2;
      payloadDto.sub = 1;
      await expect(
        personService.update(id, updatePersonDto, payloadDto),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('Shold generet the error "BadRequestException"', async () => {
      id = 1;
      payloadDto.sub = 1;

      jest.spyOn(personRepository, 'preload').mockResolvedValue(undefined);

      await expect(
        personService.update(id, updatePersonDto, payloadDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('remove', () => {
    let id = 1;

    const payloadDto = {
      sub: 1,
      email: 'teste@gmail.com',
    } as any;
    it('Should remove one person', async () => {
      const person = creatPersonMock();

      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(person);
      jest.spyOn(personRepository, 'remove').mockResolvedValue(person);

      const result = await personService.remove(id, payloadDto);

      expect(personRepository.findOneBy).toHaveBeenCalledWith({ id });

      expect(personRepository.remove).toHaveBeenCalledWith(person);

      expect(result).toEqual(person);
    });

    it('Shold generet the error "UnauthorizedException"', async () => {
      id = 1;
      payloadDto.sub = 2;

      await expect(personService.remove(id, payloadDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('Shold generet the error "BadRequestException"', async () => {
      id = 1;
      payloadDto.sub = 1;

      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(null);

      await expect(personService.remove(id, payloadDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('uploadImage', () => {
    const payloadDto = { sub: 1 } as any;

    const file = {
      mimetype: 'name/png',
      buffer: Buffer.from('content type'),
      size: 52920,
    } as Express.Multer.File;

    const person = creatPersonMock();

    it('Should must upload of one image and to update person', async () => {
      const pathFile = path.resolve(process.cwd(), 'picture', '1.png');

      jest.spyOn(personService, 'findOne').mockResolvedValue(person);
      jest.spyOn(personRepository, 'save').mockResolvedValue({
        ...person,
        pictureName: '1.png',
      });

      const result = await personService.uploadImage(payloadDto, file);

      expect(fs.writeFile).toHaveBeenCalledWith(pathFile, file.buffer);

      expect(personRepository.save).toHaveBeenCalledWith({
        ...person,
        pictureName: '1.png',
      });

      expect(result).toEqual({
        ...person,
        pictureName: '1.png',
      });
    });

    it('Shold generet the error "BadRequestException"', async () => {
      file.size = 1023;

      jest.spyOn(personRepository, 'findOneBy').mockResolvedValue(person);

      await expect(personService.uploadImage(payloadDto, file)).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
