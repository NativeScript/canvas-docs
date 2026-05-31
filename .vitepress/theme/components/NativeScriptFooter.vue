<script setup lang="ts">
import { computed } from 'vue';
import { useData } from 'vitepress';
import OpenJSLogo from './OpenJSLogo.vue';

const { isDark } = useData();
const year = new Date().getFullYear();

const socialLinkClasses = computed(() =>
  isDark.value ? 'text-slate-400 hover:text-white transition' : 'text-gray-400 hover:text-gray-600 transition'
);

const secondaryLinkClasses = computed(() => [
  'px-3 transition',
  isDark.value ? 'text-slate-400 hover:text-white' : 'text-gray-500 hover:text-gray-800',
]);

const legalLinkClasses = computed(() =>
  isDark.value ? 'font-medium text-slate-200 transition hover:text-white' : 'font-medium text-gray-600 transition hover:text-gray-900'
);
</script>

<template>
  <footer
    id="site-footer"
    class="native-script-footer border-t transition-colors duration-300"
    :class="isDark ? 'border-slate-800 bg-slate-950 text-slate-200' : 'border-slate-200 bg-white text-slate-600'"
  >
    <div class="mx-auto max-w-7xl px-4 pb-4 pt-10 sm:px-6 md:flex md:items-center md:justify-between lg:px-6">
      <div class="flex justify-center space-x-6 md:order-3">
        <a href="https://twitter.com/NativeScript" target="_blank" rel="noopener noreferrer" :class="socialLinkClasses">
          <span class="sr-only">Twitter</span>
          <svg class="h-6 w-6 p-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"
            />
          </svg>
        </a>
        <a href="https://nativescript.org/discord" target="_blank" rel="noopener noreferrer" :class="socialLinkClasses">
          <span class="sr-only">Discord</span>
          <svg class="h-6 w-6 p-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M20.222 0c1.406 0 2.54 1.137 2.607 2.475V24l-2.677-2.273-1.47-1.338-1.604-1.398.67 2.205H3.71c-1.402 0-2.54-1.065-2.54-2.476V2.48C1.17 1.142 2.31.003 3.715.003h16.5L20.222 0zm-6.118 5.683h-.03l-.202.2c2.073.6 3.076 1.537 3.076 1.537-1.336-.668-2.54-1.002-3.744-1.137-.87-.135-1.74-.064-2.475 0h-.2c-.47 0-1.47.2-2.81.735-.467.203-.735.336-.735.336s1.002-1.002 3.21-1.537l-.135-.135s-1.672-.064-3.477 1.27c0 0-1.805 3.144-1.805 7.02 0 0 1 1.74 3.743 1.806 0 0 .4-.533.805-1.002-1.54-.468-2.14-1.404-2.14-1.404s.134.066.335.2h.06c.03 0 .044.015.06.03v.006c.016.016.03.03.06.03.33.136.66.27.93.4.466.202 1.065.403 1.8.536.93.135 1.996.2 3.21 0 .6-.135 1.2-.267 1.8-.535.39-.2.87-.4 1.397-.737 0 0-.6.936-2.205 1.404.33.466.795 1 .795 1 2.744-.06 3.81-1.8 3.87-1.726 0-3.87-1.815-7.02-1.815-7.02-1.635-1.214-3.165-1.26-3.435-1.26l.056-.02zm.168 4.413c.703 0 1.27.6 1.27 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.334.002-.74.573-1.338 1.27-1.338zm-4.543 0c.7 0 1.266.6 1.266 1.335 0 .74-.57 1.34-1.27 1.34-.7 0-1.27-.6-1.27-1.334 0-.74.57-1.338 1.27-1.338z"
            />
          </svg>
        </a>
        <a href="https://stackoverflow.com/questions/tagged/nativescript" target="_blank" rel="noopener noreferrer" :class="socialLinkClasses">
          <span class="sr-only">Stack Overflow</span>
          <svg class="h-6 w-6 p-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15.725 0l-1.72 1.277 6.39 8.588 1.716-1.277L15.725 0zm-3.94 3.418l-1.369 1.644 8.225 6.85 1.369-1.644-8.225-6.85zm-3.15 4.465l-.905 1.94 9.702 4.517.904-1.94-9.701-4.517zm-1.85 4.86l-.44 2.093 10.473 2.201.44-2.092-10.473-2.203zM1.89 15.47V24h19.19v-8.53h-2.133v6.397H4.021v-6.396H1.89zm4.265 2.133v2.13h10.66v-2.13H6.154Z"
            />
          </svg>
        </a>
        <a href="https://github.com/NativeScript/NativeScript" target="_blank" rel="noopener noreferrer" :class="socialLinkClasses">
          <span class="sr-only">GitHub</span>
          <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill-rule="evenodd"
              d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              clip-rule="evenodd"
            />
          </svg>
        </a>
      </div>

      <div class="order-1 mt-8 md:mt-0">
        <a
          href="https://openjsf.org/"
          target="_blank"
          rel="noopener noreferrer"
          :class="['flex justify-center transition', isDark ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-500']"
        >
          <span class="sr-only">OpenJS Foundation</span>
          <OpenJSLogo aria-hidden="true" class="h-12 w-auto" />
        </a>
      </div>

      <div class="mt-8 md:order-2 md:mt-0">
        <p :class="['text-center text-base', isDark ? 'text-slate-400' : 'text-gray-500']">&copy; {{ year }}</p>
      </div>
    </div>

    <div class="mt-10 text-sm">
      <div class="mx-auto max-w-7xl px-4 sm:px-6">
        <p :class="isDark ? 'text-slate-400' : 'text-gray-500'">
          Copyright
          <a :class="legalLinkClasses" target="_blank" rel="noopener noreferrer" href="https://openjsf.org">OpenJS Foundation</a>
          and NativeScript contributors. All rights reserved. The
          <a :class="legalLinkClasses" target="_blank" rel="noopener noreferrer" href="https://openjsf.org">OpenJS Foundation</a>
          has registered trademarks and uses trademarks. For a list of trademarks of the
          <a :class="legalLinkClasses" target="_blank" rel="noopener noreferrer" href="https://openjsf.org">OpenJS Foundation</a>,
          please see our
          <a :class="legalLinkClasses" target="_blank" rel="noopener noreferrer" href="https://trademark-policy.openjsf.org">Trademark Policy</a>
          and
          <a :class="legalLinkClasses" target="_blank" rel="noopener noreferrer" href="https://trademark-list.openjsf.org">Trademark List</a>.
          Trademarks and logos not indicated on the
          <a :class="legalLinkClasses" target="_blank" rel="noopener noreferrer" href="https://trademark-list.openjsf.org">
            list of OpenJS Foundation trademarks
          </a>
          are trademarks&trade; or registered&reg; trademarks of their respective holders. Use of them does not imply any affiliation with or endorsement by
          them.
        </p>
      </div>

      <div
        class="mt-6 flex flex-col justify-center space-y-4 divide-y pb-10 sm:px-3 lg:flex-row lg:space-y-0 lg:divide-x lg:divide-y-0 lg:px-0"
        :class="isDark ? 'divide-slate-800' : 'divide-gray-300'"
      >
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://openjsf.org">The OpenJS Foundation</a>
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://terms-of-use.openjsf.org">Terms of Use</a>
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://privacy-policy.openjsf.org">Privacy Policy</a>
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://bylaws.openjsf.org">OpenJS Foundation Bylaws</a>
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://trademark-policy.openjsf.org">Trademark Policy</a>
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://trademark-list.openjsf.org">Trademark List</a>
        <a :class="secondaryLinkClasses" target="_blank" rel="noopener noreferrer" href="https://www.linuxfoundation.org/cookies">Cookie Policy</a>
      </div>
    </div>
  </footer>
</template>
