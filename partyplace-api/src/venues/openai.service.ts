import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ParsedFilters } from './types/venue.types';

@Injectable()
export class OpenAIService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(OpenAIService.name);

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'some_key',
    });
  }

  private readonly parsedFiltersSchema = {
    type: 'object' as const,
    properties: {
      budget: {
        type: ['number', 'null'],
        description: 'The budget in dollars',
      },
      guestCount: {
        type: ['number', 'null'],
        description: 'Number of guests/people attending',
      },
      location: {
        type: ['string', 'null'],
        description: 'Venue neighborhood or area',
      },
      date: {
        type: ['string', 'null'],
        description: 'Event date in YYYY-MM-DD format',
      },
      time: {
        type: ['string', 'null'],
        enum: ['morning', 'afternoon', 'evening', 'night', null],
        description: 'Time of day for the event',
      },
      occasion: {
        type: ['string', 'null'],
        enum: [
          'Birthday',
          'Engagement',
          'Graduation',
          'Anniversary',
          'Reunion',
          'Fundraiser',
          'Wedding',
          'Office Party',
          'Holiday Party',
          'Happy hour',
          'Bachelor/Bachelorette',
          null,
        ],
        description: 'Type of event/occasion',
      },
    },
    required: [
      'budget',
      'guestCount',
      'location',
      'date',
      'time',
      'occasion',
    ],
    additionalProperties: false,
  };

  private getSystemPrompt(): string {
    const today = new Date().toISOString().split('T')[0];
    return `You are a venue search assistant. Extract structured
filters from the user's natural language query about finding an event
venue.

Today's date is ${today}. Use this to resolve relative dates like
"next Saturday", "this Friday", etc.

Rules:
- budget: Extract the dollar amount. If they say "under $500", use
500. Return null if not mentioned.
- guestCount: The number of people/guests attending. Return null if
not mentioned.
- location: Map to one of these neighborhoods: SoHo, Williamsburg,
Midtown, Chelsea, Bushwick, Tribeca, East Village, Upper West Side,
DUMBO, Astoria, Greenpoint, Flatiron, NoHo, Financial District, Park
Slope, Harlem, Long Island City, Battery Park, Lower East Side,
Gramercy, Hudson Yards, Queens, Bronx, Coney Island, Red Hook, Sunset
Park, Upper East Side, Brooklyn Heights. If the user says a borough
(e.g. "Brooklyn"), return the borough name. Return null if not
mentioned.
- date: Return as ISO format YYYY-MM-DD. Return null if not mentioned.
- time: Map to one of: "morning", "afternoon", "evening", "night".
Return null if not mentioned.
- occasion: Map to the closest match from: Birthday, Engagement,
Graduation, Anniversary, Reunion, Fundraiser, Wedding, Office Party,
Holiday Party, Happy hour, Bachelor/Bachelorette. Return null if not
mentioned.

Return null for any field the user did not specify or imply.`;
  }

  async parseQuery(query: string): Promise<ParsedFilters> {
    try {
      const response = await this.openai.responses.create({
        model: 'gpt-5.4-nano',
        instructions: this.getSystemPrompt(),
        input: query,
        text: {
          format: {
            type: 'json_schema',
            name: 'parsed_filters',
            strict: true,
            schema: this.parsedFiltersSchema,
          },
        },
      });

      const raw = JSON.parse(response.output_text);

      const filters: ParsedFilters = {};
      if (raw.budget != null) filters.budget = raw.budget;
      if (raw.guestCount != null) filters.guestCount = raw.guestCount;
      if (raw.location != null) filters.location = raw.location;
      if (raw.date != null) filters.date = raw.date;
      if (raw.time != null) filters.time = raw.time;
      if (raw.occasion != null) filters.occasion = raw.occasion;

      return filters;
    } catch (error) {
      this.logger.error('Failed to parse query with OpenAI', error);
      return {};
    }
  }
}