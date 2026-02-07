<script setup lang="ts">
import { ref, computed } from 'vue'

// Stage definitions with timing
const stages = [
  { id: 'press', label: 'Key Press', description: 'Your thumb pushes down on the spacebar, compressing the spring inside the switch.', icon: '👆' },
  { id: 'switch', label: 'Switch Closes', description: 'The metal contact leaves inside the switch come together, completing an electrical circuit.', icon: '⚡' },
  { id: 'matrix', label: 'Matrix Detects', description: 'The keyboard scans rows and columns to find which key position is now connected.', icon: '🔲' },
  { id: 'debounce', label: 'Debounce', description: 'The controller waits ~5ms to filter out electrical noise from contact bounce.', icon: '⏱️' },
  { id: 'controller', label: 'Scan Code', description: 'The MCU converts the matrix position into a standardized USB HID scan code.', icon: '🔢' },
  { id: 'usb', label: 'USB HID', description: 'The scan code is packaged into an 8-byte HID report and sent over USB.', icon: '📤' },
  { id: 'os', label: 'OS Event', description: 'The operating system receives the USB report and creates a keyboard event.', icon: '💻' },
  { id: 'app', label: 'Application', description: 'The keystroke event is dispatched to your focused application window.', icon: '✨' }
] as const

type StageId = typeof stages[number]['id']

const currentStage = ref<number>(-1)
const isRunning = ref(false)
const isComplete = ref(false)
const keyPressed = ref(false)

// Track which paths are animating
const pathProgress = ref<Record<string, number>>({
  'switch-to-matrix': 0,
  'matrix-to-controller': 0,
  'controller-to-usb': 0,
  'usb-cable': 0,
  'usb-to-os': 0,
  'os-to-app': 0
})

const activeStage = computed(() => {
  if (currentStage.value < 0) return null
  return stages[currentStage.value]?.id || null
})

function isStageActive(stageId: StageId): boolean {
  const stageIndex = stages.findIndex(s => s.id === stageId)
  return currentStage.value >= stageIndex
}

function isCurrentStage(stageId: StageId): boolean {
  return activeStage.value === stageId
}

async function animatePath(pathId: string, duration: number) {
  const steps = 20
  const stepDuration = duration / steps
  for (let i = 0; i <= steps; i++) {
    pathProgress.value[pathId] = i / steps
    await new Promise(r => setTimeout(r, stepDuration))
  }
}

async function runPipeline() {
  if (isRunning.value) return

  // Reset state
  isRunning.value = true
  isComplete.value = false
  currentStage.value = -1
  keyPressed.value = false
  Object.keys(pathProgress.value).forEach(k => pathProgress.value[k] = 0)

  // Stage 0: Key press animation
  currentStage.value = 0
  keyPressed.value = true
  await new Promise(r => setTimeout(r, 500))

  // Stage 1: Switch closes
  currentStage.value = 1
  await new Promise(r => setTimeout(r, 600))

  // Stage 2: Matrix detects + path animation
  currentStage.value = 2
  await animatePath('switch-to-matrix', 400)

  // Stage 3: Debounce
  currentStage.value = 3
  await animatePath('matrix-to-controller', 600)

  // Stage 4: Controller generates scan code
  currentStage.value = 4
  await new Promise(r => setTimeout(r, 500))

  // Stage 5: USB transmission
  currentStage.value = 5
  await animatePath('controller-to-usb', 150)
  await animatePath('usb-cable', 600)

  // Stage 6: OS receives
  currentStage.value = 6
  await animatePath('usb-to-os', 400)

  // Stage 7: App receives
  currentStage.value = 7
  await animatePath('os-to-app', 300)

  // Complete
  await new Promise(r => setTimeout(r, 200))
  isComplete.value = true
  isRunning.value = false
}

function reset() {
  isRunning.value = false
  isComplete.value = false
  currentStage.value = -1
  keyPressed.value = false
  Object.keys(pathProgress.value).forEach(k => pathProgress.value[k] = 0)
}

defineExpose({ reset })
</script>

