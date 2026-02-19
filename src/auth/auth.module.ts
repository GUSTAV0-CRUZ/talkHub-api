import { Global, Module } from '@nestjs/common';
import { HashProtocolService } from './hashing/hash.service';
import { BcryptHashService } from './hashing/bcryptHash.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Person } from 'src/person/entities/person.entity';
import jwtConfig from './configs/jwt.config';
import { JwtModule } from '@nestjs/jwt';

@Global()
@Module({
  imports: [
    TypeOrmModule.forFeature([Person]),
    ConfigModule.forFeature(jwtConfig),
    JwtModule.registerAsync(jwtConfig.asProvider()),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    {
      provide: HashProtocolService,
      useClass: BcryptHashService,
    },
  ],
  exports: [HashProtocolService, ConfigModule, JwtModule],
})
export class AuthModule {}
