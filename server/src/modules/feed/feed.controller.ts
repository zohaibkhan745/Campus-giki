import { Controller, Get, Query, HttpCode, HttpStatus, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { FeedService } from './feed.service';
import { QueryFeedDto } from './dto/query-feed.dto';
import { PaginatedFeedResponseDto } from './dto/feed-response.dto';

@ApiTags('Feed')
@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @Header('Cache-Control', 'public, max-age=15, stale-while-revalidate=45')
  @ApiOperation({
    summary: 'Get merged public campus feed of events and announcement posts (chronological)',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated chronological feed returned successfully',
    type: PaginatedFeedResponseDto,
  })
  async getFeed(@Query() query: QueryFeedDto): Promise<PaginatedFeedResponseDto> {
    return this.feedService.getMergedFeed(query);
  }
}
