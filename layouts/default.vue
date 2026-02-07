<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <header class="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-gray-200">
      <div class="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <NuxtLink to="/"
          class="flex items-center gap-2 font-semibold text-lg text-gray-900 hover:text-primary-600 transition-colors">
          <img src="/favicon.svg" alt="" class="w-auto h-8" />
          How Keyboards Work
        </NuxtLink>
        <a href="https://github.com/whatpulse/howkeyboardswork.com" target="_blank" rel="noopener noreferrer"
          class="text-sm text-gray-600 hover:text-gray-900 transition-colors">
          View Source
        </a>
      </div>
    </header>

    <main class="flex-1">
      <slot />
    </main>

    <footer class="border-t border-gray-200 bg-white">
      <div class="max-w-6xl mx-auto px-4 py-6 text-center text-sm text-gray-500">
        <p>
          Built by <a href="https://x.com/smitmartijn" target="_blank" rel="noopener noreferrer"
            class="text-primary-600 hover:underline">Martijn Smit</a>
        </p>
        <p class="mt-2">
          Want to count your keystrokes? Check out
          <a href="https://whatpulse.org?ref=howkeyboardswork.com" target="_blank" rel="dofollow"
            class="text-primary-600 hover:underline">WhatPulse</a>
        </p>
      </div>
    </footer>
  </div>
</template>
