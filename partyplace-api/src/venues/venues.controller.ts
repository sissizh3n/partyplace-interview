import { Controller, Post, Body } from '@nestjs/common';
import { VenuesService } from './venues.service';
import { OpenAIService } from './openai.service';
import { SearchQueryDto } from './dto/search-query.dto';
import { ParsedFilters } from './types/venue.types';

@Controller('venues')
export class VenuesController {
  constructor(
    private readonly venuesService: VenuesService,
    private readonly openAIService: OpenAIService,
  ) {}

  @Post('search')
  async search(@Body() dto: SearchQueryDto) {
    const filters: ParsedFilters = await this.openAIService.parseQuery(dto.query);
    return this.venuesService.search(filters);
  }
}
