import { creatPersonMock } from 'src/utils/testsUnitary/creatPerson.mock';
import { CreatePersonDto } from './dto/create-person.dto';
import { PersonController } from './person.controller';
import { Person } from './entities/person.entity';
import { UpdatePersonDto } from './dto/update-person.dto';
import { PayloadDto } from 'src/auth/dto/Payload.dto';

describe('person.controller.ts', () => {
  let personController: PersonController;
  const personService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    uploadImage: jest.fn(),
  };

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    personController = new PersonController(personService as any);
  });

  it('Should checking if personController to defined', () => {
    expect(personController).toBeDefined();
  });

  describe('create', () => {
    it('Should send createPersonDto and return new person', async () => {
      const createPersonDto: CreatePersonDto = {
        email: 'gustavo@gmail.com',
        name: 'Gustavo',
        password: '123456',
      };

      const newPerson = creatPersonMock();

      jest.spyOn(personService, 'create').mockResolvedValue(newPerson);

      const result = await personController.create(createPersonDto);

      expect(personService.create).toHaveBeenCalledWith(createPersonDto);

      expect(result).toEqual(newPerson);
    });
  });

  describe('findAll', () => {
    it('Should return one array of Person', async () => {
      const arrayPerson: Person[] = [];

      jest.spyOn(personService, 'findAll').mockResolvedValue(arrayPerson);

      const result = await personController.findAll();

      expect(personService.findAll).toHaveBeenCalledTimes(1);

      expect(result).toEqual(arrayPerson);
    });
  });

  describe('findOne', () => {
    it('Should return one Person', async () => {
      const person = creatPersonMock();
      const id = '1';

      jest.spyOn(personService, 'findOne').mockResolvedValue(person);

      const result = await personController.findOne(id);

      expect(personService.findOne).toHaveBeenCalledWith(+id);

      expect(result).toEqual(person);
    });
  });

  describe('update', () => {
    it('Should send id, updatePersonDto e paloadDto and return the Person updated', async () => {
      const personUpdated = creatPersonMock();
      const id = '1';
      const updatePersonDto: UpdatePersonDto = {};
      const payloadDto = { sub: 1 } as PayloadDto;

      jest.spyOn(personService, 'update').mockResolvedValue(personUpdated);

      const result = await personController.update(
        id,
        updatePersonDto,
        payloadDto,
      );

      expect(personService.update).toHaveBeenCalledWith(
        +id,
        updatePersonDto,
        payloadDto,
      );

      expect(result).toEqual(personUpdated);
    });
  });

  describe('remove', () => {
    it('Should send id, payloadDto and to deleted one person return the Person', async () => {
      const person = creatPersonMock();
      const id = '1';
      const payloadDto = { sub: 1 } as PayloadDto;

      jest.spyOn(personService, 'remove').mockResolvedValue(person);

      const result = await personController.remove(id, payloadDto);

      expect(personService.remove).toHaveBeenCalledWith(+id, payloadDto);

      expect(result).toEqual(person);
    });
  });

  describe('uploadImage', () => {
    it('Should send payloadDto e file and return one person', async () => {
      const person = creatPersonMock();
      const payloadDto = { sub: 1 } as PayloadDto;
      const file = {} as Express.Multer.File;

      jest.spyOn(personService, 'uploadImage').mockResolvedValue(person);

      const result = await personController.uploadImage(payloadDto, file);

      expect(personService.uploadImage).toHaveBeenCalledWith(payloadDto, file);

      expect(result).toEqual(person);
    });
  });
});
