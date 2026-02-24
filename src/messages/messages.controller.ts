import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/CreateMessage.dto';
import { UpdateMessageDto } from './dto/UpdateMessage.dto';
import { PaginationDto } from 'src/common/dto/PaginationDto.dto';
import { PayloadDto } from 'src/auth/dto/Payload.dto';
import { PayloadParamDto } from 'src/auth/params/PayloadParamDto.decorator';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('messages')
export class MessagesController {
  constructor(private messagesService: MessagesService) {}

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.messagesService.findAll(paginationDto);
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.messagesService.findOne(id);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @Post()
  create(
    @Body() CreateMessageDto: CreateMessageDto,
    @PayloadParamDto() payloadDto: PayloadDto,
  ) {
    return this.messagesService.create(CreateMessageDto, payloadDto);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateMessageDto: UpdateMessageDto,
    @PayloadParamDto() payloadDto: PayloadDto,
  ) {
    return this.messagesService.updatePatch(id, updateMessageDto, payloadDto);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @HttpCode(200)
  @Delete(':id')
  remove(@Param('id') id: number, @PayloadParamDto() payloadDto: PayloadDto) {
    return this.messagesService.remove(id, payloadDto);
  }
}
