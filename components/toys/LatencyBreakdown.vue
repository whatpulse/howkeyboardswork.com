<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'

const resetTrigger = inject<import('vue').Ref<number>>('resetTrigger')

// Adjustable parameters
const debounceTime = ref(10)
const pollingRate = ref(125)
const frameRate = ref(60)

// Fixed latency values (ms)
const SWITCH_TRAVEL = 1.5
const MATRIX_SCAN = 0.5
const REPORT_GEN = 0.05
const USB_TRANSMISSION = 0.3
const USB_DRIVER = 0.75
const INPUT_SUBSYSTEM = 0.75
const EVENT_DISPATCH = 0.75
const APP_PROCESSING = 2

// Computed latencies
const pollWait = computed(() => {
  // Average wait = half the polling interval
  return (1000 / pollingRate.value) / 2
})

const frameWait = computed(() => {
  // Average wait = half the frame interval
  return (1000 / frameRate.value) / 2
})

// Latency segments
interface Segment {
  label: string
  value: number
  color: string
  category: string
}

const segments = computed<Segment[]>(() => [
  { label: 'Switch travel', value: SWITCH_TRAVEL, color: '#ef4444', category: 'Keyboard' },
  { label: 'Debounce', value: debounceTime.value, color: '#f97316', category: 'Keyboard' },
  { label: 'Matrix scan', value: MATRIX_SCAN, color: '#f59e0b', category: 'Keyboard' },
  { label: 'Report gen', value: REPORT_GEN, color: '#eab308', category: 'Keyboard' },
  { label: 'USB poll wait', value: pollWait.value, color: '#22c55e', category: 'USB' },
  { label: 'USB transmit', value: USB_TRANSMISSION, color: '#10b981', category: 'USB' },
  { label: 'USB driver', value: USB_DRIVER, color: '#06b6d4', category: 'OS' },
  { label: 'Input subsystem', value: INPUT_SUBSYSTEM, color: '#0ea5e9', category: 'OS' },
  { label: 'Event dispatch', value: EVENT_DISPATCH, color: '#3b82f6', category: 'OS' },
  { label: 'App processing', value: APP_PROCESSING, color: '#8b5cf6', category: 'App' },
  { label: 'Frame wait', value: frameWait.value, color: '#a855f7', category: 'App' },
])

const totalLatency = computed(() => {
  return segments.value.reduce((sum, s) => sum + s.value, 0)
})

// Category totals
const categoryTotals = computed(() => {
  const totals: Record<string, number> = {}
  for (const s of segments.value) {
    totals[s.category] = (totals[s.category] || 0) + s.value
  }
  return totals
})

const categories = [
  { name: 'Keyboard', color: '#f97316' },
  { name: 'USB', color: '#22c55e' },
  { name: 'OS', color: '#3b82f6' },
  { name: 'App', color: '#8b5cf6' },
]

// Presets
function applyPreset(preset: 'gaming' | 'office') {
  if (preset === 'gaming') {
    debounceTime.value = 5
    pollingRate.value = 1000
    frameRate.value = 240
  } else {
    debounceTime.value = 15
    pollingRate.value = 125
    frameRate.value = 60
  }
}

// Bar width calculation (proportional)
const BAR_WIDTH = 500

function segmentWidth(value: number): number {
  return (value / totalLatency.value) * BAR_WIDTH
}

// Category label x positions for SVG
const categoryLabelPositions = computed(() => {
  const positions: Record<string, number> = {}
  for (const cat of categories) {
    const catSegments = segments.value.filter(s => s.category === cat.name)
    if (catSegments.length === 0) continue
    const firstIdx = segments.value.indexOf(catSegments[0])
    const startX = segments.value.slice(0, firstIdx).reduce((sum, s) => sum + segmentWidth(s.value), 0)
    const width = catSegments.reduce((sum, s) => sum + segmentWidth(s.value), 0)
    positions[cat.name] = startX + width / 2
  }
  return positions
})

function reset() {
  debounceTime.value = 10
  pollingRate.value = 125
  frameRate.value = 60
}

