import { Person } from 'src/person/entities/person.entity';

export function creatPersonMock(passwordHash?: string): Person {
  return {
    id: 1,
    email: 'teste@gmail.com',
    name: 'Teste',
    passwordHash: passwordHash ? passwordHash : 'hash',
    pictureName: 'Img.png',
  } as Person;
}
