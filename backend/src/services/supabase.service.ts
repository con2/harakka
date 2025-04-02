import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private supabase;

  constructor(private configService: ConfigService) {
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL')?? '',
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY')?? '' // changed temporarily to SUPABASE_SERVICE_ROLE_KEY from SUPABASE_ANON_KEY
    );
  }

  getClient() {
    return this.supabase;
  }
}
