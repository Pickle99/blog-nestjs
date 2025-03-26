import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { BlogsModule } from './blogs/blogs.module';
import { ConfigModule } from '@nestjs/config';
import { dataSourceOptions } from 'database/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UsersModule,
    BlogsModule,
    TypeOrmModule.forRoot(dataSourceOptions),
    AuthModule,
    JwtModule.register({
      global: true,
      secret: 'secretkeyofmine',
      signOptions: { expiresIn: '4h' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
