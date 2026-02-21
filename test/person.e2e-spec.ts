/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MessagesModule } from 'src/messages/messages.module';
import { PersonModule } from 'src/person/person.module';
import { AuthModule } from 'src/auth/auth.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import path from 'path';
import { creatPersonInDb } from 'src/utils/testsE2e/CreatPersonInDb';
import { createPersonDtoForTest } from 'src/utils/testsE2e/CreatPersonDto';
import { Person } from 'src/person/entities/person.entity';
import { CreateAuthDto } from 'src/auth/dto/CreateAuth.dto';
import { CreatPersonAuth } from 'src/utils/testsE2e/CreatPersonAuth';
import { UpdatePersonDto } from 'src/person/dto/update-person.dto';
import { ParseIntIdPipe } from 'src/common/pipes/parserIntId.pipe';

describe('Person (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        TypeOrmModule.forRoot({
          type: process.env.DATABASE_TYPE as 'postgres',
          host: process.env.DATABASE_HOST,
          port: Number(process.env.DATABASE_PORT),
          username: process.env.DATABASE_USERNAME,
          password: process.env.DATABASE_PASSWORD,
          database: process.env.DATABASE_DATABASE_TEST,
          autoLoadEntities: Boolean(process.env.DATABASE_AUTOLOADENTITIES),
          synchronize: Boolean(process.env.DATABASE_SYNCHRONIZE), // Apenas para desenvolvimento
          dropSchema: true,
        }),
        MessagesModule,
        PersonModule,
        AuthModule,
        ServeStaticModule.forRoot({
          rootPath: path.resolve(__dirname, '..', '..', 'picture'),
          serveRoot: '/picture/',
        }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true, // Remove campos não definidos no DTO
        forbidNonWhitelisted: true, // Lança erro se campos extras forem enviados
        transform: true, // Converte tipos automaticamente
      }),
      new ParseIntIdPipe(),
    );

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  describe('/person (GET)', () => {
    it('shold find array of Person', async () => {
      const response = await request(app.getHttpServer()).get('/person');
      expect(response.body).toEqual([]);
    });
  });

  describe('/person (POST)', () => {
    it('should created one new person', async () => {
      const createPersonDto = createPersonDtoForTest();
      const res = await creatPersonInDb(app);

      expect(res.body).toEqual({
        id: expect.any(Number),
        name: createPersonDto.name,
        email: createPersonDto.email,
        passwordHash: expect.any(String),
        isActive: true,
        pictureName: '',
        createAt: expect.any(String),
        updateAt: expect.any(String),
      });
    });

    it('Should call error of duplicate key', async () => {
      await creatPersonInDb(app);
      const res = await creatPersonInDb(app);

      expect(res.body).toEqual({
        error: 'Conflict',
        message: 'duplicate key value violates unique constraint',
        statusCode: 409,
      });
    });
  });

  describe('/auth (POST)', () => {
    it('Should authenticate one Person', async () => {
      const { email } = (await creatPersonInDb(app)).body as Person;

      const createAuthDto: CreateAuthDto = {
        email: email,
        password: createPersonDtoForTest().password,
      };

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send(createAuthDto);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
        refreshToken: expect.any(String),
      });
    });

    it('Should return "Unauthorized" for Person no existent', async () => {
      const email = 'personNoExistent@gmail.com';
      const createAuthDto: CreateAuthDto = {
        email: email,
        password: createPersonDtoForTest().password,
      };

      const res = await request(app.getHttpServer())
        .post('/auth')
        .send(createAuthDto);

      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Person Unauthorized',
        statusCode: 401,
      });
    });
  });

  describe('/person/:id (GET)', () => {
    it('Should find one Person', async () => {
      const person = await CreatPersonAuth(app);

      const res = await request(app.getHttpServer())
        .get(`/person/${person.data.id}`)
        .set('Authorization', `Bearer ${person.AccessToken}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual(person.data);
    });

    it('Should return "not found"', async () => {
      const person = await CreatPersonAuth(app);

      const res = await request(app.getHttpServer())
        .get('/person/2')
        .set('Authorization', `Bearer ${person.AccessToken}`);

      expect(res.status).toBe(404);
      expect(res.body).toEqual({
        error: 'Not Found',
        message: 'Error trying to find the person',
        statusCode: 404,
      });
    });

    it('Should return "Token required"', async () => {
      const person = await CreatPersonAuth(app);

      const res = await request(app.getHttpServer()).get(
        `/person/${person.data.id}`,
      );

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Token required',
        statusCode: 401,
      });
    });
  });

  describe('/person/:id (PATCH)', () => {
    it('Should updated one person', async () => {
      const person = await CreatPersonAuth(app);
      const updatePersonDto: UpdatePersonDto = { name: 'nameUpdated' };

      const res = await request(app.getHttpServer())
        .patch(`/person/${person.data.id}`)
        .set('Authorization', `Bearer ${person.AccessToken}`)
        .send(updatePersonDto);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        ...person.data,
        ...updatePersonDto,
        updateAt: expect.any(String),
      });
    });

    it('Should return Unauthorized to try update outher person', async () => {
      const person = await CreatPersonAuth(app);
      const updatePersonDto: UpdatePersonDto = { name: 'nameUpdated' };
      const idOutherPerson = 2;

      const res = await request(app.getHttpServer())
        .patch(`/person/${idOutherPerson}`)
        .set('Authorization', `Bearer ${person.AccessToken}`)
        .send(updatePersonDto);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Credentials do not match the this person',
        statusCode: 401,
      });
    });

    it('Should return "Token required"', async () => {
      const person = await CreatPersonAuth(app);

      const res = await request(app.getHttpServer()).patch(
        `/person/${person.data.id}`,
      );

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Token required',
        statusCode: 401,
      });
    });
  });

  describe('/person/:id (DELETE)', () => {
    it('Should to remove one person', async () => {
      const person = await CreatPersonAuth(app);

      const res = await request(app.getHttpServer())
        .delete(`/person/${person.data.id}`)
        .set('Authorization', `Bearer ${person.AccessToken}`)
        .send(`${person.data.id}`);

      expect(res.status).toBe(200);

      expect(res.body).toEqual({
        createAt: person.data.createAt,
        email: person.data.email,
        isActive: person.data.isActive,
        name: person.data.name,
        passwordHash: person.data.passwordHash,
        pictureName: person.data.pictureName,
        updateAt: person.data.updateAt,
      });
    });

    it('Should return Unauthorized to try remove outher person', async () => {
      const person = await CreatPersonAuth(app);
      const updatePersonDto: UpdatePersonDto = { name: 'nameUpdated' };
      const idOutherPerson = 2;

      const res = await request(app.getHttpServer())
        .delete(`/person/${idOutherPerson}`)
        .set('Authorization', `Bearer ${person.AccessToken}`)
        .send(updatePersonDto);

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Credentials do not match the this person',
        statusCode: 401,
      });
    });

    it('Should return "Token required"', async () => {
      const person = await CreatPersonAuth(app);

      const res = await request(app.getHttpServer()).delete(
        `/person/${person.data.id}`,
      );

      expect(res.status).toBe(401);
      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Token required',
        statusCode: 401,
      });
    });
  });

  describe('/upload-image (POST)', () => {
    it('Should upload in one image with success', async () => {
      const person = await CreatPersonAuth(app);
      const imagePath = path.resolve(__dirname, '..', 'dev', 'nestjs.png');
      const extencionFile = 'png';
      const pictureName = `${person.data.id}.${extencionFile}`;

      const res = await request(app.getHttpServer())
        .post('/person/upload-image')
        .set('Authorization', `Bearer ${person.AccessToken}`)
        .attach('file', imagePath)
        .expect(201);

      expect(res.body).toEqual({
        ...person.data,
        pictureName,
        updateAt: expect.any(String),
      });
    });

    it('Should return "Token required"', async () => {
      const imagePath = path.resolve(__dirname, '..', 'dev', 'nestjs.png');

      const res = await request(app.getHttpServer())
        .post('/person/upload-image')
        .attach('file', imagePath)
        .expect(401);

      expect(res.body).toEqual({
        error: 'Unauthorized',
        message: 'Token required',
        statusCode: 401,
      });
    });
  });
});
