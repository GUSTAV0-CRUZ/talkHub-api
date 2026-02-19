import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/CreateAuth.dto';
import { Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { HashProtocolService } from './hashing/hash.service';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from './configs/jwt.config';
import type { ConfigType } from '@nestjs/config';
import { RefreshTokenDto } from './dto/RefreshToken.dto';
import { PayloadDto } from './dto/Payload.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Person)
    private readonly repositoryPerson: Repository<Person>,
    private readonly hashServise: HashProtocolService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
  ) {}

  async asingJwtAsync<T>(sub: number, expiresIn: number, payload?: T) {
    const token = await this.jwtService.signAsync(
      {
        sub,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );

    return token;
  }

  async createJwts(person: Person) {
    const accessToken = await this.asingJwtAsync<Partial<Person>>(
      person.id,
      this.jwtConfiguration.jtwTtl,
      { email: person.email },
    );

    const refreshToken = await this.asingJwtAsync(
      person.id,
      this.jwtConfiguration.jtwRefresh,
    );

    return {
      accessToken,
      refreshToken,
    };
  }

  async login(createAuthDto: CreateAuthDto) {
    const person = await this.repositoryPerson.findOneBy({
      email: createAuthDto.email,
      isActive: true,
    });

    if (!person) throw new UnauthorizedException('Person Unauthorized');

    if (
      !(await this.hashServise.compare(
        createAuthDto.password,
        person.passwordHash,
      ))
    )
      throw new UnauthorizedException('Credentials Ivalid');

    return this.createJwts(person);
  }

  async refreshToken(refreshToken: RefreshTokenDto) {
    try {
      const { sub } = await this.jwtService.verifyAsync<PayloadDto>(
        refreshToken.refreshToken,
        this.jwtConfiguration,
      );

      const person = await this.repositoryPerson.findOneBy({
        id: sub,
        isActive: true,
      });

      if (!person) throw new Error();

      return this.createJwts(person);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new UnauthorizedException(error.message);
    }
  }
}
