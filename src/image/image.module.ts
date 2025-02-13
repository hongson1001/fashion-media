import { Module } from '@nestjs/common';
import { ImageService } from './image.service';
import { ImageController } from './image.controller';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.USER_SECRET_KEY,
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [ImageController],
  providers: [ImageService],
})
export class ImageModule {}
