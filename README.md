# Podcaster

A modern podcast application demonstrating Domain-Driven Design architecture with React and TypeScript. Browse the top 100 music podcasts from iTunes, view detailed episode lists, and play content with HTML5 audio.

## Prerequisites

- **Node.js:** 20 LTS recommended (18 LTS minimum)
- **npm:** 9+ (included with Node 20 LTS)

### Version Compatibility

| Tool       | Version | Node Requirement |
| ---------- | ------- | ---------------- |
| Vite       | 5.4.10  | Node 18+         |
| React      | 18.3.1  | Node 16+         |
| TypeScript | 5.9.2   | Node 18+         |

**Tested on:** Node 20.x LTS

## Quick Start

```bash
# Clone repository
git clone https://github.com/andradesdiego/podcaster.git
cd podcaster

# Use recommended Node version (if using nvm)
nvm use

# Install dependencies
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

## Features

✅ **Core Application (MVP3):**

- Browse top 100 podcasts with responsive grid layout
- Real-time search by title and author with instant filtering
- Podcast detail view with navigable episode table
- Episode detail view with HTML5 audio player
- 24-hour intelligent caching system for podcasts and episodes
- Clean URL routing without hash navigation
- Visual navigation indicator in top-right corner
- Complete responsive design for mobile, tablet, and desktop

✅ **DDD Architecture Complete:**

- Domain layer with entities, value objects, and domain errors
- Application layer with use cases, ports, and DTOs
- Infrastructure layer with repositories, HTTP client, and DI container
- Context API + DDD Services hybrid architecture
- Comprehensive test coverage with 107 passing tests
- TypeScript-first implementation with strict typing

✅ **Production Deployment:**

- Live deployment on Vercel with automated CI/CD
- Custom API routes for CORS handling (/api/episodes.js)
- Environment-specific configuration (dev proxy vs production API)
- CSS variables system with centralized design tokens
- Clean architecture without legacy dependencies

## Tech Stack

- **Frontend:** React 18.3.1 + TypeScript 5.9.2
- **Build Tool:** Vite 5.4.10 with advanced proxy configuration
- **Routing:** React Router Dom 6.20.1 (clean URLs)
- **Testing:** Vitest 1.0.4 + Testing Library + full coverage
- **Styling:** Custom CSS + CSS Variables (zero UI dependencies)
- **State:** Context API + DDD Services (hybrid architecture)
- **Cache:** localStorage with intelligent TTL validation (24h)
- **API:** iTunes RSS + iTunes Lookup (via Vite proxy / Vercel API routes)
- **Quality:** ESLint + Prettier + strict configuration
- **Deployment:** Vercel with serverless functions

## Code Quality

- **ESLint:** TypeScript strict rules with React plugins
- **Prettier:** Consistent code formatting with custom configuration
- **TypeScript:** Strict mode with complete type coverage

## Architecture Overview

### Domain-Driven Design Implementation

This project implements a complete DDD architecture while maintaining React Context API for state management as per technical requirements. The solution balances architectural principles with practical constraints.

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Application    │    │ Infrastructure  │
│                 │    │     Layer       │    │     Layer       │
│ Components      │◄──►│                 │◄──►│                 │
│ Context API     │    │ Use Cases       │    │ Repositories    │
│ Custom Hooks    │    │ Services        │    │ HTTP Clients    │
│                 │    │ DTOs            │    │ Cache           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              ▲
                              │
                    ┌─────────────────┐
                    │  Domain Layer   │
                    │                 │
                    │ Entities        │
                    │ Value Objects   │
                    │ Domain Errors   │
                    │                 │
                    └─────────────────┘
```

### CORS Solution Architecture

**Development Environment:**

```
Frontend → Vite Proxy (/lookup) → iTunes API
```

**Production Environment:**

```
Frontend → Vercel API Route (/api/episodes) → iTunes API
```

The `/api/episodes.js` serverless function acts as a transparent CORS proxy, allowing the frontend to fetch episode data without cross-origin restrictions while maintaining the same DDD architecture.

### Environment Configuration

