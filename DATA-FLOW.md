# Data Flow Architecture: iTunes API → HomePage

## Complete Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL API                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ iTunes RSS API                                                              │
│ https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json      │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        INFRASTRUCTURE LAYER                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. src/infrastructure/http/HttpClient.ts                                   │
│    - Executes fetch() to iTunes API                                        │
│    - Returns raw iTunes JSON response                                      │
│                                      │                                      │
│                                      ▼                                      │
│ 2. src/infrastructure/repositories/ItunesPodcastRepository.ts              │
│    - Implements PodcastRepository interface                                │
│    - Calls HttpClient.get(itunesUrl)                                       │
│    - Receives iTunes JSON with "im:xxx" structure                          │
│                                      │                                      │
│                                      ▼                                      │
│ 3. src/infrastructure/mappers/ItunesMappers.ts                             │
│    - mapItunesEntryToPodcast()                                             │
│    - Transforms iTunes "im:name.label" → clean structure                   │
│    - Extracts best quality image URL                                       │
│    - Returns plain objects (PodcastData)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DOMAIN LAYER                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│ 4. src/domain/entities/Podcast.ts                                          │
│    - Podcast.create(podcastData)                                           │
│    - Creates Domain Entity with business logic                             │
│    - getBestImageUrl(), validation rules                                   │
│    - Uses PodcastId value object                                           │
│                                      │                                      │
│                                      ▼                                      │
│ 5. src/domain/value-objects/PodcastId.ts                                   │
│    - Validates ID is positive number                                       │
│    - Encapsulates ID business rules                                        │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        APPLICATION LAYER                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│ 6. src/application/use-cases/GetTopPodcasts.ts                             │
│    - Orchestrates the entire flow                                          │
│    - Checks cache first (LocalStorageCacheRepository)                      │
│    - If cache miss: calls PodcastRepository                                │
│    - Receives Podcast[] domain entities                                    │
│    - Calls mapToDTO() to convert to clean DTOs                             │
│                                      │                                      │
│                                      ▼                                      │
│ 7. src/application/dto/PodcastDTO.ts                                       │
│    - Clean interface: PodcastListDTO                                       │
│    - { id: string, title: string, author: string, image: string }          │
│    - UI-friendly, no domain complexity                                     │
│                                      │                                      │
│                                      ▼                                      │
│ 8. src/infrastructure/cache/LocalStorageCacheRepository.ts                 │
│    - Saves PodcastListDTO[] to localStorage                                │
│    - 24h TTL using Date.now() + ttlHours                                   │
│    - JSON.stringify/parse for persistence                                  │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                        DEPENDENCY INJECTION                                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 9. src/infrastructure/di/Container.ts                                      │
│    - Container.getInstance()                                               │
│    - Wires up dependencies:                                                │
│      * HttpClient → ItunesPodcastRepository                                │
│      * LocalStorageCacheRepository → GetTopPodcasts                        │
│    - Returns configured use case instances                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONTEXT LAYER                                    │
├─────────────────────────────────────────────────────────────────────────────┤
│ 10. src/context/PodcastContext.tsx                                         │
│     - usePodcast() hook                                                    │
│     - getTopPodcasts() function                                            │
│     - Gets container.getTopPodcasts() use case                             │
│     - Calls useCase.execute()                                              │
│     - Receives PodcastListDTO[]                                            │
│     - Dispatches to React reducer                                          │
│                                      │                                      │
│                                      ▼                                      │
│ 11. State Management (useReducer)                                          │
│     - Action: SET_PODCASTS                                                 │
│     - State: { podcasts: PodcastListDTO[], loading, error }                │
│     - React state updated, triggers re-render                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                             UI LAYER                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│ 12. src/pages/HomePage.tsx                                                 │
│     - const { podcasts, loading, error } = usePodcast()                    │
│     - Receives clean PodcastListDTO[]                                      │
│     - No knowledge of iTunes API structure                                 │
│     - Maps to <PodcastCard> components                                     │
│                                      │                                      │
│                                      ▼                                      │
│ 13. src/components/PodcastCard.tsx                                         │
│     - Receives: { title, author, image, onClick }                          │
│     - Pure presentational component                                        │
│     - Renders final UI                                                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## File-by-File Flow

### **Step 1: HTTP Request**

**File:** `src/infrastructure/http/HttpClient.ts`

```typescript
get(url: string) → fetch(url) → Response JSON
```

### **Step 2: Repository Implementation**

**File:** `src/infrastructure/repositories/ItunesPodcastRepository.ts`

```typescript
getTopPodcasts() → httpClient.get(itunesUrl) → iTunes Raw JSON
```

### **Step 3: Data Mapping**

**File:** `src/infrastructure/mappers/ItunesMappers.ts`

```typescript
mapItunesEntryToPodcast(itunesEntry) → Clean PodcastData object
```

### **Step 4: Domain Entity Creation**

**File:** `src/domain/entities/Podcast.ts`

```typescript
Podcast.create(podcastData) → Domain Entity with business logic
```

### **Step 5: Use Case Orchestration**

**File:** `src/application/use-cases/GetTopPodcasts.ts`

```typescript
execute() → Repository → Domain Entities → mapToDTO() → PodcastListDTO[]
```

### **Step 6: DTO Transformation**

**File:** `src/application/dto/PodcastDTO.ts`

```typescript
Podcast Entity → PodcastListDTO (UI-friendly interface)
```

### **Step 7: Dependency Injection**

**File:** `src/infrastructure/di/Container.ts`

```typescript
Container → Wired dependencies → Use Case instances
```

### **Step 8: Context Integration**

**File:** `src/context/PodcastContext.tsx`

```typescript
usePodcast() → container.getTopPodcasts().execute() → React State
```

### **Step 9: UI Consumption**

**File:** `src/pages/HomePage.tsx`

```typescript
usePodcast() → PodcastListDTO[] → <PodcastCard> rendering
```

## Data Transformation Points

### **iTunes API Response:**

```json
{
  "feed": {
    "entry": [
      {
        "im:name": { "label": "Podcast Title" },
        "im:artist": { "label": "Author Name" },
        "im:image": [{ "label": "url1" }, { "label": "url2" }]
      }
    ]
  }
}
```

### **After Mapper:**

```typescript
{
  id: "123",
  title: "Podcast Title",
  author: "Author Name",
  image: "best_quality_url"
}
```

### **Domain Entity:**

```typescript
Podcast {
  private id: PodcastId,
  private title: string,
  getBestImageUrl(): string // Business logic
}
```

### **DTO (Final UI Format):**

```typescript
PodcastListDTO {
  id: string,
  title: string,
  author: string,
  image: string,
  description: string
}
```

### **React State:**

```typescript
{
  podcasts: PodcastListDTO[],
  loading: boolean,
  error: string | null
}
```

## Cache Flow

**Cache Hit Path:**

```
HomePage → Context → Use Case → Cache Repository → localStorage → Return cached DTOs
```

**Cache Miss Path:**

```
HomePage → Context → Use Case → Repository → HTTP → iTunes API → Mapper → Entity → DTO → Cache → UI
```

This architecture ensures clean separation of concerns with each layer having a single responsibility in the data transformation pipeline.
