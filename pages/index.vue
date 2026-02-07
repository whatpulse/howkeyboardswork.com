<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

interface GuideDoc {
  title: string
  description: string
  order: number
  slug: string
  _path: string
  body: any
}

const { data: docs } = await useAsyncData('guide', () =>
  queryContent<GuideDoc>('/guide')
    .sort({ order: 1 })
    .find()
)

const sortedDocs = computed(() => docs.value || [])

const tocItems = computed(() =>
  sortedDocs.value.map((doc) => ({
    title: doc.title,
    slug: doc.slug
  }))
)

const activeSlug = ref<string | null>(null)
const isMobileMenuOpen = ref(false)

function scrollToSlug(slug: string) {
  const element = document.getElementById(`section-${slug}`)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
    isMobileMenuOpen.value = false
  }
}

// Scroll-based active section tracking
let ticking = false

function updateActiveSection() {
  const threshold = window.innerHeight * 0.3
  let current: string | null = null

  for (const doc of sortedDocs.value) {
    const el = document.getElementById(`section-${doc.slug}`)
    if (el) {
      const rect = el.getBoundingClientRect()
      if (rect.top <= threshold) {
        current = doc.slug
      }
    }
  }

  if (current) {
    activeSlug.value = current
  }
}

function onScroll() {
  if (!ticking) {
    ticking = true
    requestAnimationFrame(() => {
      updateActiveSection()
      ticking = false
    })
  }
}

onMounted(() => {
  updateActiveSection()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', onScroll)
})
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 py-8">
    <!-- Hero Section -->
    <header class="text-center mb-16 pt-8">
      <h1 class="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
        How Keyboards Work
      </h1>
      <p class="text-xl text-gray-600 max-w-2xl mx-auto">
        An interactive guide to the journey of a keystroke, from switch to screen.
      </p>
    </header>

    <!-- Mobile TOC Toggle -->
    <div class="lg:hidden mb-6">
      <button @click="isMobileMenuOpen = !isMobileMenuOpen"
        class="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700">
        <span>{{activeSlug ? tocItems.find(t => t.slug === activeSlug)?.title : 'Contents'}}</span>
        <svg class="w-5 h-5 transition-transform" :class="{ 'rotate-180': isMobileMenuOpen }" fill="none"
          stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div v-if="isMobileMenuOpen" class="mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg">
        <BaseToc :items="tocItems" :active-slug="activeSlug" @jump="scrollToSlug" />
      </div>
    </div>

    <!-- Main Content Area -->
    <div class="lg:grid lg:grid-cols-[1fr_220px] lg:gap-12">
      <!-- Guide Sections -->
      <main>
        <!-- Introduction -->
        <p class="text-gray-600 leading-relaxed">
          I'm obsessed with keyboards and the technology we use every day without thinking twice about. We tap keys
          thousands of times a day, yet most of us have no idea what actually happens between a finger pressing plastic
          and a letter showing up on screen. I wanted to figure out how all of that worked — the switches, the scanning,
          the protocols, the whole chain — and decided to document what I learned on this site. It's been a way to
          deepen my own understanding and hopefully make it easier for others to appreciate the quiet engineering behind
          something we all use every day and take for granted. Let's go deep. 🤿
        </p>

        <BaseGuideSection v-for="doc in sortedDocs" :key="doc.slug" :slug="doc.slug" :title="doc.title"
          :description="doc.description">
          <ContentRenderer :value="doc" />
        </BaseGuideSection>

        <!-- Conclusion -->
        <section class="py-12 text-center">
          <h2 class="text-2xl font-bold text-gray-900 mb-4">
            And That's How Keyboards Work!
          </h2>
          <p class="text-gray-600 max-w-3xl mx-auto">
            From the mechanical action of switches through matrices, debouncing, scan codes, USB HID reports, and
            finally to your application — every keystroke is a small engineering marvel.
          </p>
        </section>

        <!-- WhatPulse -->
        <section class="py-10 mb-4">
          <div class="max-w-3xl mx-auto rounded-xl border border-gray-200 bg-gray-50 px-6 py-8 text-center">
            <p class="text-gray-600 leading-relaxed mb-1">
              Now that you know the journey each keystroke takes, you might start wondering — just how many of them do
              you actually make in a day?
            </p>
            <p class="text-gray-600 leading-relaxed mb-5">
              <a href="https://whatpulse.org?ref=howkeyboardswork.com" target="_blank" rel="dofollow"
                class="text-primary-600 font-medium hover:underline">WhatPulse</a>
              tracks your keystrokes, mouse clicks, and bandwidth usage, turning the invisible activity at your keyboard
              into numbers you can actually explore. It's a fun way to stay curious about the tools you use every day.
            </p>
            <a href="https://whatpulse.org?ref=howkeyboardswork.com" target="_blank" rel="dofollow"
              class="inline-block px-5 py-2 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-200 rounded-lg hover:bg-primary-100 transition-colors">
              Start counting your keystrokes
            </a>
          </div>
        </section>
      </main>

      <!-- Sticky TOC (Desktop) -->
      <aside class="hidden lg:block">
        <div class="sticky top-24">
          <BaseToc :items="tocItems" :active-slug="activeSlug" @jump="scrollToSlug" />
        </div>
      </aside>
    </div>
  </div>
</template>
