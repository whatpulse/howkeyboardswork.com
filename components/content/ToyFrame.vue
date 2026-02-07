<script setup lang="ts">
import { ref, provide } from 'vue'

const props = defineProps<{
  title: string
  subtitle?: string
  footer?: string
  showReset?: boolean
}>()

// Create a reset trigger that toys can watch
const resetTrigger = ref(0)

function handleReset() {
  resetTrigger.value++
}

// Provide reset trigger to child toys
provide('resetTrigger', resetTrigger)
</script>

<template>
  <BaseToyFrame
    :title="title"
    :subtitle="subtitle"
    :footer="footer"
    :show-reset="showReset"
    @reset="handleReset"
  >
    <ClientOnly>
      <slot />
      <template #fallback>
        <div class="flex items-center justify-center h-32 text-gray-400">
          Loading interactive demo...
        </div>
      </template>
    </ClientOnly>
  </BaseToyFrame>
</template>
