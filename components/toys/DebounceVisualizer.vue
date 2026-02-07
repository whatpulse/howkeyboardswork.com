<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'

const resetTrigger = inject<import('vue').Ref<number>>('resetTrigger')

// Debounce window in ms
const debounceWindow = ref(10)
const isAnimating = ref(false)
const animationTime = ref(0)
const strategy = ref<'delay' | 'integration'>('delay')

// Total timeline: 25ms
const TIMELINE_MS = 25
const SVG_WIDTH = 600
const SVG_HEIGHT = 200
const WAVEFORM_HEIGHT = 50
const RAW_Y = 40
const DEBOUNCED_Y = 140
const LEFT_MARGIN = 45
const RIGHT_MARGIN = 10
const GRAPH_WIDTH = SVG_WIDTH - LEFT_MARGIN - RIGHT_MARGIN

// Pre-defined bounce pattern (typical mechanical switch)
// Each entry is [startMs, endMs] for when the signal is HIGH
const bouncePattern = [
  [0, 0.8],
  [1.2, 1.6],
  [2.0, 2.3],
  [2.8, 3.0],
  [3.4, 3.5],
  [3.8, 25]  // finally settles HIGH
]

function msToX(ms: number): number {
  return LEFT_MARGIN + (ms / TIMELINE_MS) * GRAPH_WIDTH
}

// Build the raw signal path (bouncy waveform)
const rawSignalPath = computed(() => {
  const high = RAW_Y
  const low = RAW_Y + WAVEFORM_HEIGHT
  let d = `M ${LEFT_MARGIN} ${low}`

  for (const [start, end] of bouncePattern) {
    const x1 = msToX(start)
    const x2 = msToX(end)
    // Rise to HIGH
    d += ` L ${x1} ${low} L ${x1} ${high} L ${x2} ${high} L ${x2} ${low}`
  }

  d += ` L ${msToX(TIMELINE_MS)} ${low}`
  return d
})

// Build the debounced output path
const debouncedSignalPath = computed(() => {
  const high = DEBOUNCED_Y
  const low = DEBOUNCED_Y + WAVEFORM_HEIGHT
  const window = debounceWindow.value

  if (strategy.value === 'delay') {
    // Delay-based: first transition detected, wait debounceWindow ms, then output HIGH
    const firstRise = bouncePattern[0][0]
    const outputTime = firstRise + window

    if (outputTime > TIMELINE_MS) {
      return `M ${LEFT_MARGIN} ${low} L ${msToX(TIMELINE_MS)} ${low}`
    }

    return `M ${LEFT_MARGIN} ${low} L ${msToX(outputTime)} ${low} L ${msToX(outputTime)} ${high} L ${msToX(TIMELINE_MS)} ${high}`
  } else {
    // Integration: need consecutive stable samples across the window
    // Find when signal stays HIGH for debounceWindow ms continuously
    const settleStart = bouncePattern[bouncePattern.length - 1][0]
    const outputTime = settleStart + window

    if (outputTime > TIMELINE_MS) {
      return `M ${LEFT_MARGIN} ${low} L ${msToX(TIMELINE_MS)} ${low}`
    }

    return `M ${LEFT_MARGIN} ${low} L ${msToX(outputTime)} ${low} L ${msToX(outputTime)} ${high} L ${msToX(TIMELINE_MS)} ${high}`
  }
})

// Debounce window visualization rectangle
const debounceWindowRect = computed(() => {
  if (strategy.value === 'delay') {
    const firstRise = bouncePattern[0][0]
    return {
      x: msToX(firstRise),
      width: msToX(firstRise + debounceWindow.value) - msToX(firstRise)
    }
  } else {
    const settleStart = bouncePattern[bouncePattern.length - 1][0]
    return {
      x: msToX(settleStart),
      width: msToX(settleStart + debounceWindow.value) - msToX(settleStart)
    }
  }
})

// Output time for the label
const outputTime = computed(() => {
  if (strategy.value === 'delay') {
    return bouncePattern[0][0] + debounceWindow.value
  } else {
    return bouncePattern[bouncePattern.length - 1][0] + debounceWindow.value
  }
})

// Animation progress line
let animFrame: number | null = null
let animStart: number | null = null

