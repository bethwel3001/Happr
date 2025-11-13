import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { Request } from 'express';

interface JwtPayload {
  _id: string;
  email?: string;
  iat?: number;
  exp?: number;
}

export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
  cookies: {
    access_token?: string;
    refresh_token?: string;
  };
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const token = this.extractTokenFromRequest(request);

    if (!token) {
      throw new UnauthorizedException({
        success: false,
        message: 'No token provided',
        data: [],
      });
    }

    try {
      const decoded = this.jwtService.verify<JwtPayload>(token, {
        secret: process.env.JWT_SECRET!,
      });

      request.user = decoded;
      return true;
    } catch (error: unknown) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException({
          success: false,
          message: 'Token expired',
          data: [],
        });
      }

      if (error instanceof JsonWebTokenError) {
        throw new UnauthorizedException({
          success: false,
          message: 'Invalid token',
          data: [],
        });
      }

      throw new UnauthorizedException({
        success: false,
        message: 'Authentication failed',
        data: [],
      });
    }
  }

  private extractTokenFromRequest(
    request: AuthenticatedRequest,
  ): string | null {
    const cookieToken = request.cookies?.access_token;
    if (cookieToken && typeof cookieToken === 'string') {
      return cookieToken;
    }

    const authHeader = request.headers?.authorization;
    if (authHeader && typeof authHeader === 'string') {
      const [bearer, token] = authHeader.split(' ');
      if (bearer === 'Bearer' && token && typeof token === 'string') {
        return token;
      }
    }

    return null;
  }
}
