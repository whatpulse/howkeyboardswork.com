<script setup lang="ts">
import { ref, computed, inject, watch } from 'vue'

const resetTrigger = inject<import('vue').Ref<number>>('resetTrigger')

// Modifier keys with their bit positions
const modifiers = [
  { name: 'L Ctrl', bit: 0 },
  { name: 'L Shift', bit: 1 },
  { name: 'L Alt', bit: 2 },
  { name: 'L GUI', bit: 3 },
  { name: 'R Ctrl', bit: 4 },
  { name: 'R Shift', bit: 5 },
  { name: 'R Alt', bit: 6 },
  { name: 'R GUI', bit: 7 },
]

// Regular keys available to press
interface RegularKey {
  label: string
  hid: number
}

const regularKeys: RegularKey[][] = [
  [
    { label: '1', hid: 0x1E }, { label: '2', hid: 0x1F }, { label: '3', hid: 0x20 },
    { label: '4', hid: 0x21 }, { label: '5', hid: 0x22 }, { label: '6', hid: 0x23 },
    { label: '7', hid: 0x24 }, { label: '8', hid: 0x25 }, { label: '9', hid: 0x26 },
    { label: '0', hid: 0x27 },
  ],
  [
    { label: 'Q', hid: 0x14 }, { label: 'W', hid: 0x1A }, { label: 'E', hid: 0x08 },
    { label: 'R', hid: 0x15 }, { label: 'T', hid: 0x17 }, { label: 'Y', hid: 0x1C },
    { label: 'U', hid: 0x18 }, { label: 'I', hid: 0x0C }, { label: 'O', hid: 0x12 },
    { label: 'P', hid: 0x13 },
  ],
  [
    { label: 'A', hid: 0x04 }, { label: 'S', hid: 0x16 }, { label: 'D', hid: 0x07 },
    { label: 'F', hid: 0x09 }, { label: 'G', hid: 0x0A }, { label: 'H', hid: 0x0B },
    { label: 'J', hid: 0x0D }, { label: 'K', hid: 0x0E }, { label: 'L', hid: 0x0F },
  ],
  [
    { label: 'Z', hid: 0x1D }, { label: 'X', hid: 0x1B }, { label: 'C', hid: 0x06 },
    { label: 'V', hid: 0x19 }, { label: 'B', hid: 0x05 }, { label: 'N', hid: 0x11 },
    { label: 'M', hid: 0x10 },
  ],
]

const activeModifiers = ref<Set<number>>(new Set())
const activeKeys = ref<number[]>([])
const overflowWarning = ref(false)

function toggleModifier(bit: number) {
  if (activeModifiers.value.has(bit)) {
    activeModifiers.value.delete(bit)
  } else {
    activeModifiers.value.add(bit)
  }
  activeModifiers.value = new Set(activeModifiers.value)
}

function toggleKey(hid: number) {
  const idx = activeKeys.value.indexOf(hid)
  if (idx >= 0) {
    activeKeys.value = activeKeys.value.filter(k => k !== hid)
    overflowWarning.value = false
  } else {
    if (activeKeys.value.length >= 6) {
      overflowWarning.value = true
      return
    }
    activeKeys.value = [...activeKeys.value, hid]
    overflowWarning.value = false
  }
}

function isKeyActive(hid: number): boolean {
  return activeKeys.value.includes(hid)
}

// Compute the 8-byte HID report
const hidReport = computed(() => {
  // Byte 0: modifier bitmask
  let modByte = 0
  for (const bit of activeModifiers.value) {
    modByte |= (1 << bit)
  }

  // Byte 1: reserved (always 0)
  // Bytes 2-7: key codes
  const bytes = [modByte, 0, 0, 0, 0, 0, 0, 0]
  for (let i = 0; i < Math.min(activeKeys.value.length, 6); i++) {
    bytes[2 + i] = activeKeys.value[i]
  }
  return bytes
})

// Modifier byte as binary string
const modBinary = computed(() => {
  return hidReport.value[0].toString(2).padStart(8, '0')
})

function formatHex(n: number): string {
  return '0x' + n.toString(16).toUpperCase().padStart(2, '0')
}

const byteLabels = ['Modifiers', 'Reserved', 'Key 1', 'Key 2', 'Key 3', 'Key 4', 'Key 5', 'Key 6']

function reset() {
  activeModifiers.value = new Set()
  activeKeys.value = []
  overflowWarning.value = false
}

