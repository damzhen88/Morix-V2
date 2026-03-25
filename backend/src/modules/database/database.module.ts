import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SupabaseService } from './supabase.service';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST') || 'db.ltciqzjcnlrkgbcdnegt.supabase.co',
        port: parseInt(configService.get('DB_PORT') || '5432'),
        username: configService.get('DB_USER') || 'postgres.ltciqzjcnlrkgbcdnegt',
        password: configService.get('DB_PASSWORD') || '',
        database: configService.get('DB_NAME') || 'postgres',
        entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
        synchronize: configService.get('NODE_ENV') === 'development',
        logging: configService.get('NODE_ENV') === 'development',
        ssl: { rejectUnauthorized: false },
      }),
    }),
  ],
  providers: [SupabaseService],
  exports: [TypeOrmModule, SupabaseService],
})
export class DatabaseModule {}