function startAnimation() {
  if (isAnimating.value) return
  isAnimating.value = true
  animationTime.value = 0
  animStart = null

  function tick(timestamp: number) {
    if (!animStart) animStart = timestamp
    const elapsed = timestamp - animStart
    // 25ms of signal time shown over 2500ms of real time (100x slowdown)
    animationTime.value = Math.min((elapsed / 2500) * TIMELINE_MS, TIMELINE_MS)

    if (animationTime.value < TIMELINE_MS) {
      animFrame = requestAnimationFrame(tick)
    } else {
      isAnimating.value = false
    }
  }

  animFrame = requestAnimationFrame(tick)
}

// Clip path based on animation progress
const clipWidth = computed(() => {
  if (!isAnimating.value && animationTime.value === 0) return GRAPH_WIDTH + LEFT_MARGIN + RIGHT_MARGIN
  return msToX(animationTime.value)
})

// Grid lines for timeline
const gridLines = computed(() => {
  const lines = []
  for (let ms = 0; ms <= TIMELINE_MS; ms += 5) {
    lines.push({ x: msToX(ms), label: `${ms}` })
  }
  return lines
})

// Minor grid lines (every 1ms)
const minorGridLines = computed(() => {
  const lines = []
  for (let ms = 0; ms <= TIMELINE_MS; ms += 1) {
    if (ms % 5 !== 0) {
      lines.push(msToX(ms))
    }
  }
  return lines
})

function reset() {
  isAnimating.value = false
  animationTime.value = 0
  if (animFrame) {
    cancelAnimationFrame(animFrame)
    animFrame = null
  }
}

