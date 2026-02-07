<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue'

interface TocItem {
  title: string
  slug: string
}

const props = defineProps<{
  items: TocItem[]
  activeSlug?: string | null
}>()

const emit = defineEmits<{
  jump: [slug: string]
}>()

const listRef = ref<HTMLElement | null>(null)
const indicatorTop = ref(0)
const indicatorHeight = ref(0)
const hasActive = ref(false)

function updateIndicator() {
  if (!listRef.value || !props.activeSlug) {
    hasActive.value = false
    return
  }

  const activeEl = listRef.value.querySelector(`[data-slug="${props.activeSlug}"]`) as HTMLElement
  if (!activeEl) {
    hasActive.value = false
    return
  }

  const listRect = listRef.value.getBoundingClientRect()
  const activeRect = activeEl.getBoundingClientRect()

  indicatorTop.value = activeRect.top - listRect.top
  indicatorHeight.value = activeRect.height
  hasActive.value = true
}

watch(() => props.activeSlug, () => {
  nextTick(updateIndicator)
})

onMounted(() => {
  nextTick(updateIndicator)
})
</script>

<template>
  <nav aria-label="Table of contents">
    <h2 class="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
      Contents
    </h2>
    <div class="relative">
      <!-- Track line (subtle background line) -->
      <div
        ref="listRef"
        class="relative"
      >
        <!-- Static track line (behind) -->
        <div class="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200 rounded-full" />

        <!-- Animated indicator (on top) -->
        <div
          class="absolute left-0 w-0.5 bg-primary-500 rounded-full z-10 transition-all duration-300 ease-in-out"
          :style="{
            top: indicatorTop + 'px',
            height: indicatorHeight + 'px',
            opacity: hasActive ? 1 : 0
          }"
        />

        <ul class="space-y-0.5 relative">
          <li v-for="item in items" :key="item.slug" :data-slug="item.slug">
            <button
              @click="emit('jump', item.slug)"
              class="w-full text-left pl-4 pr-3 py-1.5 rounded-r-md text-sm transition-colors duration-200"
              :class="[
                activeSlug === item.slug
                  ? 'text-primary-700 font-medium bg-primary-50/60'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
              ]"
            >
              {{ item.title }}
            </button>
          </li>
        </ul>
      </div>
    </div>
  </nav>
</template>
