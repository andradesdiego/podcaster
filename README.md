# 🎵 Podcaster App

A modern podcast application built for technical assessment. Browse the top 100 music podcasts from iTunes, view detailed episode lists, play content with HTML5 audio, and enjoy a complete podcasting experience with clean URLs and intelligent caching.

## 🚀 Features

**✅ Core Application (MVP3):**

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

**✅ Infrastructure Layer:**

- Real repository implementations with iTunes API integration
- HTTP client with error handling and type safety
- Cache repository with localStorage and TTL management
- iTunes API mappers for domain entity transformation
- Dependency injection container with service registration
- Complete test coverage for all infrastructure components

**✅ DDD Foundation Complete:**

- Domain layer with entities, value objects, and domain errors
- Application layer with use cases, ports, and DTOs
- Infrastructure layer with repositories, HTTP client, and DI container
- Service layer providing facade for UI components
- Comprehensive test coverage with 109 passing tests
- TypeScript-first implementation with strict typing
- Parallel change approach - existing functionality preserved

## 🛠 Tech Stack

- **Frontend**: React 18.3.1 + TypeScript 5.9.2
- **Build Tool**: Vite 5.4.10 with advanced proxy configuration
- **Routing**: React Router Dom 6.20.1 (clean URLs)
- **Testing**: Vitest 1.0.4 + Testing Library + full coverage
- **Styling**: Custom CSS + CSS Variables (zero UI dependencies)
- **State**: Context API + useReducer pattern
- **Cache**: localStorage with intelligent TTL validation (24h)
- **API**: iTunes RSS + iTunes Lookup (via Vite proxy)
- **Quality**: ESLint + Prettier + strict configuration
- **Runtime**: Node.js 20.x LTS

## 🏗 Architecture

### Application Structure (MVP3 + DDD Foundation)

```
📱 Application Views
├── HomePage (/)                           # Top 100 podcasts with advanced search
├── PodcastDetail (/podcast/:id)          # Complete episode list + sidebar
└── EpisodeDetail (/podcast/:id/episode/:id) # Audio player + HTML description

🗃 State Management
├── PodcastContext                        # Global state with useReducer
├── Podcast Cache (24h TTL)              # Top 100 podcasts with invalidation
├── Episode Cache (24h TTL)              # Independent per podcast
├── Granular Loading States              # Separated per resource
└── Centralized Error Handling           # With automatic recovery

🏛 DDD Complete Architecture (Parallel Implementation)
├── Domain Layer
│   ├── Entities (Podcast, Episode)      # Business logic encapsulation
│   ├── Value Objects (PodcastId)        # Domain primitives with validation
│   └── Domain Errors                    # Specific error types
├── Application Layer
│   ├── Use Cases                        # Business operations
│   ├── Ports                           # Repository interfaces
│   ├── DTOs                            # Data transfer objects
│   └── Services                        # Application facade
├── Infrastructure Layer
│   ├── Repositories                    # iTunes API implementations
│   ├── HTTP Client                     # Fetch wrapper with error handling
│   ├── Cache Repository                # localStorage with TTL
│   ├── Mappers                         # API response transformations
│   └── DI Container                    # Service registration
└── Test Coverage                        # 109 tests covering all layers
```

### Component Architecture

```
src/
├── components/                   # Reusable component library
│   ├── Layout.tsx               # Main layout with navigation indicator
│   ├── PodcastCard.tsx          # Podcast card with hover effects
│   ├── PodcastSidebar.tsx       # Reusable sidebar with contextual navigation
│   └── SearchInput.tsx          # Search with advanced functionality
├── pages/                       # Main application pages
│   ├── HomePage.tsx             # Podcast grid + real-time search
│   ├── PodcastDetail.tsx        # Episode list + navigable sidebar
│   └── EpisodeDetail.tsx        # Audio player + HTML description
├── context/                     # Centralized global state
│   └── PodcastContext.tsx       # Context + complete episode integration
├── domain/                      # DDD Domain layer
│   ├── entities/                # Business entities
│   ├── value-objects/           # Domain primitives
│   └── errors/                  # Domain-specific errors
├── application/                 # DDD Application layer
│   ├── use-cases/               # Business operations
│   ├── ports/                   # Repository interfaces
│   ├── dto/                     # Data transfer objects
│   └── services/                # Application facade
├── infrastructure/              # DDD Infrastructure layer
│   ├── repositories/            # iTunes API implementations
│   ├── http/                    # HTTP client with error handling
│   ├── cache/                   # localStorage cache with TTL
│   ├── mappers/                 # API response transformations
│   └── di/                      # Dependency injection container
├── hooks/                       # Custom specialized hooks
│   ├── usePodcastFilter.ts      # Real-time search filtering
│   └── useNavigationIndicator.ts # Visual navigation indicator
├── types/                       # Complete TypeScript definitions
│   └── podcast.ts               # iTunes API types + validations
└── __tests__/                   # Complete testing suite
    ├── domain/                  # Domain layer tests
    ├── application/             # Application layer tests
    ├── infrastructure/          # Infrastructure layer tests
    └── components/              # Component unit tests
```

