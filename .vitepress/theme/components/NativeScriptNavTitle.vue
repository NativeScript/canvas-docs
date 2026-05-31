<template>
  <span class="native-script-nav-title">
    <svg
      class="native-script-nav-title__mark"
      viewBox="0 0 1024 1024"
      xmlns="http://www.w3.org/2000/svg"
      fill-rule="evenodd"
      clip-rule="evenodd"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ns-nav-logo-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fbbf24" />
          <stop offset="50%" stop-color="#f59e0b" />
          <stop offset="100%" stop-color="#fb923c" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ns-nav-logo-gradient)"
        d="M1024 256C1024 114.71 909.29 0 768 0H256C114.71 0 0 114.71 0 256v512c0 141.29 114.71 256 256 256h512c141.29 0 256-114.71 256-256V256zM843 511.86v1.1c0 .26-.19.47-.45.49-33.36 3.13-59.48 30.24-59.48 64.41v136.95c0 9.56-2.01 18.8-5.64 27.23-10.35 24.07-33.84 41.57-61.16 41.57h-69.2l-.48-.6-269.18-337.33v337.93h-69.68c-36.89 0-66.8-29.91-66.8-66.8V577.86c0-34.17-26.11-61.28-59.48-64.41-.25-.02-.45-.23-.45-.49v-1.1c0-.25.19-.46.45-.49 33.24-3.24 59.22-31.02 59.22-65.11V307.19c0-9.29 1.9-18.14 5.33-26.18 10.18-23.88 33.87-40.62 61.47-40.62h69.66l.28.35 269.18 337.34V240.39h69.94c36.89 0 66.8 29.91 66.8 66.8v139.07c0 34.09 25.98 61.87 59.22 65.11.26.03.45.24.45.49z"
      />
    </svg>
    <span class="native-script-nav-title__text">Canvas</span>
  </span>
</template>

<style scoped>
.native-script-nav-title {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  gap: 0.58rem;
  color: var(--vp-c-text-1);
}

.native-script-nav-title__mark {
  width: 1.65rem;
  height: 1.65rem;
  flex: 0 0 auto;
  overflow: visible;
}

.native-script-nav-title__text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.98rem;
  font-weight: 750;
  letter-spacing: 0;
}

@media (max-width: 420px) {
  .native-script-nav-title__text {
    max-width: 12.4rem;
    font-size: 0.9rem;
  }
}
</style>
