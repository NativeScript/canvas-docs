import DefaultTheme from 'vitepress/theme';
import './style.css';
import PluginsHome from './PluginsHome.vue';
import FeatureCard from './components/FeatureCard.vue';
import CodePreview from './components/CodePreview.vue';
import CodeBlock from './components/CodeBlock.vue';
import FrameworkTabs from './components/FrameworkTabs.vue';
import Canvas2DRecipeDemo from './components/Canvas2DRecipeDemo.vue';
import CanvasWebGLRecipeDemo from './components/CanvasWebGLRecipeDemo.vue';
import CanvasWebGPURecipeDemo from './components/CanvasWebGPURecipeDemo.vue';
import AudioWebApiLiveDemo from './components/AudioWebApiLiveDemo.vue';
import CanvasDocsHome from './components/CanvasDocsHome.vue';
import CanvasHeroMiniDemo from './components/CanvasHeroMiniDemo.vue';
import AudioDocsHome from './components/AudioDocsHome.vue';
import CanvasPlayground from './components/CanvasPlayground.vue';

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('PluginsHome', PluginsHome);
    app.component('FeatureCard', FeatureCard);
    app.component('CodePreview', CodePreview);
    app.component('CodeBlock', CodeBlock);
    app.component('FrameworkTabs', FrameworkTabs);
    app.component('Canvas2DRecipeDemo', Canvas2DRecipeDemo);
    app.component('CanvasWebGLRecipeDemo', CanvasWebGLRecipeDemo);
    app.component('CanvasWebGPURecipeDemo', CanvasWebGPURecipeDemo);
    app.component('AudioWebApiLiveDemo', AudioWebApiLiveDemo);
    app.component('CanvasDocsHome', CanvasDocsHome);
    app.component('CanvasHeroMiniDemo', CanvasHeroMiniDemo);
    app.component('AudioDocsHome', AudioDocsHome);
    app.component('CanvasPlayground', CanvasPlayground);
  },
};
