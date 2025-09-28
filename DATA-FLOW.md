# Data Flow Architecture: iTunes API → UI (DDD Clean Architecture)

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL API                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ iTunes RSS API                                                              │
│ https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json      │
│ Lookup API: https://itunes.apple.com/lookup?id={id}&media=podcast          │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. src/infrastructure/http/HttpClient.ts                                   │
│    - FetchHttpClient implements HttpClient interface                       │
│    - Executes fetch() to iTunes API                                        │
│    - Returns raw iTunes JSON response                                      │
│                                      │                                      │
│                                      ▼                                      │
│ 2. src/infrastructure/repositories/ItunesPodcastRepository.ts              │
│    - Implements PodcastRepository interface                                │
│    - getTopPodcasts(): calls HttpClient.get(itunesRSSUrl)                  │
│    - getPodcastDetail(): calls HttpClient.get(itunesLookupUrl)             │
│    - Receives iTunes JSON with "im:xxx" structure                          │
│                                      │                                      │
│                                      ▼                                      │
│ 3. src/infrastructure/mappers/ItunesMappers.ts                             │
│    - mapItunesEntryToPodcast(): transforms RSS entry                       │
│    - mapItunesLookupToPodcast(): transforms lookup response                │
│    - Transforms iTunes "im:name.label" → clean structure                   │
│    - Extracts best quality image URL                                       │
│    - Returns plain objects (PodcastData, EpisodeData)                      │
│                                      │                                      │
│                                      ▼                                      │
│ 4. src/infrastructure/cache/LocalStorageCacheRepository.ts                 │
│    - Implements CacheRepository interface                                  │
│    - get<T>(key): retrieves cached data with TTL validation                │
│    - set<T>(key, data, ttl): saves data with expiration                    │
│    - JSON.stringify/parse for persistence                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 5. src/domain/entities/Podcast.ts                                          │
│    - Podcast.create(podcastData): factory method                           │
│    - Creates Domain Entity with business logic                             │
│    - getBestImageUrl(), validation rules                                   │
│    - Uses PodcastId value object                                           │
│                                      │                                      │
│                                      ▼                                      │
│ 6. src/domain/entities/Episode.ts                                          │
│    - Episode.create(episodeData): factory method                           │
│    - Encapsulates episode business rules                                   │
│    - Duration formatting, release date handling                            │
│                                      │                                      │
│                                      ▼                                      │
│ 7. src/domain/value-objects/PodcastId.ts                                   │
│    - Validates ID is positive number                                       │
│    - Encapsulates ID business rules                                        │
│    - Provides type safety for podcast identifiers                          │
│                                      │                                      │
│                                      ▼                                      │
│ 8. src/domain/errors/DomainError.ts                                        │
│    - PodcastNotFoundError, EpisodeNotFoundError                            │
│    - InvalidPodcastIdError                                                 │
│    - Domain-specific error handling                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. src/application/ports/PodcastRepository.ts                              │
│    - Interface defining repository contract                                │
│    - getTopPodcasts(): Promise<Podcast[]>                                  │
│    - getPodcastDetail(id): Promise<PodcastWithEpisodes>                    │
│                                      │                                      │
│                                      ▼                                      │
│ 10. src/application/ports/CacheRepository.ts                               │
│     - Interface defining cache contract                                    │
│     - get<T>(key): Promise<T | null>                                       │
│     - set<T>(key, data, ttl): Promise<void>                                │
│                                      │                                      │
│                                      ▼                                      │
│ 11. src/application/use-cases/GetTopPodcasts.ts                            │
│     - Orchestrates the podcast listing flow                               │
│     - constructor(repository, cache): dependency injection                 │
│     - execute(): checks cache first, then repository                       │
│     - Returns PodcastListDTO[] (clean UI format)                          │
│                                      │                                      │
│                                      ▼                                      │
│ 12. src/application/use-cases/GetPodcastDetails.ts                         │
│     - Orchestrates podcast detail with episodes flow                      │
│     - execute(podcastId): gets podcast + episodes                          │
│     - Returns PodcastDetailDTO with episodes                              │
│                                      │                                      │
│                                      ▼                                      │
│ 13. src/application/dto/PodcastDTO.ts                                      │
│     - PodcastListDTO: UI-friendly podcast list interface                  │
│     - PodcastDetailDTO: detailed podcast with episodes                    │
│     - EpisodeDTO: clean episode interface                                 │
│     - No domain complexity, pure UI contracts                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPENDENCY INJECTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 14. src/app/di.ts                                                          │
│     - Simple dependency wiring (no container pattern)                     │
│     - Creates: FetchHttpClient → ItunesPodcastRepository                   │
│     - Creates: LocalStorageCacheRepository                                │
│     - Exports: getTopPodcasts, getPodcastDetails use case instances       │
│     - Provides configured, ready-to-use dependencies                      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           UI CONTEXT LAYER                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 15. src/ui/context/PodcastContext.tsx                                      │
│     - PodcastProvider: React context provider                             │
│     - usePodcast(): custom hook                                           │
│     - loadPodcasts(): calls getTopPodcasts.execute()                      │
│     - loadEpisodes(id): calls getPodcastDetails.execute(id)               │
│     - State: { podcasts, loading, error, episodes }                       │
│     - Manages React state with useState hooks                             │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             UI LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 16. src/ui/pages/Home.tsx                                                  │
│     - const { podcasts, loading } = usePodcast()                          │
│     - Receives clean PodcastListDTO[]                                     │
│     - Maps to <PodcastCard> components                                    │
│     - No knowledge of business logic or data sources                      │
│                                      │                                      │
│                                      ▼                                      │
│ 17. src/ui/pages/Podcast.tsx                                               │
│     - Shows podcast details and episodes                                  │
│     - const { episodes } = usePodcast()                                   │
│     - Calls loadEpisodes(podcastId) on mount                              │
│                                      │                                      │
│                                      ▼                                      │
│ 18. src/ui/pages/Episode.tsx                                               │
│     - Shows individual episode details                                    │
│     - Pure presentational component                                       │
│                                      │                                      │
│                                      ▼                                      │
│ 19. src/ui/components/PodcastCard.tsx                                      │
│     - Receives: PodcastListDTO props                                      │
│     - Pure presentational component                                       │
│     - onClick navigation to podcast detail                                │
│                                      │                                      │
│                                      ▼                                      │
│ 20. src/ui/components/Layout.tsx                                           │
│     - App shell with navigation                                           │
│     - Wraps all pages with consistent layout                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File-by-File Flow

