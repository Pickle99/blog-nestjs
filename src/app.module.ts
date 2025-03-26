import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        database: configService.get('DB_NAME'),
        autoLoadEntities: true,
        synchronize: configService.getOrThrow('DB_SYNCHRONIZE'),
        // do not use true in synchronize in prod, since it can cause data loss
      }),
    }),
    UsersModule,
    BlogsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