if (resetTrigger) {
  watch(resetTrigger, reset)
}

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4">
    <!-- Controls -->
    <div class="flex flex-wrap items-center gap-4">
      <button
        @click="startAnimation"
        :disabled="isAnimating"
        class="px-4 py-2 text-sm font-medium rounded-lg transition-colors"
        :class="isAnimating
          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
          : 'bg-primary-500 text-white hover:bg-primary-600'"
      >
        {{ isAnimating ? 'Animating...' : 'Simulate Key Press' }}
      </button>

      <button
        v-if="animationTime > 0 && !isAnimating"
        @click="reset"
        class="px-3 py-2 text-sm text-gray-600 hover:text-gray-900"
      >
        Reset
      </button>
    </div>

    <div class="flex flex-wrap items-center gap-6">
      <label class="flex items-center gap-3 text-sm">
        <span class="text-gray-600 whitespace-nowrap">Debounce window:</span>
        <input
          type="range"
          v-model.number="debounceWindow"
          min="2"
          max="20"
          step="1"
          class="w-32 accent-primary-500"
        />
        <span class="font-mono text-primary-600 font-medium w-12">{{ debounceWindow }}ms</span>
      </label>

      <div class="flex items-center gap-2 text-sm">
        <span class="text-gray-600">Strategy:</span>
        <button
          @click="strategy = 'delay'"
          class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
          :class="strategy === 'delay' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Delay-based
        </button>
        <button
          @click="strategy = 'integration'"
          class="px-2.5 py-1 rounded text-xs font-medium transition-colors"
          :class="strategy === 'integration' ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
        >
          Integration
        </button>
      </div>
    </div>

    <!-- SVG Waveform -->
    <div class="overflow-x-auto">
      <svg :viewBox="`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`" class="w-full max-w-[600px]" preserveAspectRatio="xMidYMid meet">
        <defs>
          <clipPath id="anim-clip">
            <rect x="0" y="0" :width="clipWidth" :height="SVG_HEIGHT" />
          </clipPath>
        </defs>

        <!-- Background grid -->
        <line
          v-for="line in gridLines"
          :key="`grid-${line.label}`"
          :x1="line.x" y1="30" :x2="line.x" :y2="SVG_HEIGHT - 5"
          stroke="#e5e7eb" stroke-width="0.5"
        />
        <line
          v-for="(x, i) in minorGridLines"
          :key="`minor-${i}`"
          :x1="x" y1="30" :x2="x" :y2="SVG_HEIGHT - 5"
          stroke="#f3f4f6" stroke-width="0.5"
        />

        <!-- Timeline labels -->
        <text
          v-for="line in gridLines"
          :key="`label-${line.label}`"
          :x="line.x" :y="SVG_HEIGHT"
          text-anchor="middle" class="text-[9px] fill-gray-400" font-family="monospace"
        >
          {{ line.label }}ms
        </text>

        <!-- Section labels -->
        <text :x="LEFT_MARGIN - 8" :y="RAW_Y + WAVEFORM_HEIGHT / 2 + 1" text-anchor="end" class="text-[10px] fill-gray-500 font-medium">
          Raw
        </text>
        <text :x="LEFT_MARGIN - 8" :y="DEBOUNCED_Y + WAVEFORM_HEIGHT / 2 + 1" text-anchor="end" class="text-[10px] fill-gray-500 font-medium">
          Output
        </text>

        <!-- HIGH / LOW labels -->
        <text :x="LEFT_MARGIN - 8" :y="RAW_Y + 4" text-anchor="end" class="text-[8px] fill-gray-300">HIGH</text>
        <text :x="LEFT_MARGIN - 8" :y="RAW_Y + WAVEFORM_HEIGHT + 4" text-anchor="end" class="text-[8px] fill-gray-300">LOW</text>
        <text :x="LEFT_MARGIN - 8" :y="DEBOUNCED_Y + 4" text-anchor="end" class="text-[8px] fill-gray-300">HIGH</text>
        <text :x="LEFT_MARGIN - 8" :y="DEBOUNCED_Y + WAVEFORM_HEIGHT + 4" text-anchor="end" class="text-[8px] fill-gray-300">LOW</text>

        <!-- Baseline for raw signal -->
        <line
          :x1="LEFT_MARGIN" :y1="RAW_Y + WAVEFORM_HEIGHT"
          :x2="msToX(TIMELINE_MS)" :y2="RAW_Y + WAVEFORM_HEIGHT"
          stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="2,2"
        />
        <!-- Baseline for debounced signal -->
        <line
          :x1="LEFT_MARGIN" :y1="DEBOUNCED_Y + WAVEFORM_HEIGHT"
          :x2="msToX(TIMELINE_MS)" :y2="DEBOUNCED_Y + WAVEFORM_HEIGHT"
          stroke="#e5e7eb" stroke-width="0.5" stroke-dasharray="2,2"
        />

        <!-- Debounce window rectangle -->
        <rect
          :x="debounceWindowRect.x"
          :y="30"
          :width="debounceWindowRect.width"
          :height="SVG_HEIGHT - 35"
          fill="#3b82f6" opacity="0.08"
          rx="2"
        />
        <!-- Window label -->
        <text
          :x="debounceWindowRect.x + debounceWindowRect.width / 2"
          y="25"
          text-anchor="middle" class="text-[8px] fill-blue-400" font-family="monospace"
        >
          {{ debounceWindow }}ms window
        </text>

        <!-- Animated content (clipped during animation) -->
        <g clip-path="url(#anim-clip)">
          <!-- Raw signal -->
          <path :d="rawSignalPath" fill="none" stroke="#ef4444" stroke-width="2" />

          <!-- Debounced signal -->
          <path :d="debouncedSignalPath" fill="none" stroke="#22c55e" stroke-width="2" />
        </g>

        <!-- Output time marker -->
        <g v-if="!isAnimating && animationTime >= outputTime">
          <line
            :x1="msToX(outputTime)" y1="DEBOUNCED_Y - 5"
            :x2="msToX(outputTime)" :y2="DEBOUNCED_Y + WAVEFORM_HEIGHT + 5"
            stroke="#22c55e" stroke-width="1" stroke-dasharray="3,2"
          />
          <text
            :x="msToX(outputTime)" :y="DEBOUNCED_Y - 8"
            text-anchor="middle" class="text-[8px] fill-green-600 font-medium" font-family="monospace"
          >
            Key registered: {{ outputTime.toFixed(1) }}ms
          </text>
        </g>

        <!-- Animation playhead -->
        <line
          v-if="isAnimating"
          :x1="msToX(animationTime)" y1="28"
          :x2="msToX(animationTime)" :y2="SVG_HEIGHT - 5"
          stroke="#3b82f6" stroke-width="1.5" opacity="0.5"
        />

        <!-- Separator between waveforms -->
        <line
          :x1="LEFT_MARGIN" y1="110"
          :x2="msToX(TIMELINE_MS)" y2="110"
          stroke="#e5e7eb" stroke-width="0.5"
        />
      </svg>
    </div>

    <!-- Strategy explanation -->
    <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
      <p v-if="strategy === 'delay'">
        <strong>Delay-based:</strong> As soon as the first transition is detected, start a timer. After {{ debounceWindow }}ms, accept the current state. Fast but may accept the signal before bouncing has fully stopped.
      </p>
      <p v-else>
        <strong>Integration:</strong> Wait for the signal to remain stable for {{ debounceWindow }}ms continuously. More reliable — the signal must settle completely before registering — but adds more latency ({{ outputTime.toFixed(1) }}ms total).
      </p>
    </div>
  </div>
</template>
