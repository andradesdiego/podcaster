# Podcaster App

Una aplicación de podcasts musicales desarrollada con React, TypeScript y Vite. Permite navegar y buscar entre los 100 podcasts más populares de iTunes con funcionalidades de filtrado en tiempo real y un sistema de caché inteligente.

## 🚀 Funcionalidades Actuales

La aplicación proporciona una experiencia completa de navegación de podcasts:

- Navegación por los 100 podcasts musicales más populares con grid responsive
- Búsqueda en tiempo real por título y autor
- Sistema de caché inteligente de 24 horas
- Imágenes circulares flotantes de podcasts
- UI moderna y limpia construida completamente desde cero

## 🛠️ Stack Tecnológico

- **Frontend**: React 18.3.1 + TypeScript 5.9.2
- **Build Tool**: Vite 5.4.10
- **Routing**: React Router Dom 6.20.1
- **Testing**: Vitest 1.0.4 + Testing Library
- **Styling**: CSS Modules + Variables CSS
- **Estado**: Context API con useReducer
- **Caché**: localStorage con validación TTL
- **Linting**: ESLint + Prettier
- **Node.js**: 20.x LTS

## 🏗️ Arquitectura

### Gestión de Estado

Utiliza Context API para gestión de estado global con caché inteligente:

```
PodcastContext
├── Datos globales de podcasts
├── Estados de loading/error
├── Caché de 24h con TTL
└── Validación automática de caché
```

### Estructura de Componentes

```
src/
├── components/           # Componentes UI reutilizables
│   ├── Layout.tsx       # Layout de app con header sticky
│   ├── PodcastCard.tsx  # Tarjeta individual de podcast
│   └── SearchInput.tsx  # Búsqueda con funcionalidad clear
├── pages/               # Componentes de ruta
│   └── HomePage.tsx     # Vista principal del grid de podcasts
├── context/             # Gestión de estado global
│   └── PodcastContext.tsx # Proveedor de context con caché
├── hooks/               # Custom hooks de React
│   └── usePodcastFilter.ts # Lógica de búsqueda en tiempo real
├── types/               # Definiciones TypeScript
│   └── podcast.ts       # Tipos de respuesta API
└── styles/              # Estilos globales
    ├── variables.css    # Tokens del sistema de diseño
    └── base.css         # Reset CSS + estilos base
```

### Integración API

- **API iTunes**: Endpoint top podcasts con proxy CORS
- **Estrategia Caché**: localStorage con validación timestamp
- **Performance**: Cache-first con TTL 24h reduce llamadas API

## 🎨 Sistema de Diseño

### Variables CSS

Tokens de diseño centralizados para consistencia:

```css
/* Colores */
--color-bg: #ffffff;
--color-bg-alt: #f9f9f9;
--color-text: #111111;
--color-accent: #0070f3;

/* Tipografía */
--font-base: system-ui, sans-serif;
--font-size-base: 16px;

/* Layout */
--radius-card: 1rem;
--spacing-md: 1rem;
```

### Grid Responsive

Layout adaptativo optimizado para todos los dispositivos:

- **Móvil** (≤640px): 2 columnas, padding reducido
- **Tablet** (641-1024px): 3 columnas
- **Desktop** (1025-1399px): 4 columnas
- **Desktop Grande** (≥1400px): 5 columnas

### Diseño de Tarjetas

- Imágenes circulares de podcasts (130px) que flotan sobre las tarjetas
- Bordes parciales (derecho, inferior, izquierdo solamente)
- Sombras direccionales (sin sombra superior)
- Animaciones suaves de hover con translateY

## ⚡ Comandos Disponibles

### Desarrollo

```bash
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build de producción
```

### Testing

```bash
npm run test         # Tests en modo watch
npm run test:run     # Ejecución única de tests
npm run test:coverage # Reporte de cobertura de tests
```

### Calidad de Código

```bash
npm run lint         # Verificación ESLint
```

## ✅ Funcionalidades Implementadas

### Versión 1.1.0 (Actual)

