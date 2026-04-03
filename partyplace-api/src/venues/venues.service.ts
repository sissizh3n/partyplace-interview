import { Injectable } from '@nestjs/common';
import { Venue, ParsedFilters, ValidationResult, SearchResponse } from './types/venue.types';
import { OpenAIService } from './openai.service';
import * as venuesData from '../../../venues.json'; 
import { readFileSync } from 'fs';
import { join } from 'path';

@Injectable()
export class VenuesService {
  // TODO: load venues.json, filter, validate

  // parse json for venues.json

  // let venues: Venue[] = JSON.parse(readFileSync(join(__dirname, '..', '..', '..', 'venues.json'), 'utf-8'),);  

  private venues: Venue[] = venuesData as Venue[];

  search(query: ParsedFilters): SearchResponse {
    // convert query to parsed filters
    
    if (query.location !== undefined) {
      const locationFilter = query.location.toLowerCase();
      this.venues = this.venues.filter(venue => venue.location.toLowerCase().includes(locationFilter));
    }

    if (query.budget !== undefined) {
      this.venues = this.venues.filter(venue => venue.minBudget !== null && venue.minBudget <= query.budget);
    }

    if (query.guestCount !== undefined) {
      this.venues = this.venues.filter(venue => venue.maxGuestCount !== null && venue.maxGuestCount >= query.guestCount);
    }

    if (query.date !== undefined) {
      this.venues = this.venues.filter(venue => venue.availableDays.includes(query.date));
    }

    if (query.time !== undefined) {
      this.venues = this.venues.filter(venue => venue.openTimes.includes(query.time));
    }

    if (query.occasion !== undefined) {
      this.venues = this.venues.filter(venue => venue.occasions.includes(query.occasion));
    }

    
    return {
      filters: query,
      venues: this.venues,
      validation: { valid: true, issues: [], warnings: [] },
    };
  }
}