```bash
# Development (Vite proxy)
VITE_API_BASE_URL=""
VITE_ITUNES_RSS_URL="/rss"
VITE_ITUNES_LOOKUP_URL="/lookup"

# Production (Vercel API routes)
VITE_API_BASE_URL="https://itunes.apple.com"
VITE_ITUNES_RSS_URL="/us/rss"
VITE_ITUNES_LOOKUP_URL="/api/episodes"

# Cache & Limits
VITE_CACHE_TTL_HOURS=24
VITE_PODCAST_LIMIT=100
VITE_EPISODE_LIMIT=20
```

### Key Architectural Decisions

#### 1. Hybrid Context API + DDD Architecture

**Decision:** Integrate DDD services with React Context API rather than replacing it.

**Rationale:** Technical specification requires Context API for state management. Rather than violating this constraint, we created a thin facade where Context API manages React state while delegating business logic to DDD services.

**Trade-offs:**

- ✅ Meets technical requirements
- ✅ Demonstrates DDD principles
- ✅ Establishes scalable foundation
- ⚠️ Introduces layer redundancy for simple operations
- ⚠️ Mixed paradigms (imperative dispatch + declarative services)

#### 2. Data Transformation Pipeline

**Decision:** Implement complete data transformation from iTunes API to clean DTOs.

**Flow:**

```typescript
iTunes API → Infrastructure Mapper → Domain Entity → Use Case → DTO → Context → UI
```

**Rationale:** Eliminate external API dependencies from UI components and establish clean data contracts.

**Benefits:**

- **UI Independence:** Components consume clean DTOs regardless of external API changes
- **Type Safety:** Compile-time guarantees throughout data transformation
- **Business Logic Isolation:** Domain entities encapsulate podcast-specific rules
- **Cache Efficiency:** DTOs are JSON-serializable for localStorage

#### 3. Cache Strategy

**Decision:** Implement cache at Use Case level storing DTOs rather than Domain entities.

**Implementation:**

```typescript
// Cache stores clean DTOs, not domain entities
this.cacheRepository.set(CACHE_KEY, podcastDTOs, TTL_HOURS);
```

**Cache Behavior:**

- First visit: fetch from API + save to localStorage
- Subsequent visits: read from localStorage (no network requests)
- TTL validation: 24-hour expiration per podcast/episode set

**Benefits:**

- **Performance:** Cached DTOs skip entity creation and transformation overhead
- **Serialization:** DTOs are naturally JSON-compatible for localStorage
- **Consistency:** UI always receives same DTO structure regardless of cache state
- **TTL Management:** 24-hour intelligent cache with automatic invalidation

#### 4. Component Architecture

**Decision:** Create modular, single-responsibility components with clean prop interfaces.

**Component Hierarchy:**

```
App
├── Layout (navigation + loading indicator)
├── HomePage
│   ├── SearchInput
│   └── PodcastCard (grid)
├── PodcastDetail
│   ├── PodcastSidebar (reusable)
│   └── EpisodeTable
└── EpisodeDetail
    ├── PodcastSidebar (reusable)
    └── AudioPlayer (HTML5)
```

**Design Principles:**

- **Single Responsibility:** Each component has one clear purpose
- **Reusability:** PodcastSidebar used in both detail views
- **Prop Interfaces:** Components accept DTOs with clean, predictable properties
- **Separation of Concerns:** Presentation logic separated from business logic

### Technology Stack Decisions

#### Build Tool: Vite vs Create React App

**Decision:** Vite 5.4.10

**Rationale:**

- **Performance:** Faster development server and hot module replacement
- **Modern Standards:** Native ES modules and optimized bundling
- **TypeScript Support:** First-class TypeScript integration without additional configuration
- **Proxy Configuration:** Advanced proxy setup for iTunes API CORS handling

#### State Management: Context API + DDD Services

**Decision:** Hybrid approach maintaining Context API while adding DDD layer.

**Context Responsibilities:**

- React state management (loading, error, data)
- Component state synchronization
- UI-specific concerns

**DDD Service Responsibilities:**

- Business logic and domain rules
- Data transformation and validation
- Cache management and HTTP operations
- Cross-cutting concerns

#### Testing Strategy: Vitest + Testing Library

**Decision:** Comprehensive testing across all architectural layers.

**Test Coverage:**

- **Domain Layer:** Entity business logic and value object validation
- **Application Layer:** Use case orchestration and service integration
- **Infrastructure Layer:** Repository implementations and HTTP clients
- **UI Layer:** Component behavior and user interactions

**Testing Philosophy:**

