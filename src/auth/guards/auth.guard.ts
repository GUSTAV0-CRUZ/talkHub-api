import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { ConfigType } from '@nestjs/config';
import { Request } from 'express';
import jwtConfig from '../configs/jwt.config';
import { JwtService } from '@nestjs/jwt';
import { PAYLOAD_KEY } from '../payload.namespace';
import { PayloadDto } from '../dto/Payload.dto';
import { Repository } from 'typeorm';
import { Person } from 'src/person/entities/person.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    @Inject(jwtConfig.KEY)
    private readonly jwtConfirations: ConfigType<typeof jwtConfig>,
    private readonly jwtService: JwtService,
    @InjectRepository(Person)
    private readonly personRepository: Repository<Person>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.extractTokenFromHeader(request);

    if (!token) throw new UnauthorizedException('Token required');

    try {
      const payload = await this.jwtService.verifyAsync<PayloadDto>(
        token,
        this.jwtConfirations,
      );

      const person = await this.personRepository.findOneBy({
        id: payload.sub,
        isActive: true,
      });

      if (!person) throw new UnauthorizedException('Person Unauthorized');

      request[PAYLOAD_KEY] = payload;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      throw new UnauthorizedException(error.message as string);
    }

    return true;
  }

  extractTokenFromHeader(request: Request): string | undefined {
    const authorization = request.headers.authorization?.split(' ')[1];

    return authorization;
  }
}
