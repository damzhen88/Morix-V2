import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { SupabaseClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private supabase: SupabaseClient;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {
    this.supabase = new SupabaseClient(
      this.configService.get('SUPABASE_URL') || '',
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );
  }

  async validateUser(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return data;
  }

  async register(email: string, password: string, metadata?: Record<string, any>) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email, password,
      email_confirm: true,
      user_metadata: metadata,
    });
    if (error) throw new UnauthorizedException(error.message);
    return data;
  }

  async getUser(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token.replace('Bearer ', ''));
    if (error) throw new UnauthorizedException('Invalid token');
    return data.user;
  }

  generateToken(userId: string, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