- Navegación por los 100 podcasts musicales más populares de la API iTunes
- Filtrado de búsqueda en tiempo real por título y autor
- Layout de grid responsive con imágenes circulares flotantes
- Context API para gestión de estado global
- Sistema de caché inteligente con TTL de 24h
- React Router para navegación SPA
- Suite de tests completa (42 tests pasando)
- Arquitectura CSS moderna con tokens de diseño

### Funcionalidad de Búsqueda

- **Filtrado en tiempo real**: Los resultados se actualizan mientras escribes
- **Búsqueda multi-campo**: Busca tanto en título como en autor
- **Case-insensitive**: Funciona independientemente del case del input
- **Feedback visual**: Contador dinámico de resultados
- **Funcionalidad clear**: Reset rápido con botón X
- **Estado sin resultados**: Mensaje útil con opción de reset

### Sistema de Caché

- **TTL de 24 horas**: Reduce llamadas innecesarias a la API
- **Validación timestamp**: Expiración automática de caché
- **Fallback elegante**: Fetch fresco cuando caché inválido
- **localStorage**: Persistente a través de sesiones del navegador
- **Manejo de errores**: Continúa sin caché si no está disponible

### Optimizaciones de Performance

- **useMemo**: Filtrado de búsqueda optimizado
- **Lazy loading**: Las imágenes cargan progresivamente
- **Re-renders mínimos**: Optimizaciones de context
- **Bundle splitting**: Code splitting de Vite
- **Optimización assets**: Minificación de producción

## 🧪 Estrategia de Testing

Cobertura de tests completa sin over-engineering:

- **Tests de componentes**: Comportamiento UI e interacciones
- **Tests de hooks**: Lógica custom y casos edge
- **Tests de context**: Gestión de estado y caché
- **Tests de integración**: Comunicación entre componentes
- **42 tests en total**: Enfocados en funcionalidad crítica

## 🛣️ Rutas

- **`/`**: Homepage con grid de podcasts y búsqueda
- **`/podcast/:id`**: Detalle de podcast (próximamente)

## 🔄 Enfoque de Desarrollo

Construido usando estrategia de desarrollo incremental:

1. **MVP-1**: Funcionalidad core (search + browse) ✅
2. **Context + Caché**: Base de estado global ✅
3. **Detalle Podcast**: Vista individual de podcast (en progreso)
4. **Reproductor Episodio**: Funcionalidad de reproducción audio
5. **Refactor DDD**: Implementación arquitectura limpia

## 📋 Cumplimiento de Requisitos

- **Sin librerías UI externas**: Todos los componentes construidos desde cero ✅
- **Context API**: Gestión de estado global según especificado ✅
- **Caché 24h**: localStorage con validación TTL ✅
- **URLs limpias**: React Router sin fragmentos hash ✅
- **TypeScript**: Seguridad de tipos completa ✅
- **Diseño responsive**: Enfoque mobile-first ✅
- **Performance**: Rendering y caché optimizados ✅
- **Testing**: Cobertura completa sin complejidad ✅

## 🌐 Soporte de Navegadores

Optimizado para navegadores modernos:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 🚀 Instalación y Uso

```bash
# Clonar repositorio
git clone [repository-url]
cd podcaster

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Ejecutar tests
npm test

# Build para producción
npm run build
```

## 🔀 Workflow de Desarrollo

Utiliza estrategia de feature branches con releases incrementales:

- `main`: Releases listos para producción con tags
- `develop`: Branch de integración para features
- `feat/*`: Desarrollo de features individuales

**Actual**: Preparando `feat/podcast-detail` para vistas individuales de podcasts.

---

**Versión**: 1.1.0 (Context + Routing)
**Última Actualización**: Septiembre 2025
**Estado**: Listo para implementación de detalle de podcast
npm test

# Build

npm run build

```

## 🔗 Enlaces Útiles

- [Documentación de Vite](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Testing Library](https://testing-library.com/)
- [iTunes API](https://affiliate.itunes.apple.com/resources/documentation/itunes-store-web-service-search-api/)

---

```