if (resetTrigger) {
  watch(resetTrigger, reset)
}

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4">
    <!-- HID Report bytes -->
    <div>
      <div class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">8-Byte HID Report</div>
      <div class="flex gap-1 overflow-x-auto pb-1">
        <div
          v-for="(byte, i) in hidReport"
          :key="i"
          class="flex-shrink-0 w-[72px] rounded-lg border-2 p-2 text-center transition-colors"
          :class="{
            'border-purple-300 bg-purple-50': i === 0 && byte > 0,
            'border-gray-200 bg-gray-50': i === 0 && byte === 0,
            'border-gray-200 bg-gray-50/50': i === 1,
            'border-primary-300 bg-primary-50': i >= 2 && byte > 0,
            'border-gray-200 bg-white': i >= 2 && byte === 0,
          }"
        >
          <div class="font-mono text-sm font-bold" :class="byte > 0 ? 'text-gray-900' : 'text-gray-300'">
            {{ formatHex(byte) }}
          </div>
          <div class="text-[9px] text-gray-400 mt-1 leading-tight">{{ byteLabels[i] }}</div>
        </div>
      </div>
    </div>

    <!-- Modifier bitmask detail -->
    <div v-if="hidReport[0] > 0" class="px-3 py-2 bg-purple-50 rounded-lg border border-purple-100">
      <div class="text-[10px] text-purple-500 uppercase tracking-wide mb-1">Modifier byte breakdown</div>
      <div class="flex gap-0.5 font-mono text-sm">
        <span
          v-for="(bit, i) in modBinary.split('')"
          :key="i"
          class="w-5 text-center rounded"
          :class="bit === '1' ? 'bg-purple-200 text-purple-800 font-bold' : 'text-gray-300'"
        >
          {{ bit }}
        </span>
      </div>
      <div class="flex gap-0.5 mt-0.5">
        <span v-for="(mod, i) in [...modifiers].reverse()" :key="i" class="w-5 text-center text-[7px] text-gray-400 leading-tight">
          {{ mod.name.split(' ')[1]?.charAt(0) }}{{ mod.name.split(' ')[0].charAt(0) }}
        </span>
      </div>
    </div>

    <!-- Modifier keys -->
    <div>
      <div class="text-xs text-gray-500 mb-2">Modifier keys (byte 0 — bit flags):</div>
      <div class="flex flex-wrap gap-1">
        <button
          v-for="mod in modifiers"
          :key="mod.bit"
          @click="toggleModifier(mod.bit)"
          class="px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors"
          :class="activeModifiers.has(mod.bit)
            ? 'bg-purple-500 border-purple-400 text-white'
            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'"
        >
          {{ mod.name }}
        </button>
      </div>
    </div>

    <!-- Regular keys -->
    <div>
      <div class="text-xs text-gray-500 mb-2">Regular keys (bytes 2–7 — up to 6 simultaneous):</div>
      <div class="inline-block bg-gray-100 rounded-lg p-2">
        <div
          v-for="(row, rowIdx) in regularKeys"
          :key="rowIdx"
          class="flex gap-1 mb-1 last:mb-0"
          :style="{ paddingLeft: rowIdx === 1 ? '6px' : rowIdx === 2 ? '14px' : rowIdx === 3 ? '22px' : '0' }"
        >
          <button
            v-for="key in row"
            :key="key.hid"
            @click="toggleKey(key.hid)"
            class="w-8 h-8 rounded text-xs font-medium border transition-all duration-100 flex items-center justify-center"
            :class="isKeyActive(key.hid)
              ? 'bg-primary-500 border-primary-400 text-white shadow-sm'
              : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'"
          >
            {{ key.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Overflow warning -->
    <div
      v-if="overflowWarning"
      class="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700"
    >
      <strong>6-Key Rollover limit reached!</strong> The standard HID report only has 6 key slots (bytes 2–7). A 7th key cannot be reported. Gaming keyboards work around this with custom HID descriptors or multiple reports.
    </div>

    <!-- Hex dump -->
    <div class="px-3 py-2 bg-gray-900 rounded-lg font-mono text-sm">
      <span class="text-gray-500">Report: </span>
      <span
        v-for="(byte, i) in hidReport"
        :key="i"
      >
        <span :class="byte > 0 ? (i === 0 ? 'text-purple-400' : 'text-green-400') : 'text-gray-600'">
          {{ byte.toString(16).toUpperCase().padStart(2, '0') }}
        </span>
        <span v-if="i < 7" class="text-gray-700"> </span>
      </span>
    </div>
  </div>
</template>
