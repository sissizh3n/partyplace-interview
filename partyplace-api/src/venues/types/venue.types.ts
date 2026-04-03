export interface Venue {
  id: number;
  name: string;
  minBudget: number | null;
  maxGuestCount: number | null;
  location: string;
  availableDays: string[];
  openTimes: string[];
  occasions: string[];
}

export interface ParsedFilters {
  budget?: number;
  guestCount?: number;
  location?: string;
  date?: string;
  time?: string;
  occasion?: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: string[];
  warnings: string[];
  suggestedQuery?: string;
}

export interface SearchResponse {
  filters: ParsedFilters;
  venues: Venue[];
  validation: ValidationResult;
}
