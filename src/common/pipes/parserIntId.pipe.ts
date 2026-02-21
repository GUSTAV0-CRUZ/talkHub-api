import {
  ArgumentMetadata,
  BadRequestException,
  PipeTransform,
} from '@nestjs/common';

export class ParseIntIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    if (metadata.type !== 'param' || metadata.data !== 'id') return value;

    const transformValue = Number(value);

    if (isNaN(transformValue))
      throw new BadRequestException('Param of request must is a Number');

    if (transformValue < 0)
      throw new BadRequestException(
        'Number of request not must less than zero',
      );

    return transformValue;
  }
}
