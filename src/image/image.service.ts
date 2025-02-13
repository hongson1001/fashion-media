import { Injectable } from '@nestjs/common';
import * as sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class ImageService {
  constructor() {}

  async saveImage(filename: string): Promise<void> {
    const imagePath = path.join(__dirname, `../../tempMedia/image/${filename}`);
    const newFolderPath = path.join(__dirname, `../../uploads/image/`);
    const newFolderThumbnailPath = path.join(
      __dirname,
      `../../uploads/image/thumbnail`,
    );
    const imageNewPath = path.join(newFolderPath, filename);

    // Tạo thư mục nếu chưa tồn tại
    await fs.promises.mkdir(newFolderPath, { recursive: true });
    await fs.promises.mkdir(newFolderThumbnailPath, { recursive: true });

    // Kiểm tra xem file đã tồn tại chưa
    if (!fs.existsSync(imagePath)) {
      throw new Error(`File ${filename} không tồn tại`);
    }

    // Copy file
    await fs.promises.copyFile(imagePath, imageNewPath);

    // Resize và tạo thumbnail
    const thumbnailBuffer = await sharp(imagePath)
      .resize(256)
      .sharpen()
      .toBuffer();

    await sharp(thumbnailBuffer).toFile(
      path.join(newFolderThumbnailPath, filename),
    );
  }

  async deleteImage(filename: string) {
    const newFolderPath = path.join(__dirname, `../../uploads/image/`);
    const newFolderThumbnailPath = path.join(
      __dirname,
      `../../uploads/image/thumbnail`,
    );

    // Kiểm tra tồn tại file trước khi xóa
    const filePath = path.join(newFolderPath, filename);
    const thumbnailPath = path.join(newFolderThumbnailPath, filename);

    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }

    if (fs.existsSync(thumbnailPath)) {
      await fs.promises.unlink(thumbnailPath);
    }
  }
}