if (resetTrigger) {
  watch(resetTrigger, reset)
}

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4">
    <!-- Presets -->
    <div class="flex items-center gap-2">
      <span class="text-xs text-gray-500">Presets:</span>
      <button
        @click="applyPreset('gaming')"
        class="px-2.5 py-1 rounded text-xs font-medium bg-green-50 text-green-700 border border-green-200 hover:bg-green-100 transition-colors"
      >
        Gaming
      </button>
      <button
        @click="applyPreset('office')"
        class="px-2.5 py-1 rounded text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 transition-colors"
      >
        Office
      </button>
    </div>

    <!-- Sliders -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <label class="block">
        <span class="text-xs text-gray-500">Debounce time</span>
        <div class="flex items-center gap-2 mt-1">
          <input
            type="range"
            v-model.number="debounceTime"
            min="1"
            max="20"
            step="1"
            class="flex-1 accent-orange-500"
          />
          <span class="font-mono text-sm text-orange-600 font-medium w-12 text-right">{{ debounceTime }}ms</span>
        </div>
      </label>

      <label class="block">
        <span class="text-xs text-gray-500">USB polling rate</span>
        <div class="flex items-center gap-2 mt-1">
          <select
            v-model.number="pollingRate"
            class="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
          >
            <option :value="125">125 Hz</option>
            <option :value="500">500 Hz</option>
            <option :value="1000">1000 Hz</option>
          </select>
          <span class="font-mono text-sm text-green-600 font-medium w-12 text-right">{{ (1000 / pollingRate).toFixed(1) }}ms</span>
        </div>
      </label>

      <label class="block">
        <span class="text-xs text-gray-500">Display refresh rate</span>
        <div class="flex items-center gap-2 mt-1">
          <select
            v-model.number="frameRate"
            class="flex-1 text-sm border border-gray-200 rounded px-2 py-1"
          >
            <option :value="60">60 Hz</option>
            <option :value="144">144 Hz</option>
            <option :value="240">240 Hz</option>
          </select>
          <span class="font-mono text-sm text-purple-600 font-medium w-12 text-right">{{ (1000 / frameRate / 2).toFixed(1) }}ms</span>
        </div>
      </label>
    </div>

    <!-- Stacked bar -->
    <div class="overflow-x-auto">
      <svg :viewBox="`0 0 ${BAR_WIDTH + 20} 60`" class="w-full max-w-[520px]" preserveAspectRatio="xMidYMid meet">
        <g transform="translate(10, 10)">
          <g v-for="(seg, i) in segments" :key="i">
            <rect
              :x="segments.slice(0, i).reduce((sum, s) => sum + segmentWidth(s.value), 0)"
              y="0"
              :width="Math.max(segmentWidth(seg.value), 0.5)"
              height="30"
              :fill="seg.color"
              rx="1"
            >
              <title>{{ seg.label }}: {{ seg.value.toFixed(1) }}ms</title>
            </rect>
          </g>
          <!-- Category labels below bar -->
          <g v-for="cat in categories" :key="cat.name">
            <text
              :x="categoryLabelPositions[cat.name] || 0"
              y="48"
              text-anchor="middle"
              class="text-[9px] font-medium"
              :fill="cat.color"
            >
              {{ cat.name }}
            </text>
          </g>
        </g>
      </svg>
    </div>

    <!-- Category breakdown -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
      <div
        v-for="cat in categories"
        :key="cat.name"
        class="rounded-lg border p-2 text-center"
        :style="{ borderColor: cat.color + '40' }"
      >
        <div class="text-[10px] text-gray-500 uppercase tracking-wide">{{ cat.name }}</div>
        <div class="font-mono text-lg font-bold" :style="{ color: cat.color }">
          {{ (categoryTotals[cat.name] || 0).toFixed(1) }}
        </div>
        <div class="text-[10px] text-gray-400">ms</div>
      </div>
    </div>

    <!-- Total -->
    <div class="flex items-center justify-between p-3 rounded-lg" :class="totalLatency < 15 ? 'bg-green-50 border border-green-200' : totalLatency < 30 ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'">
      <div>
        <span class="text-sm font-medium" :class="totalLatency < 15 ? 'text-green-800' : totalLatency < 30 ? 'text-amber-800' : 'text-red-800'">
          Total end-to-end latency
        </span>
        <span class="text-xs text-gray-500 ml-2">(average case)</span>
      </div>
      <div class="font-mono text-2xl font-bold" :class="totalLatency < 15 ? 'text-green-700' : totalLatency < 30 ? 'text-amber-700' : 'text-red-700'">
        {{ totalLatency.toFixed(1) }}ms
      </div>
    </div>

    <!-- Segment details (hover/detail list) -->
    <details class="text-sm">
      <summary class="text-gray-500 cursor-pointer hover:text-gray-700">Show detailed breakdown</summary>
      <div class="mt-2 space-y-1">
        <div
          v-for="seg in segments"
          :key="seg.label"
          class="flex items-center justify-between py-0.5"
        >
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-sm" :style="{ backgroundColor: seg.color }"></div>
            <span class="text-gray-600">{{ seg.label }}</span>
          </div>
          <span class="font-mono text-gray-800">{{ seg.value.toFixed(2) }}ms</span>
        </div>
      </div>
    </details>
  </div>
</template>
