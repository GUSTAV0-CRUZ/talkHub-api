import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { createPersonDtoForTest } from './CreatPersonDto';
import { Person } from 'src/person/entities/person.entity';
import { CreateAuthDto } from 'src/auth/dto/CreateAuth.dto';
import { creatPersonInDb } from './CreatPersonInDb';

export async function CreatPersonAuth(app: INestApplication<App>) {
  const person = (await creatPersonInDb(app)).body as Person;

  const createAuthDto: CreateAuthDto = {
    email: person.email,
    password: createPersonDtoForTest().password,
  };

  const res = await request(app.getHttpServer())
    .post('/auth')
    .send(createAuthDto);

  return {
    data: person,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    AccessToken: res.body.accessToken as string,
  };
}
