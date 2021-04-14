import { createParamDecorator, ExecutionContext } from '@nestjs/common';

//@Protocol(/* optional defaultValue */)
export const Protocol = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
      console.log('data to decorator',data);
    const request = ctx.switchToHttp().getRequest();
    return request.protocol;
  },
);