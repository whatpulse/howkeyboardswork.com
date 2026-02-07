<script setup lang="ts">
import { ref, watch, inject } from 'vue'

const matrixRef = ref<{ reset: () => void } | null>(null)

// Watch for reset trigger from parent ToyFrame
const resetTrigger = inject<{ value: number }>('resetTrigger', ref(0))

watch(resetTrigger, () => {
  matrixRef.value?.reset()
})
</script>

<template>
  <ToysMatrixScanner ref="matrixRef" />
</template>
