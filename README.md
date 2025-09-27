# Podcaster

A modern podcast application built with React and Domain-Driven Design architecture. Browse the top 100 music podcasts from iTunes, view detailed episode lists, and play content with HTML5 audio.

## Features

✅ **Core Application (MVP3):**

- Browse top 100 podcasts with responsive grid layout
- Real-time search by title and author with instant filtering
- Podcast detail view with navigable episode table
- Episode detail view with HTML5 audio player
- 24-hour intelligent caching system for podcasts and episodes
- Episode list with properly formatted dates and durations
- Native audio player with multi-format support
- Episode descriptions rendered as HTML for rich content
- Clean URL routing without hash navigation
- Visual navigation indicator in top-right corner
- Reusable sidebar with contextual navigation
- Complete responsive design for mobile, tablet, and desktop

✅ **DDD Architecture Complete:**

- Domain layer with entities, value objects, and domain errors
- Application layer with use cases, ports, and DTOs
- Infrastructure layer with repositories, HTTP client, and DI container
- Service layer providing facade for UI components
- TypeScript-first implementation with strict typing
- Environment configuration system
- **Complete component migration to DDD + Context API hybrid**

## Tech Stack

- **Frontend:** React 18.3.1 + TypeScript 5.9.2
- **Build Tool:** Vite 5.4.10 with advanced proxy configuration
- **Routing:** React Router Dom 6.20.1 (clean URLs)
- **Testing:** Vitest 1.0.4 + Testing Library + full coverage
- **Styling:** Custom CSS + CSS Variables (zero UI dependencies)
- **State:** Context API + DDD Services (hybrid architecture)
- **Cache:** localStorage with intelligent TTL validation (24h)
- **API:** iTunes RSS + iTunes Lookup (via Vite proxy)
- **Quality:** ESLint + Prettier + strict configuration

## Application Views

- **HomePage (/)** - Top 100 podcasts with advanced search (Context + DDD)
- **PodcastDetail (/podcast/:id)** - Complete episode list + sidebar (Context + DDD)
- **EpisodeDetail (/podcast/:id/episode/:id)** - Audio player + HTML description (Context + DDD)

## Architecture

### DDD Implementation

```
src/
├── domain/                    # Entities, Value Objects, Errors
├── application/               # Use Cases, Ports, DTOs, Services
├── infrastructure/            # Repositories, HTTP, Cache, DI
├── context/                   # Context API + DDD integration
├── components/                # Reusable UI components (use DTOs)
└── pages/                     # Application pages (use DTOs)
```

## Data Flow Architecture

### Information Transformation Pipeline

```
iTunes API → Mapper → Domain Entity → Use Case → DTO → Context → UI
```

#### 1. iTunes API Response (Raw Data)

```typescript
// External iTunes structure with "im:" prefixes
{
  "im:id": { attributes: { "im:id": "123" } },
  "im:name": { label: "Podcast Title" },
  "im:artist": { label: "Author Name" },
  "im:image": [{ label: "image.jpg" }]
}
```

#### 2. Infrastructure Mapper (iTunes → Domain)

```typescript
// ItunesMappers.mapTopPodcastsResponse()
const podcastData: PodcastData = {
  id: entry.id.attributes["im:id"], // Extract from iTunes structure
  title: entry["im:name"].label, // Clean property names
  author: entry["im:artist"].label, // Remove "im:" paraphernalia
  image: this.extractImageUrl(images), // Smart image selection
};

return Podcast.create(podcastData); // Domain entity
```

#### 3. Domain Entity (Business Logic)

```typescript
// Podcast entity with Value Objects and business rules
export class Podcast {
  constructor(
    private readonly id: PodcastId, // Value Object
    private readonly title: string,
    private readonly author: string
  ) {}

  getBestImageUrl(): string {
    /* business logic */
  }
  getTitle(): string {
    return this.title;
  }
}
```

#### 4. Use Case (Entity → DTO)

```typescript
// GetTopPodcasts.mapToDTO()
private mapToDTO(podcasts: Podcast[]): PodcastListDTO[] {
  return podcasts.map(podcast => ({
    id: podcast.getId().getValue(),     // VO → primitive
    title: podcast.getTitle(),          // Entity method
    author: podcast.getAuthor(),        // Entity method
    image: podcast.getBestImageUrl(),   // Business logic applied
    description: podcast.getDescription()
  }));
}
```

#### 5. Application DTO (Clean Interface)

```typescript
// PodcastListDTO - UI contract
interface PodcastListDTO {
  id: string; // Clean primitives
  title: string; // No "im:" prefixes
  author: string; // No iTunes structure
  image: string; // Best quality image selected
  description: string; // Ready for display
}
```

#### 6. Context API (State Management)

```typescript
// PodcastContext manages DTO state
interface PodcastState {
  podcasts: PodcastListDTO[]; // Clean DTOs only
  loading: boolean;
  error: string | null;
}

// Context calls DDD services internally
const podcasts = await podcastService.getTopPodcasts(); // DTOs
dispatch({ type: "FETCH_SUCCESS", payload: podcasts });
```

#### 7. UI Components (Presentation)

