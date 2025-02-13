import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ImageModule } from './image/image.module';
import { VideoModule } from './video/video.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [ImageModule, VideoModule, FileModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