- **Unit Tests:** Focus on individual component/service responsibilities
- **Integration Tests:** Verify layer interactions and data flow
- **Mock Strategy:** Mock external dependencies, test business logic

### Data Flow Architecture

#### Information Transformation Pipeline

```
iTunes API → Mapper → Domain Entity → Use Case → DTO → Context → UI
```

#### Detailed Flow Example

**1. iTunes API Response (External)**

```json
{
  "im:id": { "attributes": { "im:id": "123" } },
  "im:name": { "label": "Podcast Title" },
  "im:artist": { "label": "Author Name" }
}
```

**2. Infrastructure Mapper (iTunes → Domain)**

```typescript
const podcastData: PodcastData = {
  id: entry.id.attributes["im:id"],
  title: entry["im:name"].label,
  author: entry["im:artist"].label,
  image: this.extractImageUrl(images),
};
return Podcast.create(podcastData);
```

**3. Domain Entity (Business Logic)**

```typescript
export class Podcast {
  constructor(
    private readonly id: PodcastId, // Value Object
    private readonly title: string,
    private readonly author: string,
  ) {}

  getBestImageUrl(): string {
    /* business logic */
  }
}
```

**4. Use Case (Entity → DTO)**

```typescript
private mapToDTO(podcasts: Podcast[]): PodcastListDTO[] {
  return podcasts.map(podcast => ({
    id: podcast.getId().getValue(),     // VO → primitive
    title: podcast.getTitle(),
    author: podcast.getAuthor(),
    image: podcast.getBestImageUrl(),   // Business logic applied
    description: podcast.getDescription()
  }));
}
```

**5. Context API (State Management)**

```typescript
interface PodcastState {
  podcasts: PodcastListDTO[]; // Clean DTOs only
  loading: boolean;
  error: string | null;
}
```

**6. UI Components (Presentation)**

```typescript
const { podcasts } = usePodcast();
return podcasts.map(podcast => (
  <div key={podcast.id}>
    <h3>{podcast.title}</h3>        {/* No "im:name.label" */}
    <p>{podcast.author}</p>         {/* No "im:artist.label" */}
    <img src={podcast.image} />     {/* No complex image logic */}
  </div>
));
```

### Performance Optimizations

#### Cache Implementation

**Strategy:** Multi-layer caching with intelligent TTL management.

**Cache Layers:**

1. **Browser Cache:** Automatic HTTP cache for static assets
2. **Application Cache:** localStorage with 24-hour TTL for podcast data
3. **Component Cache:** React component memoization for expensive renders

**Cache Benefits:**

- **Reduced API Calls:** 24-hour cache eliminates redundant iTunes API requests
- **Improved UX:** Instant loading for cached content
- **Offline Resilience:** Graceful degradation when network unavailable
- **Cost Efficiency:** Reduced bandwidth usage and API rate limiting

#### Bundle Optimization

**Development Mode:**

- Unminified assets for debugging
- Source maps for development tools
- Hot module replacement for fast iteration

**Production Mode:**

- Minified and concatenated assets
- Tree shaking for unused code elimination
- Code splitting for optimized loading

### Migration & Refactoring History

#### v1.6.0 → v1.7.0: Clean Architecture & Production Deployment

**Completed Clean-up:**

