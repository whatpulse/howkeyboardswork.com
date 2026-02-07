<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

defineProps<{
  slug: string
  title: string
  description?: string
}>()

const sectionRef = ref<HTMLElement | null>(null)
const isVisible = ref(false)

onMounted(() => {
  if (!sectionRef.value) return

  const visibilityObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isVisible.value) {
          isVisible.value = true
        }
      })
    },
    { threshold: 0.1 }
  )

  visibilityObserver.observe(sectionRef.value)

  onUnmounted(() => {
    visibilityObserver.disconnect()
  })
})
</script>

<template>
  <section
    :id="`section-${slug}`"
    ref="sectionRef"
    class="scroll-mt-24 py-12 border-b border-gray-100 last:border-0"
  >
    <div
      class="section-animate"
      :class="{ visible: isVisible }"
    >
      <header class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900 mb-2">
          {{ title }}
        </h2>
        <p v-if="description" class="text-gray-600">
          {{ description }}
        </p>
      </header>
      <div class="prose prose-gray max-w-none">
        <slot />
      </div>
    </div>
  </section>
</template>
