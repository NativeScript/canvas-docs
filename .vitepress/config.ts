import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'NativeScript Packages',
  description: 'Documentation for NativeScript canvas ecosystem packages, including @nativescript/canvas and @nativescript/audio-context.',
  
  srcDir: './content',
  cleanUrls: true,
  appearance: true,
  
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
    lineNumbers: false,
  },
  
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#F75930' }],
    ['meta', { property: 'og:type', content: 'website' }],
    ['meta', { property: 'og:site_name', content: 'NativeScript Canvas Packages' }],
    ['meta', { property: 'og:title', content: 'NativeScript Canvas Packages' }],
    ['meta', { property: 'og:description', content: 'Documentation for @nativescript/canvas, @nativescript/audio-context, and related NativeScript canvas ecosystem packages.' }],
    ['meta', { property: 'og:image', content: 'https://plugins.nstudio.io/nstudio-plugins-meta.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:url', content: 'https://plugins.nstudio.io' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'NativeScript Canvas Packages' }],
    ['meta', { name: 'twitter:description', content: 'Documentation for @nativescript/canvas, @nativescript/audio-context, and related NativeScript canvas ecosystem packages.' }],
    ['meta', { name: 'twitter:image', content: 'https://plugins.nstudio.io/nstudio-plugins-meta.png' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', rel: 'stylesheet' }],
  ],

  themeConfig: {
    logo: '/logo.svg',
    
    nav: [
        { text: 'Home', link: '/' },
      { text: 'Playground', link: '/canvas-playground/' },
      { text: 'Canvas', link: '/canvas/' },
      { text: 'Audio Context', link: '/audio-context/' },
        { text: 'Packages', link: '/plugins/' },
      { text: 'GitHub', link: 'https://github.com/NativeScript/canvas' },
    ],

    sidebar: {
      '/plugins/': [
        {
            text: 'Canvas Repository Packages',
          items: [
              { text: 'Overview', link: '/plugins/' },
              { text: '@nativescript/canvas', link: '/canvas/' },
              { text: '@nativescript/audio-context', link: '/audio-context/' },
              { text: '@nativescript/canvas-polyfill', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-polyfill/README.md' },
              { text: '@nativescript/canvas-media', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-media/README.md' },
              { text: '@nativescript/canvas-three', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-three/README.md' },
              { text: '@nativescript/canvas-pixi', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-pixi/README.md' },
              { text: '@nativescript/canvas-phaser', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-phaser/README.md' },
              { text: '@nativescript/canvas-phaser-ce', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-phaser-ce/README.md' },
              { text: '@nativescript/canvas-svg', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-svg/README.md' },
              { text: '@nativescript/canvas-chartjs', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-chartjs/README.md' },
              { text: '@nativescript/canvas-babylon', link: 'https://github.com/NativeScript/canvas/tree/master/packages/canvas-babylon/README.md' },
          ],
        },
      ],
      '/canvas/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/canvas/' },
            { text: 'Installation', link: '/canvas/installation' },
            { text: 'Quick Start', link: '/canvas/quick-start' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Web API Samples', link: '/canvas/guides/web-api-samples' },
            { text: 'Canvas 2D Recipes', link: '/canvas/guides/canvas-2d-recipes' },
            { text: 'WebGL Recipes', link: '/canvas/guides/webgl-recipes' },
            { text: 'WebGPU Recipes', link: '/canvas/guides/webgpu-recipes' },
            { text: 'Rendering Contexts', link: '/canvas/rendering-contexts' },
            { text: 'API Overview', link: '/canvas/api' },
            { text: 'Ecosystem Packages', link: '/canvas/ecosystem' },
          ],
        },
      ],
      '/audio-context/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/audio-context/' },
            { text: 'Installation', link: '/audio-context/installation' },
            { text: 'Quick Start', link: '/audio-context/quick-start' },
          ],
        },
        {
          text: 'Guides',
          items: [
              { text: 'Web API Samples', link: '/audio-context/guides/web-api-samples' },
              { text: 'Dynamics Compression', link: '/audio-context/guides/dynamics-compression' },
              { text: 'Routing and Mixing', link: '/audio-context/guides/routing-and-mixing' },
            { text: 'Decode and Play Audio', link: '/audio-context/guides/decode-and-play' },
            { text: 'Media Element Source', link: '/audio-context/guides/media-element-source' },
            { text: 'Offline Rendering', link: '/audio-context/guides/offline-rendering' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Supported API Surface', link: '/audio-context/api-surface' },
          ],
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/NativeScript/canvas' },
    ],

    // footer: {
    // //   message: 'Released under the Apache-2.0 License.',
    //   copyright: `Copyright © ${new Date().getFullYear()} nStudio`,
    // },

    search: {
      provider: 'local',
    },
  },
});