<template>
  <div class="space-y-4">
    <!-- Controls -->
    <div class="flex items-center gap-4">
      <button @click="runPipeline" :disabled="isRunning"
        class="px-5 py-2.5 bg-primary-600 text-white rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md">
        <span class="flex items-center gap-2">
          <svg v-if="!isRunning" class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <svg v-else class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
            </path>
          </svg>
          {{ isRunning ? 'Sending keystroke...' : 'Start' }}
        </span>
      </button>
    </div>

    <!-- Main Visualization -->
    <div
      class="relative bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl border border-slate-700 p-4 sm:p-6 overflow-hidden">
      <svg viewBox="0 0 720 640" class="w-full h-auto">
        <defs>
          <linearGradient id="pathGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:#0ea5e9;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#22c55e;stop-opacity:1" />
          </linearGradient>
          <linearGradient id="cableGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#374151" />
            <stop offset="50%" style="stop-color:#4b5563" />
            <stop offset="100%" style="stop-color:#374151" />
          </linearGradient>
          <linearGradient id="screenGlow" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a" />
            <stop offset="100%" style="stop-color:#1e293b" />
          </linearGradient>
          <linearGradient id="keycapTop" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#6b7280" />
            <stop offset="100%" style="stop-color:#4b5563" />
          </linearGradient>
          <linearGradient id="keycapTopActive" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#60a5fa" />
            <stop offset="100%" style="stop-color:#3b82f6" />
          </linearGradient>
          <linearGradient id="kbCase" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color:#374151" />
            <stop offset="100%" style="stop-color:#1f2937" />
          </linearGradient>

          <!-- Glow filter -->
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="softGlow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <!-- ==================== COMPUTER / MONITOR (TOP) ==================== -->
        <g transform="translate(160, 10)">
          <text x="200" y="8" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600"
            letter-spacing="0.15em">COMPUTER</text>

          <!-- Monitor outer bezel -->
          <rect x="20" y="16" width="360" height="200" rx="10" fill="#1e293b" stroke="#475569" stroke-width="2" />
          <!-- Thin inner bezel -->
          <rect x="30" y="26" width="340" height="170" rx="6" fill="#0f172a" stroke="#334155" stroke-width="1" />
          <!-- Screen surface -->
          <rect x="34" y="30" width="332" height="162" rx="4" fill="url(#screenGlow)" />

          <!-- OS Section (left side of screen) -->
          <g transform="translate(44, 42)">
            <rect x="0" y="0" width="148" height="138" rx="6" :fill="isStageActive('os') ? '#1e3a5f' : '#1e293b'"
              :stroke="isStageActive('os') ? '#3b82f6' : '#334155'" stroke-width="1.5"
              :filter="isCurrentStage('os') ? 'url(#softGlow)' : ''" />

            <text x="74" y="20" text-anchor="middle" fill="#cbd5e1" font-size="11" font-weight="600">Operating
              System</text>

            <!-- OS layers -->
            <rect x="10" y="30" width="128" height="28" rx="3" :fill="isStageActive('os') ? '#1e40af' : '#1e293b'"
              stroke="#475569" stroke-width="1" />
            <text x="74" y="49" text-anchor="middle" fill="#93c5fd" font-size="10">USB HID Driver</text>

            <rect x="10" y="66" width="128" height="28" rx="3" :fill="isStageActive('os') ? '#1e3a5f' : '#1e293b'"
              stroke="#475569" stroke-width="1" />
            <text x="74" y="85" text-anchor="middle" fill="#93c5fd" font-size="10">Input Subsystem</text>

            <rect x="10" y="102" width="128" height="28" rx="3" :fill="isStageActive('os') ? '#14532d' : '#1e293b'"
              stroke="#475569" stroke-width="1" />
            <text x="74" y="121" text-anchor="middle" fill="#86efac" font-size="10">Event Dispatch</text>
          </g>

          <!-- Arrow between OS and App -->
          <g transform="translate(192, 90)">
            <path d="M 0 20 L 16 20" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="4,3" />
            <path d="M 0 20 L 16 20" fill="none" stroke="#22c55e" stroke-width="3" :stroke-dasharray="16"
              :stroke-dashoffset="16 - (pathProgress['os-to-app'] * 16)"
              style="transition: stroke-dashoffset 0.05s linear" />
            <polygon v-if="isStageActive('app')" points="12,14 20,20 12,26" fill="#22c55e" opacity="0.8" />
          </g>

          <!-- App Section (right side of screen) -->
          <g transform="translate(208, 42)">
            <rect x="0" y="0" width="148" height="138" rx="6" :fill="isStageActive('app') ? '#14532d' : '#1e293b'"
              :stroke="isStageActive('app') ? '#22c55e' : '#334155'" stroke-width="1.5"
              :filter="isCurrentStage('app') ? 'url(#softGlow)' : ''" />

            <!-- App window chrome -->
            <rect x="8" y="10" width="132" height="118" rx="4" fill="#0f172a" stroke="#475569" stroke-width="1" />
            <!-- Window title bar -->
            <rect x="8" y="10" width="132" height="22" rx="4" fill="#1e293b" />
            <rect x="8" y="24" width="132" height="8" fill="#1e293b" />
            <!-- Traffic lights -->
            <circle cx="20" cy="21" r="3.5" fill="#ef4444" />
            <circle cx="31" cy="21" r="3.5" fill="#eab308" />
            <circle cx="42" cy="21" r="3.5" fill="#22c55e" />
            <text x="74" y="25" text-anchor="middle" fill="#64748b" font-size="9">Text Editor</text>

            <!-- Editor content area -->
            <g transform="translate(14, 38)">
              <!-- Line numbers gutter -->
              <rect x="0" y="0" width="20" height="84" fill="#111827" rx="2" />
              <text x="10" y="14" text-anchor="middle" fill="#4b5563" font-size="8" font-family="monospace">1</text>
              <text x="10" y="26" text-anchor="middle" fill="#4b5563" font-size="8" font-family="monospace">2</text>
              <text x="10" y="38" text-anchor="middle" fill="#4b5563" font-size="8" font-family="monospace">3</text>

              <!-- Code lines -->
              <rect x="24" y="4" width="60" height="6" rx="1" fill="#334155" opacity="0.5" />
              <rect x="24" y="16" width="45" height="6" rx="1" fill="#334155" opacity="0.5" />
              <!-- Active line -->
              <rect x="22" y="28" width="96" height="12" rx="1" fill="#1e293b" />

              <!-- Pre-existing text "Hello" -->
              <text x="26" y="38" fill="#cbd5e1" font-size="9" font-family="monospace">Hello</text>

              <!-- Typed space or cursor -->
              <g v-if="isComplete">
                <!-- Highlighted space -->
                <rect x="58" y="29" width="10" height="11" rx="1" fill="#22c55e" opacity="0.2" />
                <text x="59" y="38" fill="#22c55e" font-size="9" font-family="monospace">␣</text>
                <!-- Cursor after space -->
                <rect x="68" y="29" width="1.5" height="10" fill="#22c55e" />
              </g>
              <g v-else-if="isStageActive('app')">
                <!-- Blinking cursor after "Hello" -->
                <rect x="58" y="29" width="1.5" height="10" fill="#22c55e">
                  <animate attributeName="opacity" values="1;0;1" dur="1s" repeatCount="indefinite" />
                </rect>
              </g>
            </g>
          </g>

          <!-- Monitor stand: neck -->
          <rect x="180" y="216" width="40" height="20" rx="2" fill="#334155" />
          <!-- Monitor stand: base -->
          <path d="M 150 236 Q 155 244 200 244 Q 245 244 250 236" fill="none" stroke="#475569" stroke-width="4"
            stroke-linecap="round" />

          <!-- USB port on back of monitor (left side, visible) -->
          <rect x="0" y="90" width="20" height="50" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <rect x="4" y="98" width="12" height="34" rx="2" fill="#111827" />
          <!-- USB icon -->
          <text x="10" y="118" text-anchor="middle" fill="#475569" font-size="8">USB</text>

          <!-- Path: USB port to OS box -->
          <path d="M 20 115 L 44 75" fill="none" stroke="#334155" stroke-width="2" stroke-dasharray="5,3" />
          <path d="M 20 115 L 44 75" fill="none" stroke="#3b82f6" stroke-width="3" :stroke-dasharray="50"
            :stroke-dashoffset="50 - (pathProgress['usb-to-os'] * 50)"
            style="transition: stroke-dashoffset 0.05s linear" />
        </g>

        <!-- ==================== KEYBOARD (BOTTOM) ==================== -->
        <g transform="translate(60, 320)">
          <text x="300" y="0" text-anchor="middle" fill="#64748b" font-size="11" font-weight="600"
            letter-spacing="0.15em">KEYBOARD</text>

          <!-- Keyboard case - angled profile -->
          <path
            d="M 30 12 L 570 12 Q 580 12 580 22 L 580 248 Q 580 258 570 258 L 30 258 Q 20 258 20 248 L 20 22 Q 20 12 30 12 Z"
            fill="url(#kbCase)" stroke="#4b5563" stroke-width="2" />

          <!-- Top surface with slight 3D perspective -->
          <path d="M 30 12 L 570 12 Q 580 12 580 18 L 575 28 L 25 32 L 20 18 Q 20 12 30 12 Z" fill="#4b5563"
            opacity="0.5" />

          <!-- ===== KEY ROWS (3 rows: letter row, home row, spacebar) ===== -->
          <!-- Row 1: QWERTY-ish letter keys -->
          <g transform="translate(40, 36)">
            <rect v-for="i in 13" :key="'kr1-' + i" :x="(i - 1) * 40 + 2" y="0" width="36" height="18" rx="3" fill="#4b5563"
              stroke="#6b7280" stroke-width="0.75" opacity="0.7" />
          </g>

          <!-- Row 2: Home row -->
          <g transform="translate(40, 58)">
            <rect v-for="i in 12" :key="'kr2-' + i" :x="(i - 1) * 40 + 8" y="0" width="36" height="18" rx="3" fill="#4b5563"
              stroke="#6b7280" stroke-width="0.75" opacity="0.7" />
          </g>

          <!-- Row 3: Space bar row -->
          <g transform="translate(40, 80)">
            <!-- Ctrl -->
            <rect x="16" y="0" width="56" height="18" rx="3" fill="#4b5563" stroke="#6b7280" stroke-width="0.75"
              opacity="0.7" />
            <!-- Alt -->
            <rect x="80" y="0" width="36" height="18" rx="3" fill="#4b5563" stroke="#6b7280" stroke-width="0.75"
              opacity="0.7" />
            <!-- Spacebar (active key - hidden when cross-section keycap is pressed) -->
            <rect v-if="!keyPressed" x="124" y="0" width="190" height="18" rx="3" fill="#4b5563" stroke="#6b7280"
              stroke-width="0.75" />
            <!-- Alt -->
            <rect x="322" y="0" width="36" height="18" rx="3" fill="#4b5563" stroke="#6b7280" stroke-width="0.75"
              opacity="0.7" />
            <!-- Ctrl -->
            <rect x="366" y="0" width="36" height="18" rx="3" fill="#4b5563" stroke="#6b7280" stroke-width="0.75"
              opacity="0.7" />
            <!-- Fn -->
            <rect x="410" y="0" width="36" height="18" rx="3" fill="#4b5563" stroke="#6b7280" stroke-width="0.75"
              opacity="0.7" />
          </g>

          <!-- ===== CUTAWAY / CROSS-SECTION ===== -->
          <line x1="20" y1="105" x2="580" y2="105" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="6,4" />

          <!-- ===== THE SPACEBAR CROSS-SECTION (zoomed detail) ===== -->
          <!-- Aligned to background spacebar: x=164, y=80, width=190 in keyboard-local coords -->
          <g transform="translate(164, 80)">

            <!-- 1. Switch housing (drawn first = behind everything) -->
            <g transform="translate(83, 12)">
              <!-- Housing shell -->
              <rect x="0" y="0" width="24" height="80" fill="#2d3748" stroke="#4b5563" stroke-width="1" rx="2" />

              <!-- Spring (inside housing, below where stem reaches) -->
              <path :d="keyPressed
                ? 'M12,30 Q3,34 12,38 Q21,42 12,46 Q3,50 12,54 Q21,58 12,62'
                : 'M12,18 Q3,24 12,30 Q21,36 12,42 Q3,48 12,54 Q21,60 12,66'" fill="none" stroke="#9ca3af"
                stroke-width="2" style="transition: d 0.15s ease-out" />

              <!-- Contact leaves (near bottom of housing) -->
              <g transform="translate(0, 64)">
                <!-- Left contact (fixed) -->
                <rect x="2" y="0" width="8" height="4" rx="1" fill="#fbbf24" />
                <!-- Right contact (moves when pressed) -->
                <rect x="14" y="0" width="8" height="4" rx="1" fill="#fbbf24"
                  :style="{ transform: keyPressed ? 'translateX(-5px)' : 'translateX(0)', transition: 'transform 0.15s ease-out' }" />

                <!-- Spark when contacts close -->
                <g v-if="isStageActive('switch')">
                  <circle cx="12" cy="2" r="4" fill="#fbbf24" opacity="0.6"
                    :filter="isCurrentStage('switch') ? 'url(#glow)' : ''">
                    <animate v-if="isCurrentStage('switch')" attributeName="r" values="3;6;3" dur="0.3s"
                      repeatCount="indefinite" />
                  </circle>
                </g>
              </g>
            </g>

            <!-- 2. Stem (moves with keycap, drawn over housing but under keycap) -->
            <g transform="translate(83, 12)">
              <rect x="6" y="2" width="12" height="16" rx="1.5" :fill="isStageActive('press') ? '#3b82f6' : '#6b7280'"
                :style="{ transform: keyPressed ? 'translateY(12px)' : 'translateY(0)', transition: 'transform 0.15s ease-out' }" />
            </g>

            <!-- 3. Keycap (drawn last = on top of everything, matches background spacebar size) -->
            <g
              :style="{ transform: keyPressed ? 'translateY(12px)' : 'translateY(0)', transition: 'transform 0.15s ease-out' }">
              <rect x="0" y="0" width="190" height="18" rx="3"
                :fill="isStageActive('press') ? 'url(#keycapTopActive)' : 'url(#keycapTop)'"
                :stroke="isStageActive('press') ? '#93c5fd' : '#9ca3af'" stroke-width="1.5" />
              <text x="95" y="12" text-anchor="middle" :fill="isStageActive('press') ? '#dbeafe' : '#9ca3af'"
                font-size="8" font-weight="600" letter-spacing="0.1em">SPACE</text>
            </g>
          </g>

          <!-- PCB / Matrix Layer -->
          <rect x="45" y="172" width="510" height="55" rx="3" fill="#065f46" stroke="#059669" stroke-width="1.5" />

          <!-- Matrix grid lines -->
          <g opacity="0.5">
            <line v-for="i in 9" :key="'mh' + i" x1="50" :y1="175 + i * 5" x2="550" :y2="175 + i * 5" stroke="#34d399"
              stroke-width="0.5" />
            <line v-for="i in 25" :key="'mv' + i" :x1="55 + i * 20" y1="174" :x2="55 + i * 20" y2="225" stroke="#34d399"
              stroke-width="0.5" />
          </g>
          <text x="80" y="200" fill="#6ee7b7" font-size="8" font-weight="600">PCB / MATRIX</text>

          <!-- Matrix detection highlight -->
          <rect v-if="isStageActive('matrix')" x="240" y="175" width="30" height="28" rx="2" fill="#22c55e"
            opacity="0.5" :filter="isCurrentStage('matrix') ? 'url(#softGlow)' : ''">
            <animate v-if="isCurrentStage('matrix')" attributeName="opacity" values="0.3;0.7;0.3" dur="0.5s"
              repeatCount="indefinite" />
          </rect>

          <!-- Controller Chip (MCU) -->
          <g transform="translate(420, 182)">
            <rect x="0" y="0" width="55" height="35" rx="3" :fill="isStageActive('controller') ? '#1e40af' : '#1e293b'"
              stroke="#3b82f6" stroke-width="1.5" :filter="isCurrentStage('controller') ? 'url(#glow)' : ''" />
            <!-- Chip pins top -->
            <rect v-for="i in 6" :key="'cpt' + i" :x="4 + i * 7" y="-3" width="4" height="4" rx="0.5" fill="#94a3b8" />
            <!-- Chip pins bottom -->
            <rect v-for="i in 6" :key="'cpb' + i" :x="4 + i * 7" y="34" width="4" height="4" rx="0.5" fill="#94a3b8" />
            <!-- Chip label -->
            <text x="27" y="17" text-anchor="middle" fill="#60a5fa" font-size="9" font-weight="bold">MCU</text>
            <text x="27" y="29" text-anchor="middle" fill="#94a3b8" font-size="7">Controller</text>
          </g>

          <!-- USB port on keyboard (left side) -->
          <rect x="48" y="181" width="22" height="38" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1.5" />
          <rect x="52" y="187" width="14" height="26" rx="2" fill="#111827" />

          <line x1="59" y1="228" x2="59" y2="239" stroke="#64748b" stroke-width="0.75" />
          <text x="59" y="248" text-anchor="middle" fill="#64748b" font-size="8">USB</text>

          <!-- Signal Paths inside keyboard -->

          <!-- Path: Switch contacts down to Matrix -->
          <path d="M 259 162 L 259 191" fill="none" stroke="#374151" stroke-width="2" stroke-dasharray="4,3" />
          <path d="M 259 162 L 259 191" fill="none" stroke="#22c55e" stroke-width="3" :stroke-dasharray="29"
            :stroke-dashoffset="29 - (pathProgress['switch-to-matrix'] * 29)"
            style="transition: stroke-dashoffset 0.05s linear" />

          <!-- Path: Matrix to Controller -->
          <path d="M 259 191 L 420 191" fill="none" stroke="#374151" stroke-width="2" stroke-dasharray="4,3" />
          <path d="M 259 191 L 420 191" fill="none" stroke="#22c55e" stroke-width="3" :stroke-dasharray="161"
            :stroke-dashoffset="161 - (pathProgress['matrix-to-controller'] * 161)"
            style="transition: stroke-dashoffset 0.05s linear" />

          <!-- Debounce indicator -->
          <g v-if="isStageActive('debounce')" transform="translate(330, 182)">
            <rect x="0" y="0" width="48" height="18" rx="3" fill="#1e293b" stroke="#475569" stroke-width="1" />
            <text x="24" y="13" text-anchor="middle" fill="#94a3b8" font-size="9" font-family="monospace">
              {{ isCurrentStage('debounce') ? '~5ms' : '✓' }}
            </text>
          </g>

          <!-- Path: Controller to USB port (bottom of components) -->
          <path d="M 420 208 L 70 208" fill="none" stroke="#374151" stroke-width="2" stroke-dasharray="4,3" />
          <path d="M 420 208 L 70 208" fill="none" stroke="#3b82f6" stroke-width="3" :stroke-dasharray="350"
            :stroke-dashoffset="350 - (pathProgress['controller-to-usb'] * 350)"
            style="transition: stroke-dashoffset 0.05s linear" />
        </g>

        <!-- ==================== USB CABLE (drawn after keyboard so it overlaps) ==================== -->
        <g>
          <!-- Cable from keyboard USB port up to computer USB port -->
          <!-- Cable outer (shadow) -->
          <path d="M 108 520 C 80 520, 70 510, 70 460 C 70 380, 65 280, 80 220 C 95 170, 140 125, 159 125" fill="none"
            stroke="#111827" stroke-width="14" stroke-linecap="butt" />
          <!-- Cable body -->
          <path d="M 108 520 C 80 520, 70 510, 70 460 C 70 380, 65 280, 80 220 C 95 170, 140 125, 159 125" fill="none"
            stroke="#374151" stroke-width="9" stroke-linecap="butt" />
          <!-- Cable inner highlight -->
          <path d="M 108 520 C 80 520, 70 510, 70 460 C 70 380, 65 280, 80 220 C 95 170, 140 125, 159 125" fill="none"
            stroke="#4b5563" stroke-width="5" stroke-linecap="butt" />

          <!-- Animated data flow along cable -->
          <path d="M 108 520 C 80 520, 70 510, 70 460 C 70 380, 65 280, 80 220 C 95 170, 140 125, 159 125" fill="none"
            stroke="url(#pathGradient)" stroke-width="4" stroke-linecap="butt" :stroke-dasharray="600"
            :stroke-dashoffset="600 - (pathProgress['usb-cable'] * 600)"
            style="transition: stroke-dashoffset 0.02s linear" />

          <!-- USB cable label -->
          <g v-if="isStageActive('usb')">
            <rect x="48" y="270" width="48" height="20" rx="4" fill="#1e40af" stroke="#3b82f6" stroke-width="1" />
            <text x="72" y="284" text-anchor="middle" fill="#93c5fd" font-size="10" font-weight="bold">USB</text>
          </g>

          <!-- Data packet traveling along cable -->
          <g v-if="isStageActive('usb') && pathProgress['usb-cable'] > 0.1 && pathProgress['usb-cable'] < 0.85" :style="{
            opacity: 1,
            transition: 'transform 0.03s linear'
          }">
            <g :transform="`translate(${108 + (pathProgress['usb-cable'] < 0.5
                ? (70 - 108) * (pathProgress['usb-cable'] * 2)
                : (70 - 108) + (160 - 70) * ((pathProgress['usb-cable'] - 0.5) * 2))
              }, ${520 + (125 - 520) * pathProgress['usb-cable']
              })`">
              <rect x="-22" y="-10" width="44" height="20" rx="4" fill="#1e40af" stroke="#3b82f6" stroke-width="1.5" />
              <text x="0" y="5" text-anchor="middle" fill="#93c5fd" font-size="9" font-family="monospace"
                font-weight="bold">0x2C</text>
            </g>
          </g>
        </g>

        <!-- Current Stage Label -->
        <g v-if="activeStage && !isComplete" transform="translate(620, 425)">
          <rect x="-55" y="-14" width="110" height="28" rx="14" fill="#1e40af" stroke="#3b82f6" stroke-width="1.5" />
          <text x="0" y="5" text-anchor="middle" fill="#fff" font-size="11" font-weight="bold">
            {{stages.find(s => s.id === activeStage)?.label}}
          </text>
        </g>

        <!-- Success Badge -->
        <g v-if="isComplete" transform="translate(620, 425)">
          <circle cx="0" cy="0" r="26" fill="#22c55e" opacity="0.2">
            <animate attributeName="r" values="22;30;22" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="0" cy="0" r="20" fill="#22c55e" />
          <path d="M -7 0 L -2 5 L 8 -6" fill="none" stroke="white" stroke-width="3.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </g>
      </svg>
    </div>

    <!-- Progress Cards Grid -->
    <div class="grid grid-cols-4 gap-2">
      <div v-for="(stage, index) in stages" :key="stage.id" class="p-3 rounded-lg border-2 transition-all duration-300"
        :class="{
          'bg-primary-50 border-primary-400 shadow-md': currentStage === index,
          'bg-green-50 border-green-300': currentStage > index,
          'bg-gray-50 border-gray-200 opacity-50': currentStage < index
        }">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-lg">{{ stage.icon }}</span>
          <span class="text-sm font-semibold" :class="{
            'text-primary-700': currentStage === index,
            'text-green-700': currentStage > index,
            'text-gray-400': currentStage < index
          }">
            {{ stage.label }}
          </span>
        </div>
        <p v-if="currentStage >= index" class="text-xs leading-relaxed" :class="{
          'text-primary-600': currentStage === index,
          'text-green-600': currentStage > index
        }">
          {{ stage.description }}
        </p>
      </div>
    </div>

    <!-- Completion message -->
    <div v-if="isComplete"
      class="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl text-center">
      <p class="text-green-800 font-semibold text-lg">Keystroke delivered!</p>
      <p class="text-green-600 text-sm mt-1">Total journey: approximately 5-25ms in real keyboards</p>
    </div>
  </div>
</template>
