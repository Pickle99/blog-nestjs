import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: '127.0.0.1',
        port: 5433,
        database: 'blognestjs',
        username: 'kabuto20133',
        password: '231289',
        entities: [User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}

// useFactory: (configService: ConfigService) => ({
//     type: 'postgres',
//     host: configService.getOrThrow('DB_HOST'),
//     port: configService.getOrThrow('DB_PORT'),
//     database: configService.getOrThrow('DB_NAME'),
//     username: configService.getOrThrow('DB_USERNAME'),
//     password: configService.getOrThrow('DB_PASSWORD'),
//     entities: ['dist/**/*.entity{.ts,.js'],
//     synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
//   }),
