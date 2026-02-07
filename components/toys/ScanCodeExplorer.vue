<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'

const resetTrigger = inject<import('vue').Ref<number>>('resetTrigger')

const selectedKey = ref<string | null>(null)
const layout = ref<'qwerty' | 'azerty' | 'dvorak'>('qwerty')

// Key definitions: each key has a position ID, HID code, and characters for each layout
interface KeyDef {
  id: string
  hid: number
  qwerty: string
  azerty: string
  dvorak: string
  width?: number // in grid units (default 1)
}

const keyRows: KeyDef[][] = [
  // Number row
  [
    { id: 'key-1', hid: 0x1E, qwerty: '1', azerty: '&', dvorak: '1' },
    { id: 'key-2', hid: 0x1F, qwerty: '2', azerty: 'é', dvorak: '2' },
    { id: 'key-3', hid: 0x20, qwerty: '3', azerty: '"', dvorak: '3' },
    { id: 'key-4', hid: 0x21, qwerty: '4', azerty: "'", dvorak: '4' },
    { id: 'key-5', hid: 0x22, qwerty: '5', azerty: '(', dvorak: '5' },
    { id: 'key-6', hid: 0x23, qwerty: '6', azerty: '-', dvorak: '6' },
    { id: 'key-7', hid: 0x24, qwerty: '7', azerty: 'è', dvorak: '7' },
    { id: 'key-8', hid: 0x25, qwerty: '8', azerty: '_', dvorak: '8' },
    { id: 'key-9', hid: 0x26, qwerty: '9', azerty: 'ç', dvorak: '9' },
    { id: 'key-0', hid: 0x27, qwerty: '0', azerty: 'à', dvorak: '0' },
  ],
  // Top letter row
  [
    { id: 'key-q', hid: 0x14, qwerty: 'Q', azerty: 'A', dvorak: "'" },
    { id: 'key-w', hid: 0x1A, qwerty: 'W', azerty: 'Z', dvorak: ',' },
    { id: 'key-e', hid: 0x08, qwerty: 'E', azerty: 'E', dvorak: '.' },
    { id: 'key-r', hid: 0x15, qwerty: 'R', azerty: 'R', dvorak: 'P' },
    { id: 'key-t', hid: 0x17, qwerty: 'T', azerty: 'T', dvorak: 'Y' },
    { id: 'key-y', hid: 0x1C, qwerty: 'Y', azerty: 'Y', dvorak: 'F' },
    { id: 'key-u', hid: 0x18, qwerty: 'U', azerty: 'U', dvorak: 'G' },
    { id: 'key-i', hid: 0x0C, qwerty: 'I', azerty: 'I', dvorak: 'C' },
    { id: 'key-o', hid: 0x12, qwerty: 'O', azerty: 'O', dvorak: 'R' },
    { id: 'key-p', hid: 0x13, qwerty: 'P', azerty: 'P', dvorak: 'L' },
  ],
  // Home row
  [
    { id: 'key-a', hid: 0x04, qwerty: 'A', azerty: 'Q', dvorak: 'A' },
    { id: 'key-s', hid: 0x16, qwerty: 'S', azerty: 'S', dvorak: 'O' },
    { id: 'key-d', hid: 0x07, qwerty: 'D', azerty: 'D', dvorak: 'E' },
    { id: 'key-f', hid: 0x09, qwerty: 'F', azerty: 'F', dvorak: 'U' },
    { id: 'key-g', hid: 0x0A, qwerty: 'G', azerty: 'G', dvorak: 'I' },
    { id: 'key-h', hid: 0x0B, qwerty: 'H', azerty: 'H', dvorak: 'D' },
    { id: 'key-j', hid: 0x0D, qwerty: 'J', azerty: 'J', dvorak: 'H' },
    { id: 'key-k', hid: 0x0E, qwerty: 'K', azerty: 'K', dvorak: 'T' },
    { id: 'key-l', hid: 0x0F, qwerty: 'L', azerty: 'L', dvorak: 'N' },
    { id: 'key-semicolon', hid: 0x33, qwerty: ';', azerty: 'M', dvorak: 'S' },
  ],
  // Bottom row
  [
    { id: 'key-z', hid: 0x1D, qwerty: 'Z', azerty: 'W', dvorak: ';' },
    { id: 'key-x', hid: 0x1B, qwerty: 'X', azerty: 'X', dvorak: 'Q' },
    { id: 'key-c', hid: 0x06, qwerty: 'C', azerty: 'C', dvorak: 'J' },
    { id: 'key-v', hid: 0x19, qwerty: 'V', azerty: 'V', dvorak: 'K' },
    { id: 'key-b', hid: 0x05, qwerty: 'B', azerty: 'B', dvorak: 'X' },
    { id: 'key-n', hid: 0x11, qwerty: 'N', azerty: 'N', dvorak: 'B' },
    { id: 'key-m', hid: 0x10, qwerty: 'M', azerty: ',', dvorak: 'M' },
    { id: 'key-comma', hid: 0x36, qwerty: ',', azerty: ';', dvorak: 'W' },
    { id: 'key-period', hid: 0x37, qwerty: '.', azerty: ':', dvorak: 'V' },
    { id: 'key-slash', hid: 0x38, qwerty: '/', azerty: '!', dvorak: 'Z' },
  ],
]

