import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { tap } from 'rxjs';

export class CountTimeExecution implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>) {
    const timeInitial = Date.now();

    return next.handle().pipe(
      tap(() => {
        const timeFinaly = Date.now();
        const resultTime = timeFinaly - timeInitial;
        console.log(`time of execution: ${resultTime}ms`);
      }),
    );
  }
}
