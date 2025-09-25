# Podcaster App

Una aplicación de podcasts musicales desarrollada con React, TypeScript y Vite. Permite visualizar los 100 podcasts más populares de iTunes con un diseño moderno y responsive.

## 🚀 Demo

La aplicación muestra una vista principal con tarjetas de podcasts que incluyen:

- Imagen circular flotante del podcast
- Título en mayúsculas
- Nombre del autor
- Diseño responsive con grid adaptativo

## 🛠️ Stack Tecnológico

- **Frontend**: React 18.3.1 + TypeScript 5.9.2
- **Build Tool**: Vite 5.4.10
- **Testing**: Vitest 1.0.4 + Testing Library
- **Styling**: CSS Modules + Variables CSS
- **Linting**: ESLint + Prettier
- **Node.js**: 20.x LTS

## 📁 Estructura del Proyecto

```
src/
├── components/           # Componentes reutilizables
│   ├── Layout.tsx       # Layout principal con header
│   ├── Layout.css
│   ├── PodcastCard.tsx  # Tarjeta individual de podcast
│   ├── PodcastCard.css
│   └── __tests__/       # Tests de componentes
├── pages/               # Páginas/Vistas
│   ├── HomePage.tsx     # Vista principal con listado
│   ├── HomePage.css
│   └── __tests__/       # Tests de páginas
├── styles/              # Estilos globales
│   ├── variables.css    # Variables CSS
│   └── base.css         # Reset y estilos base
├── test/                # Utilidades de testing
│   ├── setup.ts
│   └── test-utils.tsx
├── App.tsx              # Componente raíz
└── App.css              # Estilos principales
```

## ⚡ Comandos Disponibles

### Desarrollo

```bash
npm run dev          # Servidor de desarrollo (http://localhost:5173)
npm run build        # Build de producción
npm run preview      # Preview del build
```

### Testing

```bash
npm run test         # Tests en modo watch
npm run test:run     # Tests una sola vez
npm run test:coverage # Tests con coverage
```

### Linting

```bash
npm run lint         # Verificar código
```

## 🎨 Arquitectura CSS

### Sistema de Variables

Colores, tipografía y espaciado centralizados en `src/styles/variables.css`:

```css
:root {
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
}
```

### Grid Responsive

- **Móvil** (≤640px): 2 columnas
- **Tablet** (641-1024px): 3 columnas
- **Desktop** (1025-1399px): 4 columnas
- **Desktop XL** (≥1400px): 5 columnas

### Características de Diseño

- **Imágenes circulares** de 130px que flotan sobre las tarjetas
- **Bordes parciales**: solo derecho, inferior e izquierdo
- **Sombras direccionales**: sin sombra superior
- **Hover effects** suaves con `translateY`

## 🔧 Configuración API

La aplicación utiliza la API de iTunes para obtener podcasts:

- **Endpoint**: `https://itunes.apple.com/us/rss/toppodcasts/limit=100/genre=1310/json`
- **Proxy configurado** en Vite para CORS
- **Cache**: Los datos se almacenan para evitar requests innecesarios

## ✅ Funcionalidades Implementadas

### ✅ Fase 1-3: Base y Componentes

- [x] Scaffolding con Vite + React + TypeScript
- [x] Configuración de ESLint, Prettier, Vitest
- [x] Fetch de datos de la API de iTunes
- [x] Componente PodcastCard con diseño personalizado
- [x] Layout responsive con Grid CSS
- [x] Arquitectura de componentes modular
- [x] Tests unitarios completos

### 🔄 En Desarrollo

- [ ] **Fase 4**: Filtrado y búsqueda en tiempo real
- [ ] **Fase 5**: Vista de detalle de podcast
- [ ] **Fase 6**: Reproductor de episodios
- [ ] **Fase 7**: Context API para estado global
- [ ] **Fase 8**: Sistema de cache optimizado
- [ ] **Fase 9**: Routing con React Router

## 🧪 Testing

### Cobertura de Tests

- **Layout Component**: Estados de loading, renderizado, CSS classes
- **HomePage Component**: API calls, estados de error/éxito, manejo de datos
- **PodcastCard Component**: Props, eventos, renderizado condicional

### Estrategia de Testing

- **Unit Tests**: Componentes individuales
- **Integration Tests**: Interacción entre componentes
- **Mocking**: API calls y dependencias externas
- **Assertions**: Testing Library + Jest DOM matchers

## 📝 Decisiones de Diseño

### Componentes desde Cero

Se desarrollan todos los componentes sin librerías UI para:

- Control total sobre el diseño
- Menor bundle size
- Cumplimiento de requisitos del proyecto
- Demostración de habilidades CSS

### Arquitectura Modular

- **Separación de responsabilidades** clara
- **Reutilización** de componentes
- **Testabilidad** individual
- **Escalabilidad** futura

### CSS Personalizado

- **Variables CSS** para consistency
- **Grid Layout** nativo para responsive
- **Flexbox** para alineación
- **Animations** CSS para UX

## 🔮 Próximas Funcionalidades

1. **Search & Filter**: Input de búsqueda con filtrado en tiempo real
2. **Routing**: Navegación SPA con React Router
3. **Podcast Detail**: Vista individual con listado de episodios
4. **Audio Player**: Reproductor HTML5 integrado
5. **State Management**: Context API para datos globales
6. **Cache Strategy**: LocalStorage con TTL de 24h
7. **Loading States**: Indicadores de carga mejorados
8. **Error Boundaries**: Manejo de errores robusto

## 🚦 Estados de la Aplicación

### Loading

- Indicador en header durante fetch
- Estado de carga en HomePage
- Skeleton loading (futuro)

### Error Handling

- Errores de red
- Errores HTTP (404, 500, etc.)
- Datos malformados
- Timeout de requests

### Success

- Grid de podcasts responsive
- Contador de resultados
- Hover interactions suaves

## 🎯 Criterios de Evaluación Cumplidos

- ✅ **README completo** con arquitectura y decisiones
- ✅ **Código limpio** siguiendo principios SOLID
- ✅ **Sin errores de linter** con configuración estricta
- ✅ **Separación en capas** (components/pages/styles)
- ✅ **Consola limpia** sin warnings
- ✅ **CSS desde cero** sin librerías externas
- ✅ **Commits estándar** con nomenclatura clara
- ✅ **Tests funcionales** con buena cobertura
- ✅ **Arquitectura modular** basada en componentes
- ✅ **TypeScript completo** con tipado estricto

## 🚀 Instalación y Uso

```bash
# Clonar el repositorio
git clone [https://github.com/andradesdiego/podcaster.git]
cd podcaster

# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Testing
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
