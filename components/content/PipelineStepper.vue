<script setup lang="ts">
import { ref, watch, inject } from 'vue'

const pipelineRef = ref<{ reset: () => void } | null>(null)

// Watch for reset trigger from parent ToyFrame
const resetTrigger = inject<{ value: number }>('resetTrigger', ref(0))

watch(resetTrigger, () => {
  pipelineRef.value?.reset()
})
</script>

<template>
  <ToysPipelineStepper ref="pipelineRef" />
</template>
