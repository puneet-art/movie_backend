import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  private logger = new Logger('HTTP');

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();

    // Intercept writeHead to inject the Server-Timing header before headers are sent
    const oldWriteHead = res.writeHead;
    res.writeHead = function (this: Response, ...args: any[]) {
      const duration = Date.now() - start;
      this.setHeader('Server-Timing', `app;dur=${duration}`);
      return oldWriteHead.apply(this, args);
    } as any;

    res.on('finish', () => {
      const duration = Date.now() - start;
      const { method, originalUrl } = req;
      const { statusCode } = res;
      
      this.logger.log(
        `${method} ${originalUrl} ${statusCode} - ${duration}ms`,
      );
    });

    next();
  }
}
