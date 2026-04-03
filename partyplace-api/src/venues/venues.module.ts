import { Module } from '@nestjs/common';
import { VenuesController } from './venues.controller';
import { VenuesService } from './venues.service';
import { OpenAIService } from './openai.service';

@Module({
  controllers: [VenuesController],
  providers: [VenuesService, OpenAIService],
})
export class VenuesModule {}
