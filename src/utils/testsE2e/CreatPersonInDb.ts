import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import request from 'supertest';
import { createPersonDtoForTest } from './CreatPersonDto';

export async function creatPersonInDb(app: INestApplication<App>) {
  const res = await request(app.getHttpServer())
    .post('/person')
    .send(createPersonDtoForTest());

  return res;
}
