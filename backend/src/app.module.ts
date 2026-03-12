import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { VehiclesModule } from './vehicles/vehicles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        host: config.get('DB_HOST'),
        port: +config.get('DB_PORT'),
        database: config.get('DB_DATABASE'),
        username: config.get('DB_USERNAME'),
        password: config.get('DB_PASSWORD'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        options: {
          encrypt: false,
          enableArithAbort: true,
        },
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    VehiclesModule,
  ],
})
export class AppModule {}