### **Step 1: HTTP Request**

**File:** `src/infrastructure/http/HttpClient.ts`

```typescript
interface HttpClient {
  get(url: string): Promise<unknown>
}

class FetchHttpClient implements HttpClient {
  get(url: string) → fetch(url) → Response JSON
}
```

### **Step 2: Repository Implementation**

**File:** `src/infrastructure/repositories/ItunesPodcastRepository.ts`

```typescript
getTopPodcasts() → httpClient.get(itunesRSSUrl) → iTunes RSS JSON
getPodcastDetail(id) → httpClient.get(itunesLookupUrl) → iTunes Lookup JSON
```

### **Step 3: Data Mapping**

**File:** `src/infrastructure/mappers/ItunesMappers.ts`

```typescript
mapItunesEntryToPodcast(itunesEntry) → Clean PodcastData object
mapItunesLookupToPodcast(itunesResponse) → Clean PodcastData + EpisodeData[]
```

### **Step 4: Domain Entity Creation**

**Files:** `src/domain/entities/Podcast.ts`, `src/domain/entities/Episode.ts`

```typescript
Podcast.create(podcastData) → Domain Entity with business logic
Episode.create(episodeData) → Domain Entity with episode rules
```

### **Step 5: Use Case Orchestration**

**Files:** `src/application/use-cases/GetTopPodcasts.ts`, `src/application/use-cases/GetPodcastDetails.ts`

```typescript
GetTopPodcasts.execute() → Cache check → Repository → Domain Entities → DTOs
GetPodcastDetails.execute(id) → Cache check → Repository → Domain Entities → DTOs
```

### **Step 6: DTO Transformation**

**File:** `src/application/dto/PodcastDTO.ts`

```typescript
Domain Entities → PodcastListDTO | PodcastDetailDTO | EpisodeDTO
```

### **Step 7: Dependency Injection**

**File:** `src/app/di.ts`

```typescript
// Simple DI without container pattern
export const getTopPodcasts = new GetTopPodcasts(repository, cache)
export const getPodcastDetails = new GetPodcastDetails(repository, cache)
```

