import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService } from './auth.service';
import { AuthModule } from './auth.module';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AuthModule.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    const user = { userId: payload.sub, email: payload.email, role: payload.role };
    console.log('JWT validated successfully:', user);
    return user;
  }
}
