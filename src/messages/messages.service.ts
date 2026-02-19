import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Message } from './entities/Message.entity';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { PersonService } from 'src/person/person.service';
import { PaginationDto } from 'src/common/dto/PaginationDto.dto';
import { PayloadDto } from 'src/auth/dto/Payload.dto';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    private readonly personService: PersonService,
  ) {}

  toAndFromFiltered() {
    return {
      to: {
        id: true,
        name: true,
        email: true,
      },
      from: {
        id: true,
        name: true,
        email: true,
      },
    };
  }

  async findAll(paginationDto: PaginationDto): Promise<Message[]> {
    const { limit = 50, offset = 0 } = paginationDto;
    const messages = await this.messageRepository.find({
      take: limit,
      skip: offset,
      relations: ['to', 'from'],
      order: {
        id: 'desc',
      },
      select: this.toAndFromFiltered(),
    });
    return messages;
  }

  async findOne(id: number): Promise<Message> {
    const message = await this.messageRepository.findOne({
      relations: ['to', 'from'],
      where: {
        id,
      },
      order: {
        id: 'desc',
      },
      select: this.toAndFromFiltered(),
    });

    if (!message) throw new NotFoundException('Message not found');

    return message;
  }

  async create(createMessageDto: CreateMessageDto, payloadDto: PayloadDto) {
    const { fromId } = createMessageDto;

    const to = await this.personService.findOne(payloadDto.sub);
    const from = await this.personService.findOne(fromId);

    const data = this.messageRepository.create({
      ...createMessageDto,
      to,
      from,
    });

    if (!data) throw new BadRequestException('Error the to creat message');

    const message = await this.messageRepository.save(data);

    return {
      id: message.id,
      text: message.text,
      read: message.read,
      to: {
        id: to.id,
        name: to.name,
        email: to.email,
      },
      from: {
        id: from.id,
        name: from.name,
        email: from.email,
      },
    };
  }

  async updatePatch(
    id: number,
    updateMessageDto: UpdateMessageDto,
    payloadDto: PayloadDto,
  ) {
    const data = await this.findOne(id);

    if (data.to.id !== payloadDto.sub)
      throw new ForbiddenException('Message do not match the this person');

    data.text = updateMessageDto.text ?? data.text;
    data.read = updateMessageDto.read ?? data.read;

    const message = await this.messageRepository.save(data);

    return message;
  }

  async remove(id: number, payloadDto: PayloadDto): Promise<Message> {
    const message = await this.findOne(id);

    if (message.to.id !== payloadDto.sub)
      throw new ForbiddenException('Message do not match the this person');

    return this.messageRepository.remove(message);
  }
}
