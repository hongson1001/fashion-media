import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Request,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ImageService } from './image.service';
import { UserAuthGuard } from 'src/middlewares/user.middleware';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { createReadStream, promises as fs } from 'fs';
import { randomUUID } from 'crypto';

@Controller('image')
export class ImageController {
  constructor(private readonly imageService: ImageService) {}

  private tempPath = path.join(__dirname, '../../tempMedia/image/');
  private uploadPath = path.join(__dirname, '../../uploads/image/');
  private thumbnailPath = path.join(__dirname, '../../uploads/image/thumbnail/');

  @Get('view/:filename')
  async viewImage(@Param('filename') filename: string, @Res() res) {
    try {
      const filePath = path.join(this.uploadPath, filename);
      await fs.access(filePath);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
      return createReadStream(filePath).pipe(res);
    } catch (error) {
      return res.status(404).json({ message: 'Không tìm thấy file ảnh' });
    }
  }

  @Get('view/thumbnail/:filename')
  async viewThumbnailImage(@Param('filename') filename: string, @Res() res) {
    try {
      const filePath = path.join(this.thumbnailPath, filename);
      await fs.access(filePath);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return createReadStream(filePath).pipe(res);
    } catch (error) {
      return res.status(404).json({ message: 'Không tìm thấy file thumbnail' });
    }
  }

  @Post('save/:filename')
  @UseGuards(UserAuthGuard)
  async save(@Param('filename') filename: string, @Res() res) {
    try {
      await this.imageService.saveImage(filename);
      return res.status(200).json({ success: true, message: 'Lưu hình ảnh thành công' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  @Post('delete/:filename')
  @UseGuards(UserAuthGuard)
  async deleteFile(@Param('filename') filename: string, @Res() res) {
    try {
      await this.imageService.deleteImage(filename);
      return res.status(200).json({ success: true, message: 'Xóa hình ảnh thành công' });
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  }

  @Post('upload')
  @UseGuards(UserAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './tempMedia/image',
        filename: (req, file, cb) => {
          const randomName = `${randomUUID()}${path.extname(file.originalname)}`;
          cb(null, randomName);
        },
      }),
      fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg'];
        allowedTypes.includes(file.mimetype)
          ? cb(null, true)
          : cb(new BadRequestException('Chỉ cho phép hình ảnh PNG, JPEG.'), false);
      },
    }),
  )
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    return { success: true, image: `${file.filename}` };
  }
}
