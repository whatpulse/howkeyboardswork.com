<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'

const ROWS = 4
const COLS = 10

// Key labels for the grid (simplified keyboard layout)
const keyLabels = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', ';'],
  ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.', '/']
]

const pressedKeys = ref<Set<string>>(new Set())
const currentScanRow = ref(0)
const detectedKeys = ref<string[]>([])
const diodesEnabled = ref(true)
const ghostKeys = ref<Set<string>>(new Set())
const outputKeys = ref<string[]>([])
const announcedKeys = ref<Set<string>>(new Set())

let scanInterval: ReturnType<typeof setInterval> | null = null

function getKeyId(row: number, col: number): string {
  return `${row}-${col}`
}

function getKeyLabel(keyId: string): string {
  const [r, c] = keyId.split('-').map(Number)
  return keyLabels[r]?.[c] || ''
}

function toggleKey(row: number, col: number) {
  const keyId = getKeyId(row, col)
  if (pressedKeys.value.has(keyId)) {
    pressedKeys.value.delete(keyId)
    announcedKeys.value.delete(keyId)
    announcedKeys.value = new Set(announcedKeys.value)
  } else {
    pressedKeys.value.add(keyId)
  }
  pressedKeys.value = new Set(pressedKeys.value) // Trigger reactivity
  checkForGhosting()
}

function isPressed(row: number, col: number): boolean {
  return pressedKeys.value.has(getKeyId(row, col))
}

function isScanning(row: number): boolean {
  return currentScanRow.value === row
}

function isDetected(row: number, col: number): boolean {
  return detectedKeys.value.includes(getKeyId(row, col))
}

function isGhost(row: number, col: number): boolean {
  return ghostKeys.value.has(getKeyId(row, col))
}

function checkForGhosting() {
  ghostKeys.value.clear()

  if (diodesEnabled.value) return

  const pressed = Array.from(pressedKeys.value).map(id => {
    const [r, c] = id.split('-').map(Number)
    return { row: r, col: c, id }
  })

  if (pressed.length < 3) return

  for (let i = 0; i < pressed.length; i++) {
    for (let j = i + 1; j < pressed.length; j++) {
      const k1 = pressed[i]
      const k2 = pressed[j]

      if (k1.row !== k2.row && k1.col !== k2.col) {
        const corner1 = getKeyId(k1.row, k2.col)
        const corner2 = getKeyId(k2.row, k1.col)

        if (pressedKeys.value.has(corner1) || pressedKeys.value.has(corner2)) {
          if (!pressedKeys.value.has(corner1)) {
            ghostKeys.value.add(corner1)
          }
          if (!pressedKeys.value.has(corner2)) {
            ghostKeys.value.add(corner2)
          }
        }
      }
    }
  }

  ghostKeys.value = new Set(ghostKeys.value)
}

function startScanning() {
  if (scanInterval) return

  scanInterval = setInterval(() => {
    currentScanRow.value = (currentScanRow.value + 1) % ROWS

    // Detect keys in the current row
    const detected: string[] = []
    for (let col = 0; col < COLS; col++) {
      const keyId = getKeyId(currentScanRow.value, col)
      const isRealPress = pressedKeys.value.has(keyId)
      const isGhostKey = !diodesEnabled.value && ghostKeys.value.has(keyId)

      if (isRealPress || isGhostKey) {
        detected.push(keyId)

        // Add to output if not already announced
        if (!announcedKeys.value.has(keyId)) {
          announcedKeys.value.add(keyId)
          announcedKeys.value = new Set(announcedKeys.value)
          const label = getKeyLabel(keyId)
          if (label) {
            outputKeys.value = [...outputKeys.value, isGhostKey && !isRealPress ? `👻${label}` : label]
          }
        }
      }
    }
    detectedKeys.value = detected
  }, 150)
}

function stopScanning() {
  if (scanInterval) {
    clearInterval(scanInterval)
    scanInterval = null
  }
}

function reset() {
  pressedKeys.value = new Set()
  ghostKeys.value = new Set()
  detectedKeys.value = []
  announcedKeys.value = new Set()
  outputKeys.value = []
  currentScanRow.value = 0
}

watch(diodesEnabled, () => {
  checkForGhosting()
})

onMounted(() => {
  startScanning()
})

