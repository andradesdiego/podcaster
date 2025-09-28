# Podcaster

A modern podcast application demonstrating Clean Architecture with React and TypeScript. Browse the top 100 music podcasts from iTunes, view detailed episode lists, and play content with HTML5 audio.

## Prerequisites

- **Node.js:** 20 LTS recommended (18 LTS minimum)
- **npm:** 9+ (included with Node 20 LTS)

## Quick Start

```bash
# Clone repository
git clone https://github.com/andradesdiego/podcaster.git
cd podcaster

# Install dependencies
npm install

# Development server
npm run dev

# Production build
npm run build
npm run preview

# Testing
npm run test
npm run test:run
npm run test:coverage

# Code quality
npm run lint
```

## Features

### Core Application

- Browse top 100 podcasts with responsive grid layout
- Real-time search by title and author with instant filtering
- Podcast detail view with navigable episode table
- Episode detail view with HTML5 audio player
- Clean URL routing without hash navigation
- Complete responsive design for mobile, tablet, and desktop

### Progressive Web App (PWA)

- Web App Manifest with native app experience
- Service Worker with intelligent caching strategy
- Offline support for core application functionality
- Install as native app on desktop and mobile

### Clean Architecture

- Domain layer with entities, value objects, and domain errors
- Application layer with use cases, ports, and DTOs
- Infrastructure layer with repositories, HTTP client, and mappers
- UI layer with Context API for state management
- Comprehensive test coverage (134 tests passing)
- TypeScript-first implementation with strict typing

### Production Ready

- Live deployment on Vercel with automated CI/CD
- Custom API routes for CORS handling (/api/episodes.js)
- Environment-specific configuration (dev proxy vs production API)
- CSS variables system with centralized design tokens
- 24-hour intelligent caching system

## Tech Stack

- **Frontend:** React 18.3.1 + TypeScript 5.9.2
- **Build Tool:** Vite 5.4.10 with proxy configuration
- **Routing:** React Router Dom (clean URLs)
- **Testing:** Vitest 1.0.4 + Testing Library
- **Styling:** Custom CSS + CSS Variables
- **State:** Context API + Clean Architecture Services
- **Cache:** localStorage with 24h TTL
- **API:** iTunes RSS + iTunes Lookup
- **Quality:** ESLint + Prettier + strict TypeScript
- **Deployment:** Vercel with serverless functions

## Architecture

### Hybrid Clean Architecture + Context API

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   UI Layer      │    │  Application    │    │ Infrastructure  │
│                 │    │     Layer       │    │     Layer       │
│ Context API     │◄──►│                 │◄──►│                 │
│ Components      │    │ Use Cases       │    │ Repositories    │
│ Pages           │    │ DTOs            │    │ HTTP Clients    │
│ Hooks           │    │ Ports           │    │ Cache           │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              ▲
                              │
                    ┌─────────────────┐
                    │  Domain Layer   │
                    │                 │
                    │ Entities        │
                    │ Value Objects   │
                    │ Domain Errors   │
                    └─────────────────┘
```

### Data Flow

```
iTunes API → Infrastructure → Domain Entities → Application DTOs → Context API → UI Components
```

### Key Architectural Decisions

**Hybrid Approach:** Combines Context API (React requirement) with Clean Architecture principles for optimal balance between simplicity and maintainability.

**Simplified DI:** Direct dependency injection in `src/app/di.ts` instead of complex container pattern.

**Rich Domain:** Domain entities contain business logic (duration formatting, image selection) rather than anemic models.

**Cache Strategy:** 24-hour TTL at Use Case level storing DTOs for optimal performance and serialization.

## Project Structure

```
src/
├── app/                    # Application configuration
│   ├── di.ts              # Dependency injection setup
│   └── router.tsx         # Application routing
├── domain/                # Domain layer (entities, value objects)
│   ├── entities/
│   ├── value-objects/
│   └── errors/
├── application/           # Application layer (use cases, DTOs)
│   ├── use-cases/
│   ├── dto/
│   └── ports/
├── infrastructure/        # Infrastructure layer (repositories, HTTP)
│   ├── repositories/
│   ├── http/
│   ├── cache/
│   └── mappers/
└── ui/                    # UI layer (components, pages, context)
    ├── components/
    ├── pages/
    ├── context/
    ├── hooks/
    └── styles/
```

## Environment Configuration

```bash
# Development (Vite proxy)
VITE_ITUNES_RSS_URL="/rss"
VITE_ITUNES_LOOKUP_URL="/lookup"

# Production (Vercel API routes)
VITE_ITUNES_RSS_URL="/us/rss"
VITE_ITUNES_LOOKUP_URL="/api/episodes"

# Cache & Limits
VITE_CACHE_TTL_HOURS=24
VITE_PODCAST_LIMIT=100
VITE_EPISODE_LIMIT=20
```

## Requirements Compliance

### Technical Assessment

- ✅ Context API for state management
- ✅ TypeScript with strict mode
- ✅ Components built from scratch
- ✅ Clean URLs (no hash routing)
- ✅ 24h intelligent caching
- ✅ Responsive design
- ✅ Build tools (dev/production modes)
- ✅ Comprehensive testing (134 tests)
- ✅ Custom hooks
- ✅ CSS variables system
- ✅ PWA capabilities
- ✅ Production deployment

### Functional Requirements

- ✅ Top 100 podcasts from iTunes
- ✅ Real-time search filtering
- ✅ Podcast detail with episodes
- ✅ Episode player (HTML5 audio)
- ✅ Clean navigation
- ✅ Loading states
- ✅ Error handling

## Testing Strategy

Comprehensive test suite with 134 tests covering:

- **Domain Layer:** Entity behavior, value object validation, domain rules
- **Application Layer:** Use case orchestration, DTO mapping, cache behavior
- **Infrastructure Layer:** Repository implementations, HTTP clients, mappers
- **UI Layer:** Component rendering, context behavior, user interactions

Testing tools: Vitest 1.0.4, Testing Library, jsdom for browser simulation.

## Development Workflow

### Git Strategy

- `feat/feature-name` - New features
- `refactor/scope` - Code refactoring
- `fix/issue-description` - Bug fixes

### Code Quality

- ESLint: TypeScript strict rules
- Prettier: Consistent formatting
- TypeScript: Complete type coverage
- Vitest: Unit and integration testing

## Performance

- **Cache Benefits:** 24-hour localStorage caching reduces API calls
- **PWA Features:** Service Worker provides offline access and faster loads
- **Bundle Optimization:** Vite tree shaking and code splitting
- **Network Efficiency:** Intelligent request caching with TTL

## Deployment

**Live Demo:** [https://podcaster-eight-blush.vercel.app/](https://podcaster-eight-blush.vercel.app/)

**Development:**

```bash
npm run dev     # Vite development server
npm run test    # Test runner with watch
npm run lint    # Code quality checks
```

**Production:**

```bash
npm run build   # TypeScript + Vite production build
npm run preview # Preview production build locally
```

## Architecture Benefits

This hybrid approach demonstrates how to implement Clean Architecture principles within React ecosystem constraints:

**Maintainability:** Clear separation of concerns with domain logic isolated from framework details.

**Testability:** Each layer tested independently with appropriate mocking strategies.

**Scalability:** Domain-driven design allows easy extension of business rules and features.

**React Integration:** Context API satisfies framework requirements while maintaining architectural integrity.

The result is a codebase that balances architectural purity with pragmatic React development, suitable for both educational purposes and production applications.