function getDisplayChar(key: KeyDef): string {
  return key[layout.value]
}

function selectKey(key: KeyDef) {
  selectedKey.value = selectedKey.value === key.id ? null : key.id
}

const selectedKeyDef = computed(() => {
  if (!selectedKey.value) return null
  for (const row of keyRows) {
    for (const key of row) {
      if (key.id === selectedKey.value) return key
    }
  }
  return null
})

function formatHex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(2, '0')
}

function formatBinary(n: number): string {
  return n.toString(2).padStart(8, '0')
}

function reset() {
  selectedKey.value = null
  layout.value = 'qwerty'
}

if (resetTrigger) {
  watch(resetTrigger, reset)
}

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4">
    <!-- Layout switcher -->
    <div class="flex items-center gap-2 text-sm">
      <span class="text-gray-600">OS Layout:</span>
      <button
        v-for="l in (['qwerty', 'azerty', 'dvorak'] as const)"
        :key="l"
        @click="layout = l"
        class="px-2.5 py-1 rounded text-xs font-medium uppercase transition-colors"
        :class="layout === l ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'"
      >
        {{ l }}
      </button>
    </div>

    <!-- Keyboard -->
    <div class="overflow-x-auto">
      <div class="inline-block bg-gray-800 rounded-lg p-3 pb-4">
        <div
          v-for="(row, rowIdx) in keyRows"
          :key="rowIdx"
          class="flex gap-1 mb-1 last:mb-0"
          :style="{ paddingLeft: rowIdx === 1 ? '8px' : rowIdx === 2 ? '16px' : rowIdx === 3 ? '28px' : '0' }"
        >
          <button
            v-for="key in row"
            :key="key.id"
            @click="selectKey(key)"
            class="w-9 h-9 rounded-md text-xs font-medium transition-all duration-100 flex items-center justify-center border"
            :class="selectedKey === key.id
              ? 'bg-primary-500 border-primary-400 text-white shadow-lg shadow-primary-500/30 -translate-y-0.5'
              : 'bg-gray-700 border-gray-600 text-gray-200 hover:bg-gray-600 hover:border-gray-500'"
          >
            {{ getDisplayChar(key) }}
          </button>
        </div>
      </div>
    </div>

    <!-- Info panel -->
    <div class="rounded-lg border border-gray-200 overflow-hidden">
      <div v-if="!selectedKeyDef" class="p-4 text-sm text-gray-400 text-center">
        Click a key to see its scan code
      </div>
      <div v-else class="divide-y divide-gray-100">
        <div class="p-3 bg-gray-50">
          <span class="text-xs font-medium text-gray-500 uppercase tracking-wide">Physical Key: {{ selectedKeyDef.id.replace('key-', '').toUpperCase() }} position</span>
        </div>
        <div class="grid grid-cols-2 gap-px bg-gray-100">
          <div class="bg-white p-3">
            <div class="text-xs text-gray-500 mb-1">USB HID Code</div>
            <div class="font-mono text-lg text-primary-600 font-bold">{{ formatHex(selectedKeyDef.hid) }}</div>
          </div>
          <div class="bg-white p-3">
            <div class="text-xs text-gray-500 mb-1">Binary</div>
            <div class="font-mono text-lg text-gray-700">{{ formatBinary(selectedKeyDef.hid) }}</div>
          </div>
        </div>
        <div class="p-3">
          <div class="text-xs text-gray-500 mb-2">Same scan code, different character per layout:</div>
          <div class="flex gap-3">
            <div
              v-for="l in (['qwerty', 'azerty', 'dvorak'] as const)"
              :key="l"
              class="flex items-center gap-1.5 px-2 py-1 rounded text-sm"
              :class="layout === l ? 'bg-primary-50 text-primary-700 font-medium' : 'text-gray-600'"
            >
              <span class="uppercase text-[10px] text-gray-400 w-12">{{ l }}:</span>
              <span class="font-mono font-bold text-base">{{ selectedKeyDef[l] }}</span>
            </div>
          </div>
        </div>
        <div class="p-3 bg-amber-50 text-xs text-amber-700">
          The keyboard always sends <strong class="font-mono">{{ formatHex(selectedKeyDef.hid) }}</strong> — your OS maps it to
          <strong>"{{ selectedKeyDef[layout] }}"</strong> based on the {{ layout.toUpperCase() }} layout.
        </div>
      </div>
    </div>
  </div>
</template>