## 🎯 Requirements Status

### ✅ Core Requirements Completed

- **Main view** (`/`) - Top 100 podcasts with real-time search ✅
- **Podcast detail** (`/podcast/:id`) - Episode list + navigable sidebar ✅
- **Episode detail** (`/podcast/:id/episode/:id`) - Player + HTML description ✅
- **Clean URLs** - No hash routing, complete SPA navigation ✅
- **24h caching system** - Podcasts and episodes cached independently ✅
- **Real-time filtering** - Instant search by title and author ✅
- **Visual navigation indicator** - Spinner in top-right corner ✅
- **Optimized assets** - Concatenation and minification via Vite ✅

### ✅ Technical Requirements

- **Components from scratch** - Zero external UI dependencies ✅
- **Context API state management** - No external state libraries ✅
- **Development/production modes** - Assets served per environment ✅
- **Native HTML5 player** - Audio with native browser controls ✅
- **HTML description rendering** - Rich episode content ✅
- **Contextual sidebar links** - Intuitive navigation between views ✅
- **TypeScript throughout** - Complete type safety ✅

## 🚦 Development Commands

```bash
# Development server with hot reload
npm run dev

# Production build
npm run build
npm run preview

# Testing suite
npm run test
npm run test:coverage

# Code quality
npm run lint
```

## 🏃‍♂️ Quick Start

```bash
# Clone and install dependencies
git clone <https://github.com/andradesdiego/podcaster.git>
cd podcaster
npm install

# Verify setup
npm run lint

# Start development environment
npm run dev
# → http://localhost:5173

# Run tests
npm run test

# Build for production
npm run build
```

## 🧪 Testing Strategy

- **Domain Layer**: 109 tests covering entities, value objects, and errors
- **Application Layer**: Use cases, services, and DTOs with comprehensive mocking
- **Infrastructure Layer**: HTTP client, cache, mappers, and DI container
- **Component Tests**: UI components and user interactions
- **Integration Tests**: End-to-end user flows
- **TypeScript**: Strict mode with complete type coverage

## 🏷 Version History

- **v1.0.0** (MVP1): Basic podcast list + search + cache
- **v1.1.0** (MVP2): Podcast detail + episodes + navigation
- **v1.2.0** (MVP3): Audio player + HTML description + component refactor
- **v1.3.0** (Infrastructure Complete): Complete DDD architecture with real repositories ← **Current**

## 📊 Project Metrics

- **Routes implemented**: 3/3 (100% complete) ✅
- **TypeScript coverage**: 100% strict typing
- **API integration**: iTunes RSS + Lookup fully functional
- **Cache hit rate**: 24h TTL with optimized localStorage
- **Build size**: <500KB gzipped (Vite optimized)
- **Test coverage**: 109 tests with comprehensive coverage
- **Architecture**: Ready for gradual migration to DDD

## 🏗 Architecture Notes

This project implements a **parallel change approach** for introducing Domain-Driven Design. The existing MVP3 functionality remains fully operational while the complete DDD architecture is built alongside it.

**Current State**: Complete DDD architecture with domain entities, application services, infrastructure repositories, and comprehensive test coverage. Ready for gradual component migration.

**Next Phase**: Progressive migration of UI components to use the new DDD architecture.

---

**Status**: ✅ **Fully functional** - Production-ready with all required features implemented and complete DDD architecture established for future scalability.
