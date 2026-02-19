import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { PAYLOAD_KEY } from '../payload.namespace';
import { PayloadDto } from '../dto/Payload.dto';

export const PayloadParamDto = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    return request[PAYLOAD_KEY] as PayloadDto;
  },
);
