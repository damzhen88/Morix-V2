import { Controller, Post, Body, Get, Headers, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const data = await this.authService.validateUser(body.email, body.password);
    const token = this.authService.generateToken(data.user!.id, data.user!.email!);
    return {
      access_token: token,
      user: {
        id: data.user!.id,
        email: data.user!.email,
        created_at: data.user!.created_at,
      },
    };
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string; name?: string }) {
    const data = await this.authService.register(body.email, body.password, { name: body.name });
    const token = this.authService.generateToken(data.user!.id, data.user!.email!);
    return {
      access_token: token,
      user: {
        id: data.user!.id,
        email: data.user!.email,
        created_at: data.user!.created_at,
      },
    };
  }

  @Get('me')
  async me(@Headers('authorization') auth: string) {
    if (!auth) throw new UnauthorizedException('No token provided');
    const user = await this.authService.getUser(auth);
    return { id: user.id, email: user.email, created_at: user.created_at };
  }
}
