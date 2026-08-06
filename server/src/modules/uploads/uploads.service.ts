import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';
import { randomUUID } from 'crypto';

export interface UploadResponseDto {
  filename: string;
  relativePath: string;
  url: string;
  mimetype: string;
  sizeBytes: number;
}

@Injectable()
export class UploadsService {
  private readonly uploadDir: string;
  private readonly appUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = path.resolve(
      process.cwd(),
      this.configService.get<string>('app.storageLocalPath') || './uploads',
    );
    this.appUrl =
      this.configService.get<string>('app.appUrl') || 'http://localhost:5000';

    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async processAndSaveFile(
    file: Express.Multer.File,
    folder = 'general',
  ): Promise<UploadResponseDto> {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const targetDir = path.join(this.uploadDir, safeFolder);
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const uniqueId = randomUUID();
    const isImage = file.mimetype.startsWith('image/');
    let filename: string;
    let finalBuffer: Buffer;
    let mimetype: string;

    if (isImage) {
      filename = `${uniqueId}.webp`;
      mimetype = 'image/webp';
      finalBuffer = await sharp(file.buffer)
        .rotate()
        .webp({ quality: 80 })
        .toBuffer();
    } else {
      const ext = path.extname(file.originalname) || '';
      filename = `${uniqueId}${ext}`;
      mimetype = file.mimetype;
      finalBuffer = file.buffer;
    }

    const filePath = path.join(targetDir, filename);
    await fs.promises.writeFile(filePath, finalBuffer);

    const relativePath = `/uploads/${safeFolder}/${filename}`;
    const url = `${this.appUrl}${relativePath}`;

    return {
      filename,
      relativePath,
      url,
      mimetype,
      sizeBytes: finalBuffer.length,
    };
  }
}
