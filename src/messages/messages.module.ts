import { Module } from '@nestjs/common';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './entities/Message.entity';
import { PersonModule } from 'src/person/person.module';
import { EmailModule } from 'src/email/email.module';
import { EmailService } from 'src/email/email.service';

@Module({
  imports: [TypeOrmModule.forFeature([Message]), PersonModule, EmailModule],
  controllers: [MessagesController],
  providers: [MessagesService, EmailService],
})
export class MessagesModule {}
