import { defineConfig } from 'vitepress';

// https://vitepress.dev/reference/site-config
export default defineConfig({
  lang: 'en-US',
  title: 'NativeScript Canvas',
  description: 'Canvas APIs, WebGL/WebGPU examples, and NativeScript rendering guides for @nativescript/canvas.',
  
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
    ['meta', { property: 'og:site_name', content: 'NativeScript Canvas' }],
    ['meta', { property: 'og:title', content: 'NativeScript Canvas' }],
    ['meta', { property: 'og:description', content: 'Canvas APIs, WebGL/WebGPU examples, and NativeScript rendering guides for @nativescript/canvas.' }],
    ['meta', { property: 'og:url', content: 'https://canvas.nativescript.org' }],
    ['meta', { property: 'og:image', content: 'https://canvas.nativescript.org/og/canvas-social.png' }],
    ['meta', { property: 'og:image:secure_url', content: 'https://canvas.nativescript.org/og/canvas-social.png' }],
    ['meta', { property: 'og:image:width', content: '1200' }],
    ['meta', { property: 'og:image:height', content: '630' }],
    ['meta', { property: 'og:image:alt', content: 'NativeScript Canvas - Native Canvas. Real pixels.' }],
    ['meta', { name: 'twitter:card', content: 'summary_large_image' }],
    ['meta', { name: 'twitter:title', content: 'NativeScript Canvas' }],
    ['meta', { name: 'twitter:description', content: 'Canvas APIs, WebGL/WebGPU examples, and NativeScript rendering guides for @nativescript/canvas.' }],
    ['meta', { name: 'twitter:image', content: 'https://canvas.nativescript.org/og/canvas-social.png' }],
    ['meta', { name: 'twitter:image:alt', content: 'NativeScript Canvas - Native Canvas. Real pixels.' }],
    ['link', { rel: 'canonical', href: 'https://canvas.nativescript.org' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.googleapis.com' }],
    ['link', { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' }],
    ['link', { href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap', rel: 'stylesheet' }],
  ],

  themeConfig: {
    siteTitle: false,
    
    nav: [
        { text: 'Home', link: '/' },
      { text: 'Playground', link: '/canvas-playground/' },
      { text: 'Canvas', link: '/canvas/' },
      { text: 'SVG', link: '/canvas-svg/' },
      { text: 'Audio Context', link: '/audio-context/' },
        { text: 'Packages', link: '/plugins/' },
      { text: 'GitHub', link: 'https://github.com/NativeScript/canvas' },
    ],

    sidebar: {
      '/plugins/': [
        {
          text: 'Packages',
          items: [
            { text: 'Overview', link: '/plugins/' },
            { text: '@nativescript/canvas', link: '/canvas/' },
            { text: '@nativescript/canvas-svg', link: '/canvas-svg/' },
            { text: '@nativescript/audio-context', link: '/audio-context/' },
            { text: '@nativescript/canvas-polyfill', link: '/plugins/canvas-polyfill' },
            { text: '@nativescript/canvas-media', link: '/plugins/canvas-media' },
            { text: 'Framework Adapters', link: '/plugins/adapters' },
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
            { text: 'Upgrading to 3.0', link: '/canvas/upgrading' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Web API Samples', link: '/canvas/guides/web-api-samples' },
            { text: 'Canvas 2D Recipes', link: '/canvas/guides/canvas-2d-recipes' },
            { text: 'WebGL Recipes', link: '/canvas/guides/webgl-recipes' },
            { text: 'WebGPU Recipes', link: '/canvas/guides/webgpu-recipes' },
            { text: 'Images and ImageBitmap', link: '/canvas/guides/images-and-bitmaps' },
            { text: 'Fonts', link: '/canvas/guides/fonts' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'Rendering Contexts', link: '/canvas/rendering-contexts' },
            { text: 'Events and Input', link: '/canvas/events' },
            { text: 'Performance', link: '/canvas/performance' },
            { text: 'API Overview', link: '/canvas/api' },
            { text: 'Ecosystem Packages', link: '/canvas/ecosystem' },
          ],
        },
      ],
      '/canvas-svg/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/canvas-svg/' },
          ],
        },
        {
          text: 'Guides',
          items: [
            { text: 'Properties and Events', link: '/canvas-svg/guides/properties-and-events' },
            { text: 'Building SVG with the DOM', link: '/canvas-svg/guides/dom' },
            { text: 'Animation', link: '/canvas-svg/guides/animation' },
            { text: 'Drawing SVG into a Canvas', link: '/canvas-svg/guides/canvas-integration' },
            { text: 'Rendering and Performance', link: '/canvas-svg/guides/performance' },
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
