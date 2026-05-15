<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useData } from 'vitepress';
import { createHighlighter, type Highlighter } from 'shiki';

const props = defineProps<{
  code: string;
  language?: string;
  filename?: string;
}>();

const highlightedCode = ref('');
let highlighter: Highlighter | null = null;
const { isDark } = useData();
const currentTheme = computed(() => (isDark.value ? 'github-dark' : 'github-light'));

async function highlight() {
  if (!highlighter) {
    highlighter = await createHighlighter({
      themes: ['github-dark', 'github-light'],
      langs: ['typescript', 'javascript', 'html', 'bash', 'json'],
    });
  }
  
  highlightedCode.value = highlighter.codeToHtml(props.code, {
    lang: props.language || 'typescript',
    theme: currentTheme.value,
  });
}

onMounted(highlight);
watch([() => props.code, currentTheme], highlight);
</script>

<template>
  <div class="code-block">
    <div v-if="filename" class="code-block__header">
      <span class="code-block__filename">{{ filename }}</span>
      <button 
        @click="navigator.clipboard.writeText(code)"
        class="code-block__copy"
      >
        Copy
      </button>
    </div>
    <div class="code-block__body">
      <div v-if="highlightedCode" v-html="highlightedCode" class="shiki-wrapper"></div>
      <pre v-else class="code-block__fallback"><code>{{ code }}</code></pre>
    </div>
  </div>
</template>

<style scoped>
.code-block {
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 1rem;
  overflow: hidden;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.94));
  box-shadow: 0 22px 56px -42px rgba(15, 23, 42, 0.22);
}

.code-block__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  border-bottom: 1px solid rgba(148, 163, 184, 0.18);
  background: rgba(248, 250, 252, 0.72);
  padding: 0.5rem 1rem;
}

.code-block__filename {
  font-size: 0.75rem;
  font-weight: 500;
  color: rgb(100, 116, 139);
}

.code-block__copy {
  border: 0;
  border-radius: 0.5rem;
  background: rgba(226, 232, 240, 0.9);
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  color: rgb(71, 85, 105);
  transition: background-color 120ms ease, color 120ms ease;
  cursor: pointer;
}

.code-block__copy:hover {
  background: rgba(203, 213, 225, 0.95);
  color: rgb(30, 41, 59);
}

.code-block__body {
  overflow-x: auto;
  padding: 1rem;
}

.shiki-wrapper,
.code-block__fallback {
  font-size: 0.875rem;
  line-height: 1.625;
}

.code-block__fallback {
  margin: 0;
  color: rgb(51, 65, 85);
}

.shiki-wrapper :deep(pre) {
  background: transparent !important;
  margin: 0;
  padding: 0;
}

.shiki-wrapper :deep(code) {
  font-family: 'Fira Code', 'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

:global(html.dark) .code-block {
  border-color: rgba(148, 163, 184, 0.22);
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.98), rgba(15, 23, 42, 0.94));
  box-shadow: 0 22px 56px -42px rgba(15, 23, 42, 0.75);
}

:global(html.dark) .code-block__header {
  border-bottom-color: rgba(148, 163, 184, 0.12);
  background: rgba(30, 41, 59, 0.55);
}

:global(html.dark) .code-block__filename {
  color: rgb(148, 163, 184);
}

:global(html.dark) .code-block__copy {
  background: rgba(51, 65, 85, 0.72);
  color: rgb(148, 163, 184);
}

:global(html.dark) .code-block__copy:hover {
  background: rgba(71, 85, 105, 0.82);
  color: rgb(226, 232, 240);
}

:global(html.dark) .code-block__fallback {
  color: rgb(226, 232, 240);
}
</style>
