# PartyPlace — AI-Powered Venue Search
Technical interview assessment — full-stack implementation of a natural language venue search application.

## Project Summary

The goal was to build a small full-stack app where a user enters a plain English request (e.g. *"I want to celebrate my birthday in Brooklyn for 50 people on May 5th"*) and gets back matching venue results from a mock dataset. The system uses OpenAI to interpret the query and extract structured filters before searching.

**Stack:** NestJS (backend) + Next.js (frontend) + TypeScript throughout + OpenAI Responses API

---

## Approach & Decision-Making

### Planning First

Before writing any code, I read the spec and `venues.json` in full and produced a structured development plan covering:
- API endpoint design
- Data shape analysis
- Business rule definitions
- Component breakdown
- Suggested build order

This allowed me to start implementation with clear scope and avoid dead ends.

### Backend Architecture

Chose a single `POST /venues/search` endpoint that owns the full pipeline:

```
Client query (string)
  → OpenAIService.parseQuery()    — NLP → structured filters
  → VenuesService.search()        — filter venues.json + validate
  → SearchResponse                — filters, venues, validation
```

This keeps the controller thin and the responsibilities clearly separated.

### AI Integration with OpenAI API

**API: Responses API** - Used structured output with strict mode to guarantee valid JSON responses every time.

**Model: gpt-5.4-nano** — chosen for cost efficiency while maintaining sufficient reasoning capability for structured extraction.

Key prompt engineering decisions:

- Inject today's date so relative dates ("next Saturday") resolve correctly
- Enumerate valid neighborhoods, occasions, and time slots directly in the system prompt so extracted values align with the venue dataset
- All schema fields are required but nullable — the model sets unmentioned fields to `null`, which are then stripped before filtering

---

## What Was Built

### Backend (`partyplace-api`) — Complete (Venue Service In Progress)

| File | Status | Description |
|------|--------|-------------|
| `src/venues/types/venue.types.ts` | Done | `Venue`, `ParsedFilters`, `ValidationResult`, `SearchResponse` interfaces |
| `src/venues/dto/search-query.dto.ts` | Done | Request DTO `{ query: string }` |
| `src/venues/openai.service.ts` | Done | Calls GPT-5.4 Nano via Responses API, returns structured `ParsedFilters` |
| `src/venues/venues.service.ts` | In progress | Loads `venues.json`, filters by all extracted fields |
| `src/venues/venues.controller.ts` | Done | `POST /venues/search` — orchestrates OpenAI → filter pipeline |
| `src/venues/venues.module.ts` | Done | Registers providers |
| `src/app.module.ts` | Done | Imports `VenuesModule` |
| `src/main.ts` | Done | CORS enabled, runs on port 3001 |

Note: venue.service.ts still needs:
- Undefined type catches
- Validation implementation

### Frontend (`partyplace-web`) — File Structure Complete, Implementation Pending

| File | Status | Description |
|------|--------|-------------|
| `app/components/SearchBar.tsx` | Stub | Text input + submit |
| `app/components/FilterDisplay.tsx` | Stub | Extracted filter tags |
| `app/components/VenueCard.tsx` | Stub | Individual venue result |
| `app/components/VenueList.tsx` | Stub | List of venue results |
| `app/components/ValidationAlert.tsx` | Stub | Error/warning display |
| `app/page.tsx` | Not started | Composes all components with state |

---

## What I Would Do Next

Given more time, the immediate next priorities would be:

1. **Complete `VenuesService` validation logi and undefined type checksc** — apply the business rules and return structured `ValidationResult`
2. **Fix date filter** — currently compares ISO date string against `availableDays` (day names); needs conversion from date → day-of-week
3. **Reset venues on each search** — `VenuesService` currently mutates `this.venues` in place; should filter from a fresh copy each call
4. **Implement frontend components** — `SearchBar` with loading state, `FilterDisplay` as tag chips, `VenueCard` with key venue details, `ValidationAlert` with warning/error distinction
5. **Wire up `page.tsx`** — manage search state, call the API, compose all components

---


## Running the Project

```bash
# Backend
cd partyplace-api
npm install
npm run start:dev   # runs on http://localhost:3001

# Frontend
cd partyplace-web
npm install
npm run dev         # runs on http://localhost:3000
```

**Test the endpoint:**
```bash
curl -X POST http://localhost:3001/venues/search \
  -H "Content-Type: application/json" \
  -d '{"query": "birthday party in Brooklyn for 50 people on May 5th with a $2000 budget"}'
```