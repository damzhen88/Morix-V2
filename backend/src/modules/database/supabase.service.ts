import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
  client: SupabaseClient;

  constructor(private configService: ConfigService) {
    this.client = createClient(
      this.configService.get('SUPABASE_URL') || '',
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY') || '',
    );
  }
}
