import { Controller, Post, UseInterceptors, UploadedFile, Query, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import * as fs from 'fs';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

@ApiTags('Uploads')
@Controller('uploads')
export class UploadController {
  
  @Post('media')
  @ApiOperation({ summary: 'Upload a media file' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const folder = (req.query.folder as string) || 'general';
          const uploadPath = join(process.cwd(), 'uploads', folder);
          if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
          }
          cb(null, uploadPath);
        },
        filename: (req, file, cb) => {
          const uniqueName = `${randomUUID()}${extname(file.originalname)}`;
          cb(null, uniqueName);
        },
      }),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException(`Unsupported file type ${file.mimetype}`), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadMedia(@UploadedFile() file: Express.Multer.File, @Query('folder') folder: string) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    const safeFolder = folder || 'general';
    const relativePath = `/uploads/${safeFolder}/${file.filename}`;

    return {
      success: true,
      data: {
        filename: file.filename,
        relativePath: relativePath,
        url: relativePath,
        mimetype: file.mimetype,
        sizeBytes: file.size,
      }
    };
  }
}