### **Step 8: Context Integration**

**File:** `src/ui/context/PodcastContext.tsx`

```typescript
usePodcast() → getTopPodcasts.execute() → React State
loadEpisodes(id) → getPodcastDetails.execute(id) → React State
```

### **Step 9: UI Consumption**

**Files:** `src/ui/pages/*.tsx`, `src/ui/components/*.tsx`

```typescript
usePodcast() → PodcastListDTO[] → <PodcastCard> rendering
usePodcast() → EpisodeDTO[] → Episode listing
```

## Data Transformation Points

### **iTunes RSS API Response:**

```json
{
  "feed": {
    "entry": [
      {
        "im:name": { "label": "Podcast Title" },
        "im:artist": { "label": "Author Name" },
        "im:image": [
          { "label": "url1", "attributes": { "height": "55" } },
          { "label": "url2", "attributes": { "height": "170" } }
        ],
        "id": { "attributes": { "im:id": "123456" } }
      }
    ]
  }
}
```

### **iTunes Lookup API Response:**

```json
{
  "results": [
    {
      "collectionId": 123456,
      "collectionName": "Podcast Title",
      "artistName": "Author Name",
      "artworkUrl100": "image_url",
      "feedUrl": "rss_feed_url"
    }
  ]
}
```

### **After Infrastructure Mapper:**

```typescript
// PodcastData (plain object)
{
  id: "123456",
  title: "Podcast Title",
  author: "Author Name",
  image: "best_quality_url",
  description: "Description",
  feedUrl: "rss_feed_url"
}

// EpisodeData (plain object)
{
  id: "episode_123",
  title: "Episode Title",
  description: "Episode description",
  audioUrl: "mp3_url",
  duration: "45:30",
  releaseDate: "2025-01-15"
}
```

### **Domain Entities:**

```typescript
class Podcast {
  private constructor(
    private id: PodcastId,
    private title: string,
    private author: string,
    private image: string,
    private description: string
  ) {}

  static create(data: PodcastData): Podcast
  getBestImageUrl(): string // Business logic
  getDisplayName(): string // Business logic
}

class Episode {
  private constructor(
    private id: string,
    private title: string,
    private audioUrl: string,
    private duration: string
  ) {}

  static create(data: EpisodeData): Episode
  getFormattedDuration(): string // Business logic
}
```

### **Application DTOs (Final UI Format):**

```typescript
// UI-friendly interfaces
interface PodcastListDTO {
  id: string
  title: string
  author: string
  image: string
  description: string
}

interface PodcastDetailDTO {
  id: string
  title: string
  author: string
  image: string
  description: string
  episodes: EpisodeDTO[]
}

interface EpisodeDTO {
  id: string
  title: string
  description: string
  audioUrl: string
  duration: string
  releaseDate: string
}
```

### **React Context State:**

```typescript
interface PodcastContextType {
  podcasts: PodcastListDTO[]
  loading: boolean
  error: string | null
  episodes: { [podcastId: string]: EpisodeDTO[] }
  loadPodcasts: () => Promise<void>
  loadEpisodes: (podcastId: string) => Promise<void>
}
```

## Cache Flow

### **Cache Hit Path:**
```
UI → Context → Use Case → Cache Repository → localStorage → Return cached DTOs
```

### **Cache Miss Path:**
```
UI → Context → Use Case → Repository → HTTP → iTunes API → Mapper → Domain → DTO → Cache → UI
```

## Architecture Benefits

### **Separation of Concerns:**
- **Domain**: Pure business logic, no external dependencies
- **Application**: Orchestrates use cases, defines contracts
- **Infrastructure**: Implements external concerns (HTTP, cache, API mapping)
- **UI**: Pure presentation, consumes clean DTOs

### **Testability:**
- Each layer can be tested in isolation
- Dependency injection enables easy mocking
- Domain entities have no external dependencies

### **Maintainability:**
- Clear boundaries between layers
- Easy to swap implementations (e.g., different cache or HTTP client)
- UI completely decoupled from data sources

### **Clean Data Flow:**
```
iTunes API JSON → Infrastructure Mappers → Domain Entities → Application DTOs → UI Components
```

This DDD Clean Architecture ensures that business logic stays pure while maintaining clear separation between data transformation, business rules, and presentation concerns.