```typescript
// Components consume clean DTOs
const { podcasts } = usePodcast();

return podcasts.map(podcast => (
  <div key={podcast.id}>
    <h3>{podcast.title}</h3>        {/* No "im:name.label" */}
    <p>{podcast.author}</p>         {/* No "im:artist.label" */}
    <img src={podcast.image} />     {/* No complex image logic */}
  </div>
));
```

### Cache Strategy

**Cache Location:** Use Cases cache DTOs, not Domain entities

```typescript
// Cache stores serializable DTOs
this.cacheRepository.set(CACHE_KEY, podcastDTOs, TTL_HOURS);
```

**Benefits:**

- **Performance:** Cached DTOs skip entity creation overhead
- **Serialization:** DTOs are JSON-friendly, entities are not
- **Consistency:** UI always receives same DTO structure

### Data Integrity Guarantees

1. **Domain Boundaries:** Entities never leave Application layer
2. **Type Safety:** Each transformation is strongly typed
3. **Error Isolation:** Failed mappings don't corrupt domain state
4. **Cache Invalidation:** TTL-based cache prevents stale data
5. **Business Logic:** Centralized in Domain entities

This architecture ensures clean separation between external APIs, business logic, and presentation concerns while maintaining compliance with Context API requirements.

### Configuration

Environment variables in `.env`:

```bash
# API Limits
VITE_PODCAST_LIMIT=100
VITE_EPISODE_LIMIT=20

# Cache TTL (hours)
VITE_CACHE_TTL_HOURS=24

# API URLs (auto-detected by environment)
# Development: /rss, /lookup (uses proxy)
# Production: /us/rss, /lookup (direct URLs)
```

## Development

```bash
# Clone and install
git clone https://github.com/andradesdiego/podcaster.git
cd podcaster
npm install

# Development server
npm run dev

# Production build
npm run build
npm run preview

# Testing
npm run test
npm run test:coverage

# Code quality
npm run lint
```

## Migration Status

- ✅ **v1.4.0** - Complete DDD foundation
- ✅ **v1.5.0** - Context API migrated to use DDD services
- ✅ **v1.6.0** - All components migrated to clean DTOs
- 🚧 **Next:** Test suite updates for new architecture
- 📋 **Future:** Additional domain entities (users, subscriptions)

## Testing

- Domain, Application, Infrastructure layers tested
- UI components integration tests
- TypeScript strict mode with complete coverage
- **Note:** Test suite updates pending for new DTO structure

## Requirements Compliance

- Routes implemented: 3/3 (100% complete)
- Clean URLs (no hash routing)
- 24h caching system
- Real-time filtering
- Visual navigation indicator
- Optimized assets (Vite)
- Components from scratch
- Context API for state management ✅
- Development/production modes
- Native HTML5 player
- HTML description rendering
- TypeScript throughout

## Architecture Constraints & Trade-offs

### Context API + DDD Integration

This project implements a **hybrid architecture** that combines Domain-Driven Design principles with React Context API due to explicit technical requirements. While this approach fulfills assessment criteria, it introduces architectural compromises that are worth documenting:

**Constraint:** The technical specification requires Context API for state management, which creates a tension with clean DDD implementation.

**Architectural Impact:**

- **Layer Contamination:** The Context layer now handles both React state management and calls to domain services, violating single responsibility principle
- **Redundant Data Flow:** `Component → Context → DDD Service → Repository` introduces an unnecessary intermediate layer for simple data fetching scenarios
- **Mixed Paradigms:** Context API's imperative dispatch pattern conflicts with DDD's declarative service approach

**Implementation Approach:**
The Context layer has been adapted to serve as a thin facade over DDD services. While this maintains compliance with requirements, it represents a compromise between clean architecture and specification adherence.

**Future Scalability Considerations:**
This hybrid approach, while over-engineered for the current 3-view application, establishes a foundation for enterprise scenarios where the architecture would become more justified:

```typescript
// Potential future state management
const AppState = {
  user: UserAggregate,
  subscriptions: SubscriptionAggregate,
  favorites: FavoritesAggregate,
  podcasts: PodcastAggregate
}

// DDD services handling complex business logic
userService.subscribe(podcastId)
  → subscriptionService.addSubscription(user, podcast)
  → favoriteService.checkConflicts(user, podcast)
  → notificationService.sendConfirmation(user)
```

In such scenarios, Context API would manage state of multiple aggregates while DDD services orchestrate complex business logic between entities, making the current architectural foundation strategically valuable.

**Trade-off Assessment:**

- ✅ **Compliance:** Meets technical assessment requirements
- ✅ **Functionality:** Maintains all required features and caching behavior
- ✅ **Future-proofing:** Establishes scalable foundation for complex business scenarios
- ✅ **Clean Data:** UI components use clean DTOs instead of iTunes paraphernalia
- ⚠️ **Architecture:** Introduces layer mixing that complicates responsibility boundaries
- ⚠️ **Maintenance:** Additional complexity in data flow for state synchronization

This documentation serves to acknowledge the architectural tension while demonstrating understanding of both current constraints and long-term architectural vision.
