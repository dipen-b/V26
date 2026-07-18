import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ExecutionContext } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    console.log('JWT Guard - Authorization header:', request.headers.authorization);
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any) {
    if (err) {
      console.error('JWT Guard error:', err);
      throw err;
    }
    if (info) {
      console.error('JWT Guard info:', info);
      throw new UnauthorizedException(info.message || 'Invalid token');
    }
    if (!user) {
      console.error('JWT Guard: No user found');
      throw new UnauthorizedException('No user found');
    }
    return user;
  }
}
