import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  public reset = '\x1b[0m';
  public blue = '\x1b[34m';
  public yellow = '\x1b[33m';
  public green = '\x1b[32m';
  public cyan = '\x1b[36m';
  public red = '\x1b[31m';
  public labelGray = '\x1b[90m';
  use(req: Request, res: Response, next: NextFunction) {
    const loggerOn = true;
    if (!loggerOn) {
      next();
      return;
    }
    function truncateLongStrings(obj: any, maxLength: number = 50): any {
      if (typeof obj === 'string') {
        if (obj.length > maxLength) {
          return `${obj.slice(0, 3)}...${obj.slice(-3)}`;
        }
        return obj;
      } else if (Array.isArray(obj)) {
        return obj.map((item) => truncateLongStrings(item, maxLength));
      } else if (typeof obj === 'object' && obj !== null) {
        const newObj: any = {};
        for (const key in obj) {
          newObj[key] = truncateLongStrings(obj[key], maxLength);
        }
        return newObj;
      }
      return obj;
    }
    const truncatedBody = truncateLongStrings(req.body);
    console.log(
      `${this.blue}${req.method}${this.reset} ${this.yellow}${req.originalUrl}${this.reset}\n` +
        `${this.labelGray}Query: ${this.green}${JSON.stringify(req.query)}${this.reset}\n` +
        `${this.labelGray}Body: ${this.cyan}${JSON.stringify(truncatedBody, null, 2)}${this.reset}`,
    );
    res.on('finish', () => {
      const statusCode = res.statusCode;
      const color =
        statusCode >= 500
          ? this.red
          : statusCode >= 400
            ? this.yellow
            : this.green;
      console.log(
        `${this.reset}${this.labelGray}Response Status: ${color}${statusCode}${this.reset}\n`,
      );
    });
    next();
  }
}
