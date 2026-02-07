<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  footer?: string
  showReset?: boolean
}>()

const emit = defineEmits<{
  reset: []
}>()
</script>

<template>
  <div class="my-8 rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
    <div class="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
      <div>
        <h3 class="font-semibold text-gray-900 mt-2">{{ title }}</h3>
        <p v-if="subtitle" class="text-sm text-gray-500 mt-0.5 mb-0">{{ subtitle }}</p>
      </div>
      <button v-if="showReset" @click="emit('reset')"
        class="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors">
        Reset
      </button>
    </div>
    <div class="p-4">
      <slot />
    </div>
    <div v-if="footer" class="px-4 py-2 bg-gray-50 border-t border-gray-100 text-xs text-gray-500">
      {{ footer }}
    </div>
  </div>
</template>