- ✅ Eliminated `src/types/podcast.ts` legacy types with iTunes "im:" structure
- ✅ Removed `usePodcastService` hook (replaced by Context API thin layer)
- ✅ Migrated all components (HomePage, PodcastDetail, EpisodeDetail) to pure DTOs
- ✅ Implemented comprehensive CSS variables system (#007297 primary color)
- ✅ Context API refactored as thin facade over DDD services

**CORS Solution Implementation:**

- ✅ Created Vercel serverless function `/api/episodes.js` for production
- ✅ Environment-specific URL configuration (Vite proxy vs Vercel API)
- ✅ Eliminated dependency on unreliable third-party CORS proxies
- ✅ Production deployment with full episode functionality

**Code Quality Improvements:**

- ✅ Centralized design tokens with CSS variables system
- ✅ Eliminated hardcoded shadows, colors, and spacing values
- ✅ English comments throughout codebase for consistency
- ✅ Removed all legacy code dependencies and circular imports

**Architecture Refinements:**

- ✅ Container DI system maintained for clean dependency injection
- ✅ Repository pattern simplified without legacy conversion logic
- ✅ Use Cases now use centralized configuration from `config/env.ts`
- ✅ Clean data flow: iTunes API → Domain → DTOs → Context → UI

### Scalability Considerations

#### Future Enterprise Scenarios

This architecture establishes foundations for complex business scenarios:

```typescript
// Potential future state management
const AppState = {
  user: UserAggregate,
  subscriptions: SubscriptionAggregate,
  favorites: FavoritesAggregate,
  podcasts: PodcastAggregate,
  recommendations: RecommendationAggregate
}

// DDD services handling complex business logic
userService.subscribe(podcastId)
  → subscriptionService.addSubscription(user, podcast)
  → favoriteService.checkConflicts(user, podcast)
  → recommendationService.updateUserPreferences(user)
  → notificationService.sendConfirmation(user)
```

#### Domain Expansion

The current podcast domain can be extended with additional bounded contexts:

- **User Management:** Authentication, profiles, preferences
- **Content Discovery:** Recommendations, categories, search
- **Social Features:** Reviews, sharing, playlists
- **Analytics:** Listening history, behavior tracking

### Requirements Compliance

#### Technical Assessment Requirements

- ✅ **Context API:** Used for state management as required
- ✅ **TypeScript:** Complete type coverage with strict mode
- ✅ **Components from Scratch:** No external UI libraries
- ✅ **Clean URLs:** React Router without hash routing
- ✅ **24h Caching:** localStorage with intelligent TTL
- ✅ **Responsive Design:** Mobile, tablet, desktop support
- ✅ **Build Tools:** Vite with development/production modes
- ✅ **Testing:** Comprehensive test suite with 107 passing tests
- ✅ **Custom Hooks:** useContext abstraction and service integration
- ✅ **CSS Variables:** Centralized design system implementation
- ✅ **Production Deployment:** Live on Vercel with API routes

#### Functional Requirements

- ✅ **Top 100 Podcasts:** iTunes RSS feed integration
- ✅ **Real-time Search:** Instant filtering by title and author
- ✅ **Podcast Details:** Episode list with metadata
- ✅ **Episode Player:** HTML5 audio with multiple format support
- ✅ **Navigation:** Clean URLs with browser history
- ✅ **Loading States:** Visual indicators for async operations
- ✅ **Error Handling:** Graceful degradation and user feedback

### Development Workflow

#### Git Strategy

**Branch Naming Convention:**

- `feat/feature-name` - New features
- `refactor/scope` - Code refactoring
- `fix/issue-description` - Bug fixes
- `docs/section` - Documentation updates

**Commit Message Format:**

```
type(scope): description

- Detailed change description
- Breaking changes noted
- Related issue references
```

**Tagging Strategy:**

- `v1.x.0` - Major architectural milestones
- `v1.x.y` - Feature additions and improvements

#### Quality Assurance

**Code Quality Tools:**

- **ESLint:** TypeScript strict rules with React plugins
- **Prettier:** Consistent code formatting
- **TypeScript:** Strict mode with complete type coverage
- **Vitest:** Fast unit and integration testing

**Pre-commit Checklist:**

- All tests passing (107/107)
- No ESLint warnings or errors
- TypeScript compilation successful
- Build process completed without issues

### Deployment Strategy

**Development Environment:**

```bash
npm run dev     # Vite development server with HMR
npm run test    # Vitest test runner with watch mode
npm run lint    # ESLint with TypeScript rules
```

**Production Build:**

```bash
npm run build   # TypeScript compilation + Vite production build
npm run preview # Preview production build locally
```

**Production Deployment:**

- **Platform:** Vercel with automated CI/CD from GitHub
- **API Routes:** Serverless functions in `/api` directory
- **Environment Variables:** Configured in Vercel dashboard
- **Build:** Automatic builds on push to main branch
- **CORS Handling:** Custom `/api/episodes.js` endpoint for iTunes API

**Environment Configuration:**

- Development: Vite proxy for iTunes API CORS handling
- Production: Vercel API routes with environment-specific URLs
- Testing: Mocked HTTP clients and localStorage

This architecture demonstrates enterprise-level thinking while solving the immediate requirements efficiently. The hybrid approach acknowledges technical constraints while establishing patterns that scale to complex business scenarios. The production deployment on Vercel with custom API routes provides a robust solution to CORS limitations while maintaining clean architectural boundaries.
