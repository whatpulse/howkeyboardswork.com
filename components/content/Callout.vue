<script setup lang="ts">
defineProps<{
  title?: string
  type?: 'info' | 'tip' | 'warning'
}>()
</script>

<template>
  <BaseCallout :title="title" :type="type">
    <slot />
  </BaseCallout>
</template>
