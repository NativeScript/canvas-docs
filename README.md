# NativeScript Canvas Ecosystem Documentation

Documentation website for NativeScript canvas ecosystem packages, including `@nativescript/canvas` and `@nativescript/audio-context`.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
plugins.nstudio.io/
├── .vitepress/
│   ├── config.ts          # VitePress configuration
│   └── theme/
│       ├── index.ts        # Theme registration
│       ├── style.css       # Custom styles (Tailwind)
│       ├── PluginsHome.vue # Main landing page
│       └── components/     # Vue components
├── content/
│   ├── index.md            # Plugins home
│   ├── canvas/
│       ├── index.md        # @nativescript/canvas intro
│       ├── installation.md
│       ├── quick-start.md
│       ├── rendering-contexts.md
│       ├── api.md
│       ├── ecosystem.md
│       └── guides/
│           ├── web-api-samples.md
│           ├── canvas-2d-recipes.md
│           ├── webgl-recipes.md
│           └── webgpu-recipes.md
│   └── audio-context/
│       ├── index.md        # @nativescript/audio-context intro
│       ├── installation.md
│       ├── quick-start.md
│       ├── api-surface.md
│       └── guides/
└── package.json
```

## Adding Documentation

1. Create a new `.md` file in the appropriate `content/` subdirectory
2. Add frontmatter for title and description
3. Update `.vitepress/config.ts` sidebar if needed

---

Built with ❤️ for the NativeScript ecosystem
