import { Module, Global } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Global()
@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const supabaseUrl = configService.get('SUPABASE_URL') || '';
        const supabaseKey = configService.get('SUPABASE_SERVICE_ROLE_KEY') || '';
        
        // Parse Supabase connection string from connection string or build from settings
        const dbHost = configService.get('DB_HOST') || 'aws-0-ap-southeast-1.pooler.supabase.com';
        const dbPort = configService.get('DB_PORT') || '5432';
        const dbUser = configService.get('DB_USER') || `postgres.${supabaseUrl.replace('https://', '')}`;
        const dbPassword = configService.get('DB_PASSWORD') || supabaseKey;
        const dbName = configService.get('DB_NAME') || 'postgres';

        return {
          type: 'postgres',
          host: dbHost,
          port: parseInt(dbPort),
          username: dbUser,
          password: dbPassword,
          database: dbName,
          entities: [__dirname + '/../../**/*.entity{.ts,.js}'],
          synchronize: configService.get('NODE_ENV') === 'development',
          logging: configService.get('NODE_ENV') === 'development',
          ssl: { rejectUnauthorized: false },
        };
      },
    }),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}