onUnmounted(() => {
  stopScanning()
})

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4">
    <div class="flex items-center gap-4 mb-4">
      <label class="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          v-model="diodesEnabled"
          class="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <span :class="diodesEnabled ? 'text-green-700 font-medium' : 'text-red-700 font-medium'">
          Diodes {{ diodesEnabled ? 'enabled' : 'disabled' }}
        </span>
      </label>
    </div>

    <div class="overflow-x-auto">
      <div class="inline-block">
        <div class="flex items-center gap-2 mb-2">
          <div class="w-8"></div>
          <div
            v-for="col in COLS"
            :key="`header-${col}`"
            class="w-10 text-center text-xs text-gray-400 font-mono"
          >
            C{{ col - 1 }}
          </div>
        </div>

        <div
          v-for="row in ROWS"
          :key="`row-${row}`"
          class="flex items-center gap-2 mb-1"
        >
          <div
            class="w-8 text-right text-xs font-mono pr-2 transition-colors"
            :class="isScanning(row - 1) ? 'text-primary-600 font-bold' : 'text-gray-400'"
          >
            R{{ row - 1 }}
            <span v-if="isScanning(row - 1)" class="ml-1">→</span>
          </div>

          <button
            v-for="col in COLS"
            :key="`cell-${row}-${col}`"
            @click="toggleKey(row - 1, col - 1)"
            class="w-10 h-10 rounded-md border-2 text-xs font-medium transition-all duration-100 flex items-center justify-center"
            :class="{
              'bg-primary-500 border-primary-600 text-white shadow-md': isPressed(row - 1, col - 1),
              'bg-yellow-400 border-yellow-500 text-yellow-900 shadow-md animate-pulse': isGhost(row - 1, col - 1),
              'bg-green-400 border-green-500 text-white': isDetected(row - 1, col - 1) && !isGhost(row - 1, col - 1),
              'bg-primary-100 border-primary-300': isScanning(row - 1) && !isPressed(row - 1, col - 1) && !isGhost(row - 1, col - 1),
              'bg-gray-100 border-gray-300 hover:bg-gray-200': !isPressed(row - 1, col - 1) && !isScanning(row - 1) && !isGhost(row - 1, col - 1)
            }"
          >
            {{ keyLabels[row - 1]?.[col - 1] || '' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Output area -->
    <div class="p-3 bg-white border border-gray-200 rounded-lg">
      <div class="flex items-center justify-between mb-2">
        <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Scanner Output</span>
        <button
          v-if="outputKeys.length > 0"
          @click="outputKeys = []; announcedKeys = new Set()"
          class="text-xs text-gray-400 hover:text-gray-600"
        >
          Clear
        </button>
      </div>
      <div class="min-h-[2rem] flex items-center">
        <div v-if="outputKeys.length === 0" class="text-sm text-gray-300 italic">
          Press keys and watch them appear here as the scanner detects them...
        </div>
        <div v-else class="flex flex-wrap gap-1">
          <span
            v-for="(key, i) in outputKeys"
            :key="i"
            class="inline-flex items-center px-2 py-0.5 rounded text-sm font-mono"
            :class="key.startsWith('👻') ? 'bg-amber-100 text-amber-800 border border-amber-200' : 'bg-gray-100 text-gray-700 border border-gray-200'"
          >
            {{ key }}
          </span>
        </div>
      </div>
    </div>

    <div class="flex flex-wrap gap-4 text-sm">
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-primary-500 border border-primary-600"></div>
        <span class="text-gray-600">Pressed</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-green-400 border border-green-500"></div>
        <span class="text-gray-600">Detected (scanning)</span>
      </div>
      <div class="flex items-center gap-2">
        <div class="w-4 h-4 rounded bg-yellow-400 border border-yellow-500"></div>
        <span class="text-gray-600">Ghost key</span>
      </div>
    </div>

    <div
      v-if="!diodesEnabled && ghostKeys.size > 0"
      class="p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800"
    >
      <strong>Ghosting detected!</strong> Without diodes, pressing multiple keys that form corners of a rectangle causes false key detection. Try enabling diodes to fix this.
    </div>

    <div class="p-3 bg-gray-50 rounded-lg text-sm text-gray-600">
      <p class="font-medium mb-1">How it works:</p>
      <p>Click keys to "press" them. Watch the scanner move through rows (R0-R3). When the scanner reaches a row with pressed keys, those keys light up green as "detected" and appear in the output. Try pressing Q, W, and A with diodes off to see ghosting at S.</p>
    </div>
  </div>
</template>
