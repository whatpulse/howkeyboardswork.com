<script setup lang="ts">
import { ref, watch, inject } from 'vue'

const componentRef = ref<{ reset: () => void } | null>(null)

const resetTrigger = inject<{ value: number }>('resetTrigger', ref(0))

watch(resetTrigger, () => {
  componentRef.value?.reset()
})
</script>

<template>
  <ToysDebounceVisualizer ref="componentRef" />
</template>
