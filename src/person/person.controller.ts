import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipeBuilder,
  HttpStatus,
} from '@nestjs/common';
import { PersonService } from './person.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { AuthGuard } from 'src/auth/guards/auth.guard';
import { PayloadDto } from 'src/auth/dto/Payload.dto';
import { PayloadParamDto } from 'src/auth/params/PayloadParamDto.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('person')
export class PersonController {
  constructor(private readonly personService: PersonService) {}

  @Post()
  create(@Body() createPersonDto: CreatePersonDto) {
    return this.personService.create(createPersonDto);
  }

  @Get()
  findAll() {
    return this.personService.findAll();
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personService.findOne(+id);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePersonDto: UpdatePersonDto,
    @PayloadParamDto() payloadDto: PayloadDto,
  ) {
    return this.personService.update(+id, updatePersonDto, payloadDto);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @PayloadParamDto() payloadDto: PayloadDto) {
    return this.personService.remove(+id, payloadDto);
  }

  @ApiBearerAuth('bearer')
  @UseGuards(AuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload-image')
  uploadImage(
    @PayloadParamDto() payloadDto: PayloadDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /jpeg|jpg|png/g,
          fallbackToMimetype: true,
        })
        .addMaxSizeValidator({
          maxSize: 10 * (1024 * 1024),
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.personService.uploadImage(payloadDto, file);
  }
}
