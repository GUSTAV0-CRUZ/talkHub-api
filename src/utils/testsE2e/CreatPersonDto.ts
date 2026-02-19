import { CreatePersonDto } from 'src/person/dto/create-person.dto';

export function createPersonDtoForTest(): CreatePersonDto {
  return {
    email: 'gustavo@gmail.com',
    password: '123456',
    name: 'gustavo',
  };
}
