import { plainToInstance } from 'class-transformer';
import { CreatePersonDto } from './create-person.dto';
import { validate } from 'class-validator';

describe('create-person.dto.ts', () => {
  it('data validad', async () => {
    const createPersonDto = plainToInstance(CreatePersonDto, {
      email: 'gustavo@gmail.com',
      name: 'gustavo',
      password: '123456',
    });

    const error = await validate(createPersonDto);
    expect(error.length).toBe(0);
  });

  it('email invalid', async () => {
    const createPersonDto = plainToInstance(CreatePersonDto, {
      email: 'gustavo@.com',
      name: 'gustavo',
      password: '123456',
    });

    const error = await validate(createPersonDto);
    expect(error.length).toBe(1);
    expect(error[0].property).toBe('email');
  });

  it('name invalid', async () => {
    const createPersonDto = plainToInstance(CreatePersonDto, {
      email: 'gustavo@gmail.com',
      name: 'gu',
      password: '123456',
    });

    const error = await validate(createPersonDto);
    expect(error.length).toBe(1);
    expect(error[0].property).toBe('name');
  });

  it('password invalid', async () => {
    const createPersonDto = plainToInstance(CreatePersonDto, {
      email: 'gustavo@gmail.com',
      name: 'gustavo',
      password: '12345',
    });

    const error = await validate(createPersonDto);
    expect(error.length).toBe(1);
    expect(error[0].property).toBe('password');
  });
});
