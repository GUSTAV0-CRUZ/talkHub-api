import { NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

export class AuthMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // console.log(req.headers);
    const token = req.headers.authorization?.split(' ')[1];

    // if (!token || token !== 'myTokenAuth') throw new UnauthorizedException();

    req['user'] = {
      autentication: token ?? 'NoToken',
      pass: true,
      data: [req.body],
    };

    console.log(req['user']);

    next();
  }
}
