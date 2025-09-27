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
- Comprehensive test coverage with 113 passing tests
- TypeScript-first implementation with strict typing
- Environment configuration system
- **HomePage migrated to DDD architecture**

## Tech Stack

- **Frontend:** React 18.3.1 + TypeScript 5.9.2
- **Build Tool:** Vite 5.4.10 with advanced proxy configuration
- **Routing:** React Router Dom 6.20.1 (clean URLs)
- **Testing:** Vitest 1.0.4 + Testing Library + full coverage
- **Styling:** Custom CSS + CSS Variables (zero UI dependencies)
- **State:** DDD Services + Context API (legacy)
- **Cache:** localStorage with intelligent TTL validation (24h)
- **API:** iTunes RSS + iTunes Lookup (via Vite proxy)
- **Quality:** ESLint + Prettier + strict configuration

## Application Views

- **HomePage (/)** - Top 100 podcasts with advanced search (DDD architecture)
- **PodcastDetail (/podcast/:id)** - Complete episode list + sidebar (Context API)
- **EpisodeDetail (/podcast/:id/episode/:id)** - Audio player + HTML description (Context API)

## Architecture

### DDD Implementation

```
src/
├── domain/                    # Entities, Value Objects, Errors
├── application/               # Use Cases, Ports, DTOs, Services
├── infrastructure/            # Repositories, HTTP, Cache, DI
├── hooks/                     # UI integration hooks
│   └── usePodcastService.ts   # DDD service integration
├── context/                   # Legacy Context API (being phased out)
├── components/                # Reusable UI components
└── pages/                     # Application pages
```

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
- ✅ **v1.5.0** - HomePage migrated to DDD architecture
- 🚧 **Next:** PodcastDetail page migration
- 📋 **Future:** EpisodeDetail page migration
- 🧹 **Final:** Remove legacy Context API

## Testing

- **113 tests** covering all layers
- Domain, Application, Infrastructure, UI components
- Integration tests for user flows
- TypeScript strict mode with complete coverage

## Requirements Compliance

- Routes implemented: 3/3 (100% complete)
- Clean URLs (no hash routing)
- 24h caching system
- Real-time filtering
- Visual navigation indicator
- Optimized assets (Vite)
- Components from scratch
- Context API + DDD Services
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
- ⚠️ **Architecture:** Introduces layer mixing that complicates responsibility boundaries
- ⚠️ **Maintenance:** Additional complexity in data flow for state synchronization

This documentation serves to acknowledge the architectural tension while demonstrating understanding of both current constraints and long-term architectural vision.
