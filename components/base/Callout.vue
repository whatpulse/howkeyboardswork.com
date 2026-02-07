<script setup lang="ts">
defineProps<{
  title?: string
  type?: 'info' | 'tip' | 'warning'
}>()
</script>

<template>
  <aside class="my-6 rounded-lg border p-4" :class="{
    'bg-blue-50 border-blue-200': type === 'info' || !type,
    'bg-green-50 border-green-200': type === 'tip',
    'bg-amber-50 border-amber-200': type === 'warning'
  }" role="note">
    <div v-if="title" class="flex items-center gap-2 mb-1">
      <svg v-if="type === 'tip'" class="w-5 h-5 flex-shrink-0 text-green-600" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
      <svg v-else-if="type === 'warning'" class="w-5 h-5 flex-shrink-0 text-amber-600" fill="none" stroke="currentColor"
        viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
      <svg v-else class="w-5 h-5 flex-shrink-0 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h4 class="font-semibold mt-1" :class="{
        'text-blue-900': type === 'info' || !type,
        'text-green-900': type === 'tip',
        'text-amber-900': type === 'warning'
      }">
        {{ title }}
      </h4>
    </div>
    <div class="text-sm" :class="{
      'text-blue-800': type === 'info' || !type,
      'text-green-800': type === 'tip',
      'text-amber-800': type === 'warning'
    }">
      <slot />
    </div>
  </aside>
</template>
