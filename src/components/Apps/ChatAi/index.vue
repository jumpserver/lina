<template>
  <el-config-provider :z-index="2700">
    <iframe
      v-if="standalone && iframeMode"
      ref="iframe"
      class="iframe-assistant__frame iframe-assistant__frame--standalone"
      :src="iframeSource"
      :key="`${iframeSandbox}:${iframeSource}`"
      :sandbox="iframeSandbox"
      :title="t('ChatAIIframeMethod')"
      referrerpolicy="no-referrer"
    />

    <AssistantWorkspace
      v-else-if="standalone"
      ref="workspace"
      :active="componentActive"
      :compact="compactViewport"
      :standalone="true"
    />

    <Teleport v-else to="body">
      <div
        :class="[
          'chat-ai-portal',
          {
            'is-open': panelOpen,
            'is-launcher-dragging': launcherDragging,
            'is-expanded': expanded,
            'is-window-moving': panelMoving,
            'is-window-resizing': panelResizing,
            'is-viewport-resizing': viewportResizing,
            'is-keyboard-adjusting': panelKeyboardAdjusting,
            'is-panel-transitioning': panelTransitioning
          }
        ]"
        :style="launcherStyle"
      >
        <Transition name="launcher-pop">
          <div v-if="!panelOpen && !launcherHidden" class="assistant-launcher-wrap">
            <button
              class="assistant-launcher__hide"
              type="button"
              :aria-label="t('ChatAIHideLauncher')"
              :title="t('ChatAIHideLauncher')"
              @click.stop="hideLauncher"
            >
              <el-icon><Close /></el-icon>
            </button>
            <button
              ref="launcher"
              class="assistant-launcher"
              type="button"
              :aria-label="t('ChatAIName')"
              aria-haspopup="dialog"
              aria-keyshortcuts="ArrowUp ArrowDown"
              :title="t('ChatAIName')"
              @click="handleLauncherClick"
              @pointerdown="startLauncherDrag"
              @keydown="handleLauncherKeyboardMove"
            >
              <img :src="assistantIcon" alt="" draggable="false" />
            </button>
          </div>

          <button
            v-else-if="!panelOpen"
            ref="launcherRestore"
            class="assistant-launcher-restore"
            type="button"
            :aria-label="t('ChatAIShowLauncher')"
            :title="t('ChatAIShowLauncher')"
            @click="showLauncher"
          >
            <span class="assistant-launcher-restore__surface">
              <img :src="assistantIcon" alt="" draggable="false" />
            </span>
          </button>
        </Transition>

        <Transition
          name="panel-slide"
          @after-enter="finishPanelVisibilityTransition"
          @after-leave="finishPanelVisibilityTransition"
          @before-enter="startPanelVisibilityTransition"
          @before-leave="startPanelVisibilityTransition"
          @enter-cancelled="finishPanelVisibilityTransition"
          @leave-cancelled="finishPanelVisibilityTransition"
        >
          <section
            v-show="panelOpen"
            ref="panelElement"
            class="assistant-panel"
            :style="panelStyle"
            :aria-label="t('ChatAIName')"
            :aria-modal="modalPanel ? 'true' : undefined"
            role="dialog"
            tabindex="-1"
            @transitioncancel.self="finishPanelTransition"
            @transitionend.self="finishPanelTransition"
          >
            <ElFocusTrap
              :focus-trap-el="panelElement"
              :loop="focusTrapActive"
              :trapped="focusTrapActive"
              focus-start-el="container"
              @focus-after-released="handleFocusAfterReleased"
            >
              <div v-if="iframeMode" class="iframe-assistant">
                <header
                  class="iframe-assistant__header"
                  :aria-keyshortcuts="
                    !mobileViewport && !expanded ? WINDOW_ADJUST_SHORTCUTS : undefined
                  "
                  :aria-label="
                    !mobileViewport && !expanded ? t('ChatAIWindowAdjustHint') : undefined
                  "
                  :tabindex="!mobileViewport && !expanded ? 0 : undefined"
                  :title="!mobileViewport && !expanded ? t('ChatAIWindowAdjustHint') : undefined"
                  @dblclick="handleIframeHeaderDoubleClick"
                  @keydown="handleIframeHeaderKeyDown"
                  @pointerdown="handleIframeHeaderPointerDown"
                >
                  <div class="iframe-assistant__brand">
                    <AssistantMark size="small" />
                    <span class="iframe-assistant__brand-copy">
                      <strong>{{ t('ChatAIName') }}</strong>
                      <small>{{ t('ChatAIIframeMethod') }}</small>
                    </span>
                  </div>
                  <div class="iframe-assistant__actions">
                    <button
                      v-if="!mobileViewport"
                      :aria-label="t('RestoreDefault')"
                      :disabled="panelTransitioning || panelVisibilityTransitioning"
                      :title="t('RestoreDefault')"
                      type="button"
                      @click="resetPanelRect"
                    >
                      <el-icon><RefreshLeft /></el-icon>
                    </button>
                    <button
                      v-if="!mobileViewport"
                      :aria-label="expanded ? t('ChatAICompress') : t('ChatAIExpand')"
                      :disabled="panelTransitioning || panelVisibilityTransitioning"
                      :title="expanded ? t('ChatAICompress') : t('ChatAIExpand')"
                      type="button"
                      @click="setExpanded(!expanded)"
                    >
                      <el-icon>
                        <component :is="expanded ? ScaleToOriginal : FullScreen" />
                      </el-icon>
                    </button>
                    <button
                      :aria-label="t('Close')"
                      :title="t('Close')"
                      type="button"
                      @click="close"
                    >
                      <el-icon><Close /></el-icon>
                    </button>
                  </div>
                </header>
                <iframe
                  ref="iframe"
                  class="iframe-assistant__frame"
                  :src="iframeSource"
                  :key="`${iframeSandbox}:${iframeSource}`"
                  :sandbox="iframeSandbox"
                  :title="t('ChatAIIframeMethod')"
                  loading="lazy"
                  referrerpolicy="no-referrer"
                />
              </div>
              <AssistantWorkspace
                v-else
                ref="workspace"
                :active="componentActive && panelOpen"
                :compact="panelCompact"
                :expanded="expanded"
                :window-transitioning="panelTransitioning || panelVisibilityTransitioning"
                :windowed="!mobileViewport"
                @close="close"
                @compress="setExpanded(false)"
                @expand="setExpanded(true)"
                @reset-window="resetPanelRect"
                @window-drag-start="startPanelMove"
                @window-keyboard-adjust="handlePanelKeyboardAdjust"
              />
              <span
                v-for="direction in RESIZE_DIRECTIONS"
                v-show="
                  !expanded &&
                  !mobileViewport &&
                  !panelTransitioning &&
                  !panelVisibilityTransitioning
                "
                :key="direction"
                :class="['assistant-resize-handle', `is-${direction}`]"
                aria-hidden="true"
                @pointerdown.stop.prevent="startPanelResize($event, direction)"
              />
            </ElFocusTrap>
          </section>
        </Transition>
      </div>
    </Teleport>
  </el-config-provider>
</template>

<script setup>
import {
  computed,
  nextTick,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch
} from 'vue'
import { Close, FullScreen, RefreshLeft, ScaleToOriginal } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import ElFocusTrap from 'element-plus/es/components/focus-trap/index.mjs'

import { getAssetUrl } from '@/utils/assets'
import AssistantWorkspace from './AssistantWorkspace.vue'
import AssistantMark from './components/AssistantMark.vue'

const EXPANDED_KEY = 'chat_ai_expanded'
const LAUNCHER_HIDDEN_KEY = 'chat_ai_launcher_hidden'
const LAUNCHER_Y_KEY = 'chat_ai_launcher_y'
const LAUNCHER_SIZE = 48
const LAUNCHER_GAP = 16
const LAUNCHER_DRAG_THRESHOLD = 5
const PANEL_RECT_KEY = 'chat_ai_panel_rect'
const PANEL_GAP = 16
const PANEL_DEFAULT_WIDTH = 520
const PANEL_DEFAULT_HEIGHT = 780
const PANEL_MIN_WIDTH = 380
const PANEL_MIN_HEIGHT = 440
const PANEL_COMPACT_BREAKPOINT = 760
const MOBILE_BREAKPOINT = 620
const WINDOW_ADJUST_SHORTCUTS =
  'ArrowUp ArrowDown ArrowLeft ArrowRight Shift+ArrowUp Shift+ArrowDown Shift+ArrowLeft Shift+ArrowRight'
const RESIZE_DIRECTIONS = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw']
const RESIZE_CURSORS = {
  n: 'ns-resize',
  ne: 'nesw-resize',
  e: 'ew-resize',
  se: 'nwse-resize',
  s: 'ns-resize',
  sw: 'nesw-resize',
  w: 'ew-resize',
  nw: 'nwse-resize'
}

const props = defineProps({
  defaultShowPanel: {
    type: Boolean,
    default: false
  },
  drawerPanelVisible: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const store = useStore()
const workspace = ref(null)
const iframe = ref(null)
const launcher = ref(null)
const launcherRestore = ref(null)
const panelElement = ref(null)
const panelOpen = ref(props.defaultShowPanel)
const expanded = ref(readStorage(EXPANDED_KEY) === 'true')
const launcherHidden = ref(readStorage(LAUNCHER_HIDDEN_KEY) === 'true')
const launcherY = ref(readLauncherY())
const launcherDragging = ref(false)
const panelRect = ref(null)
const panelMoving = ref(false)
const panelResizing = ref(false)
const viewportResizing = ref(false)
const panelKeyboardAdjusting = ref(false)
const panelTransitioning = ref(false)
const panelVisibilityTransitioning = ref(false)
const initialViewport = getViewportMetrics()
const viewportLeft = ref(initialViewport.left)
const viewportTop = ref(initialViewport.top)
const viewportWidth = ref(initialViewport.width)
const viewportHeight = ref(initialViewport.height)
const layoutViewportWidth = ref(window.innerWidth)
const initialized = ref(false)
const componentActive = ref(true)
const standalone = computed(() => props.drawerPanelVisible)
const iframeMode = computed(() => {
  const method = String(store.getters.publicSettings?.CHAT_AI_METHOD || '').toLowerCase()
  return ['embed', 'iframe'].includes(method)
})
const iframeUrl = computed(() => {
  const rawUrl = String(store.getters.publicSettings?.CHAT_AI_EMBED_URL || '').trim()
  if (!iframeMode.value || !rawUrl) return null
  try {
    const url = new URL(rawUrl)
    return ['http:', 'https:'].includes(url.protocol) ? url : null
  } catch {
    return null
  }
})
const iframeSource = computed(() => iframeUrl.value?.href || 'about:blank')
const iframeSandbox = computed(() => {
  const permissions = ['allow-forms', 'allow-scripts']
  if (iframeUrl.value && iframeUrl.value.origin !== window.location.origin) {
    permissions.push('allow-same-origin')
  }
  return permissions.join(' ')
})
const mobileViewport = computed(() => layoutViewportWidth.value <= MOBILE_BREAKPOINT)
const modalPanel = computed(() => expanded.value || mobileViewport.value)
const focusTrapActive = computed(() => {
  return componentActive.value && panelOpen.value && modalPanel.value && !standalone.value
})
const compactViewport = computed(() => layoutViewportWidth.value <= PANEL_COMPACT_BREAKPOINT)
const launcherStyle = computed(() => {
  const min = viewportTop.value + LAUNCHER_GAP
  const max = viewportTop.value + viewportHeight.value - LAUNCHER_SIZE - LAUNCHER_GAP
  const defaultY =
    viewportTop.value + viewportHeight.value - LAUNCHER_SIZE - (mobileViewport.value ? 82 : 116)
  const preferred = Number.isFinite(launcherY.value)
    ? `${viewportTop.value + launcherY.value}px`
    : `calc(${defaultY}px - env(safe-area-inset-bottom, 0px))`
  return {
    '--launcher-top': `clamp(calc(${min}px + env(safe-area-inset-top, 0px)), ${preferred}, calc(${max}px - env(safe-area-inset-bottom, 0px)))`
  }
})
const renderedPanelRect = computed(() => {
  return panelRect.value ? clampPanelRect(panelRect.value) : null
})
const panelStyle = computed(() => {
  if (expanded.value || mobileViewport.value) {
    return {
      left: `${viewportLeft.value}px`,
      top: `${viewportTop.value}px`,
      width: `${viewportWidth.value}px`,
      height: `${viewportHeight.value}px`,
      right: 'auto',
      bottom: 'auto'
    }
  }
  if (!renderedPanelRect.value) return undefined
  return {
    left: `${renderedPanelRect.value.x}px`,
    top: `${renderedPanelRect.value.y}px`,
    width: `${renderedPanelRect.value.width}px`,
    height: `${renderedPanelRect.value.height}px`,
    right: 'auto',
    bottom: 'auto'
  }
})
const panelCompact = computed(() => {
  if (standalone.value) return false
  const width =
    expanded.value || mobileViewport.value
      ? layoutViewportWidth.value
      : renderedPanelRect.value?.width || PANEL_DEFAULT_WIDTH
  return width <= PANEL_COMPACT_BREAKPOINT
})
const assistantIcon = getAssetUrl('img/robot-assistant.png')
const launcherInteraction = {
  pointerId: null,
  captureTarget: null,
  startX: 0,
  startY: 0,
  startTop: 0
}
let suppressLauncherClick = false
const panelInteraction = {
  type: '',
  direction: '',
  pointerId: null,
  captureTarget: null,
  startX: 0,
  startY: 0,
  startRect: null,
  originalRect: null,
  moved: false
}
let windowListenersAttached = false
let viewportResizeFrame
let viewportResizeTimer
let panelKeyboardAdjustTimer
let panelTransitionTimer
let documentInteractionStyle
let backgroundInertState

function getViewportMetrics() {
  const visualViewport = window.visualViewport
  return {
    left: visualViewport?.offsetLeft || 0,
    top: visualViewport?.offsetTop || 0,
    width: visualViewport?.width || window.innerWidth,
    height: visualViewport?.height || window.innerHeight
  }
}

function readStorage(key) {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return null
  }
}

function writeStorage(key, value) {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    // The assistant still works when browser storage is unavailable.
  }
}

function removeStorage(key) {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // The assistant still works when browser storage is unavailable.
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function readLauncherY() {
  try {
    const saved = JSON.parse(readStorage(LAUNCHER_Y_KEY))
    return Number.isFinite(saved) ? saved : null
  } catch {
    return null
  }
}

function clampLauncherY(y) {
  return clamp(y, LAUNCHER_GAP, viewportHeight.value - LAUNCHER_SIZE - LAUNCHER_GAP)
}

function startLauncherDrag(event) {
  if (
    event.button !== 0 ||
    !event.isPrimary ||
    panelOpen.value ||
    launcherHidden.value ||
    launcherInteraction.pointerId !== null
  ) {
    return
  }
  suppressLauncherClick = false
  launcherInteraction.pointerId = event.pointerId
  launcherInteraction.captureTarget = event.currentTarget
  launcherInteraction.startX = event.clientX
  launcherInteraction.startY = event.clientY
  launcherInteraction.startTop =
    event.currentTarget.parentElement.getBoundingClientRect().top - viewportTop.value
  event.currentTarget.setPointerCapture(event.pointerId)
  event.currentTarget.addEventListener('lostpointercapture', finishLauncherDrag)
  window.addEventListener('pointermove', handleLauncherPointerMove, { passive: false })
  window.addEventListener('pointerup', finishLauncherDrag)
  window.addEventListener('pointercancel', finishLauncherDrag)
  window.addEventListener('blur', finishLauncherDrag)
}

function handleLauncherPointerMove(event) {
  if (event.pointerId !== launcherInteraction.pointerId) return
  const deltaX = event.clientX - launcherInteraction.startX
  const deltaY = event.clientY - launcherInteraction.startY
  if (!launcherDragging.value && Math.hypot(deltaX, deltaY) <= LAUNCHER_DRAG_THRESHOLD) {
    return
  }
  launcherDragging.value = true
  suppressLauncherClick = true
  lockDocumentInteraction('ns-resize')
  launcherY.value = clampLauncherY(launcherInteraction.startTop + deltaY)
  event.preventDefault()
}

function finishLauncherDrag(event) {
  const { pointerId, captureTarget } = launcherInteraction
  if (pointerId === null || (Number.isFinite(event?.pointerId) && event.pointerId !== pointerId)) {
    return
  }
  if (event?.type === 'pointerup') handleLauncherPointerMove(event)
  window.removeEventListener('pointermove', handleLauncherPointerMove)
  window.removeEventListener('pointerup', finishLauncherDrag)
  window.removeEventListener('pointercancel', finishLauncherDrag)
  window.removeEventListener('blur', finishLauncherDrag)
  captureTarget.removeEventListener('lostpointercapture', finishLauncherDrag)
  launcherInteraction.pointerId = null
  launcherInteraction.captureTarget = null
  if (captureTarget.hasPointerCapture(pointerId)) captureTarget.releasePointerCapture(pointerId)
  if (launcherDragging.value) writeStorage(LAUNCHER_Y_KEY, String(launcherY.value))
  launcherDragging.value = false
  unlockDocumentInteraction()
}

function handleLauncherClick(event) {
  const wasDragging = suppressLauncherClick
  suppressLauncherClick = false
  if (wasDragging && event.detail !== 0) {
    event.preventDefault()
    return
  }
  open()
}

function handleLauncherKeyboardMove(event) {
  if (
    !['ArrowUp', 'ArrowDown'].includes(event.key) ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    launcherInteraction.pointerId !== null
  ) {
    return
  }
  event.preventDefault()
  const currentY = launcher.value.parentElement.getBoundingClientRect().top - viewportTop.value
  const step = event.shiftKey ? 40 : 16
  launcherY.value = clampLauncherY(currentY + (event.key === 'ArrowUp' ? -step : step))
  writeStorage(LAUNCHER_Y_KEY, String(launcherY.value))
}

function getDefaultPanelRect() {
  const maxWidth = Math.max(1, viewportWidth.value - PANEL_GAP * 2)
  const maxHeight = Math.max(1, viewportHeight.value - PANEL_GAP * 2)
  const width = Math.min(PANEL_DEFAULT_WIDTH, maxWidth)
  const height = Math.min(PANEL_DEFAULT_HEIGHT, maxHeight)
  return {
    x: viewportLeft.value + viewportWidth.value - width - PANEL_GAP,
    y: viewportTop.value + viewportHeight.value - height - PANEL_GAP,
    width,
    height
  }
}

function clampPanelRect(rect) {
  const fallback = getDefaultPanelRect()
  const maxWidth = Math.max(1, viewportWidth.value - PANEL_GAP * 2)
  const maxHeight = Math.max(1, viewportHeight.value - PANEL_GAP * 2)
  const minWidth = Math.min(PANEL_MIN_WIDTH, maxWidth)
  const minHeight = Math.min(PANEL_MIN_HEIGHT, maxHeight)
  const width = clamp(
    Number.isFinite(rect?.width) ? rect.width : fallback.width,
    minWidth,
    maxWidth
  )
  const height = clamp(
    Number.isFinite(rect?.height) ? rect.height : fallback.height,
    minHeight,
    maxHeight
  )
  const x = clamp(
    Number.isFinite(rect?.x) ? rect.x : fallback.x,
    viewportLeft.value + PANEL_GAP,
    viewportLeft.value + viewportWidth.value - width - PANEL_GAP
  )
  const y = clamp(
    Number.isFinite(rect?.y) ? rect.y : fallback.y,
    viewportTop.value + PANEL_GAP,
    viewportTop.value + viewportHeight.value - height - PANEL_GAP
  )
  return { x, y, width, height }
}

function panelRectsEqual(first, second) {
  if (!first || !second) return false
  return ['x', 'y', 'width', 'height'].every((key) => Math.abs(first[key] - second[key]) < 0.5)
}

function initPanelRect() {
  let rect
  try {
    const saved = JSON.parse(readStorage(PANEL_RECT_KEY))
    if (
      Number.isFinite(saved?.x) &&
      Number.isFinite(saved?.y) &&
      Number.isFinite(saved?.width) &&
      Number.isFinite(saved?.height)
    ) {
      rect = saved
    }
  } catch {
    // Ignore invalid saved geometry and fall back to the default window.
  }
  panelRect.value = rect || getDefaultPanelRect()
}

function savePanelRect() {
  if (!panelRect.value) return
  writeStorage(PANEL_RECT_KEY, JSON.stringify(panelRect.value))
}

function lockDocumentInteraction(cursor) {
  if (documentInteractionStyle) return
  const root = document.documentElement
  documentInteractionStyle = {
    cursor: root.style.cursor,
    userSelect: root.style.userSelect
  }
  root.style.cursor = cursor
  root.style.userSelect = 'none'
}

function unlockDocumentInteraction() {
  if (!documentInteractionStyle) return
  const root = document.documentElement
  root.style.cursor = documentInteractionStyle.cursor
  root.style.userSelect = documentInteractionStyle.userSelect
  documentInteractionStyle = undefined
}

function startPanelInteraction(event, type, direction = '') {
  if (
    event.button !== 0 ||
    expanded.value ||
    mobileViewport.value ||
    panelTransitioning.value ||
    panelVisibilityTransitioning.value ||
    panelInteraction.pointerId !== null
  ) {
    return
  }
  if (!panelRect.value) initPanelRect()
  finishPanelKeyboardAdjustment()
  const currentRect = renderedPanelRect.value || getDefaultPanelRect()
  panelInteraction.type = type
  panelInteraction.direction = direction
  panelInteraction.pointerId = event.pointerId
  panelInteraction.captureTarget = event.currentTarget || event.target
  panelInteraction.startX = event.clientX
  panelInteraction.startY = event.clientY
  panelInteraction.startRect = { ...currentRect }
  panelInteraction.originalRect = { ...(panelRect.value || currentRect) }
  panelInteraction.moved = false
  panelMoving.value = type === 'move'
  panelResizing.value = type === 'resize'
  panelInteraction.captureTarget?.setPointerCapture?.(event.pointerId)
  panelInteraction.captureTarget?.addEventListener?.('lostpointercapture', finishPanelInteraction)
  window.addEventListener('pointermove', handlePanelPointerMove)
  window.addEventListener('pointerup', finishPanelInteraction)
  window.addEventListener('pointercancel', finishPanelInteraction)
  window.addEventListener('blur', finishPanelInteraction)
  lockDocumentInteraction(type === 'move' ? 'grabbing' : RESIZE_CURSORS[direction])
  event.preventDefault()
}

function startPanelMove(event) {
  startPanelInteraction(event, 'move')
}

function isIframeHeaderControl(target) {
  return Boolean(
    target?.closest?.(
      'button, a, input, textarea, select, [role="button"], [contenteditable="true"]'
    )
  )
}

function handleIframeHeaderPointerDown(event) {
  if (
    expanded.value ||
    mobileViewport.value ||
    panelTransitioning.value ||
    panelVisibilityTransitioning.value ||
    event.button !== 0 ||
    isIframeHeaderControl(event.target)
  ) {
    return
  }
  startPanelMove(event)
}

function handleIframeHeaderDoubleClick(event) {
  if (
    mobileViewport.value ||
    panelTransitioning.value ||
    panelVisibilityTransitioning.value ||
    isIframeHeaderControl(event.target)
  ) {
    return
  }
  event.preventDefault()
  setExpanded(!expanded.value)
}

function handleIframeHeaderKeyDown(event) {
  if (
    event.target !== event.currentTarget ||
    expanded.value ||
    mobileViewport.value ||
    panelTransitioning.value ||
    panelVisibilityTransitioning.value ||
    event.altKey ||
    event.ctrlKey ||
    event.metaKey ||
    !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
  ) {
    return
  }
  event.preventDefault()
  handlePanelKeyboardAdjust({ key: event.key, resize: event.shiftKey })
}

function startPanelResize(event, direction) {
  startPanelInteraction(event, 'resize', direction)
}

function resizePanelRect(startRect, deltaX, deltaY, direction) {
  let left = startRect.x
  let top = startRect.y
  let right = startRect.x + startRect.width
  let bottom = startRect.y + startRect.height
  const viewportRight = viewportLeft.value + viewportWidth.value - PANEL_GAP
  const viewportBottom = viewportTop.value + viewportHeight.value - PANEL_GAP
  const minWidth = Math.min(PANEL_MIN_WIDTH, viewportWidth.value - PANEL_GAP * 2)
  const minHeight = Math.min(PANEL_MIN_HEIGHT, viewportHeight.value - PANEL_GAP * 2)

  if (direction.includes('e')) {
    right = clamp(right + deltaX, left + minWidth, viewportRight)
  }
  if (direction.includes('s')) {
    bottom = clamp(bottom + deltaY, top + minHeight, viewportBottom)
  }
  if (direction.includes('w')) {
    left = clamp(left + deltaX, viewportLeft.value + PANEL_GAP, right - minWidth)
  }
  if (direction.includes('n')) {
    top = clamp(top + deltaY, viewportTop.value + PANEL_GAP, bottom - minHeight)
  }

  return clampPanelRect({
    x: left,
    y: top,
    width: right - left,
    height: bottom - top
  })
}

function handlePanelPointerMove(event) {
  if (event.pointerId !== panelInteraction.pointerId || !panelInteraction.startRect) return
  const deltaX = event.clientX - panelInteraction.startX
  const deltaY = event.clientY - panelInteraction.startY
  const movementThreshold = panelInteraction.type === 'move' ? 4 : 1
  if (!panelInteraction.moved && Math.hypot(deltaX, deltaY) < movementThreshold) return
  panelInteraction.moved = true
  if (panelInteraction.type === 'move') {
    panelRect.value = clampPanelRect({
      ...panelInteraction.startRect,
      x: panelInteraction.startRect.x + deltaX,
      y: panelInteraction.startRect.y + deltaY
    })
  } else {
    panelRect.value = resizePanelRect(
      panelInteraction.startRect,
      deltaX,
      deltaY,
      panelInteraction.direction
    )
  }
  event.preventDefault()
}

function finishPanelInteraction(event) {
  if (
    Number.isFinite(event?.pointerId) &&
    panelInteraction.pointerId !== null &&
    event.pointerId !== panelInteraction.pointerId
  ) {
    return
  }
  window.removeEventListener('pointermove', handlePanelPointerMove)
  window.removeEventListener('pointerup', finishPanelInteraction)
  window.removeEventListener('pointercancel', finishPanelInteraction)
  window.removeEventListener('blur', finishPanelInteraction)
  const captureTarget = panelInteraction.captureTarget
  const pointerId = panelInteraction.pointerId
  const startRect = panelInteraction.startRect
  const originalRect = panelInteraction.originalRect
  const finalRect = panelRect.value
  captureTarget?.removeEventListener?.('lostpointercapture', finishPanelInteraction)
  panelInteraction.type = ''
  panelInteraction.direction = ''
  panelInteraction.pointerId = null
  panelInteraction.captureTarget = null
  panelInteraction.startRect = null
  panelInteraction.originalRect = null
  if (Number.isFinite(pointerId) && captureTarget?.hasPointerCapture?.(pointerId)) {
    captureTarget.releasePointerCapture(pointerId)
  }
  const moved = panelInteraction.moved
  panelInteraction.moved = false
  panelMoving.value = false
  panelResizing.value = false
  unlockDocumentInteraction()
  const changed = moved && !panelRectsEqual(startRect, finalRect)
  if (!changed && originalRect) panelRect.value = originalRect
  if (changed) savePanelRect()
}

async function hideLauncher() {
  finishLauncherDrag()
  launcherHidden.value = true
  writeStorage(LAUNCHER_HIDDEN_KEY, 'true')
  await nextTick()
  launcherRestore.value?.focus()
}

async function showLauncher() {
  launcherHidden.value = false
  removeStorage(LAUNCHER_HIDDEN_KEY)
  await nextTick()
  launcher.value?.focus()
}

function handleViewportResize() {
  finishLauncherDrag()
  const wasMobile = mobileViewport.value
  const viewport = getViewportMetrics()
  viewportLeft.value = viewport.left
  viewportTop.value = viewport.top
  viewportWidth.value = viewport.width
  viewportHeight.value = viewport.height
  layoutViewportWidth.value = window.innerWidth
  if (standalone.value) return
  if (wasMobile !== mobileViewport.value) finishPanelTransition()
  if (wasMobile !== mobileViewport.value || panelMoving.value || panelResizing.value) {
    finishPanelInteraction()
  }
  if (!mobileViewport.value) {
    if (!panelRect.value) initPanelRect()
  }
}

function scheduleViewportResize() {
  window.cancelAnimationFrame(viewportResizeFrame)
  window.clearTimeout(viewportResizeTimer)
  viewportResizing.value = true
  viewportResizeTimer = window.setTimeout(() => {
    viewportResizing.value = false
  }, 120)
  viewportResizeFrame = window.requestAnimationFrame(handleViewportResize)
}

function resetPanelRect() {
  if (panelVisibilityTransitioning.value) return
  finishPanelInteraction()
  finishPanelKeyboardAdjustment()
  if (expanded.value) setExpanded(false)
  else startPanelTransition()
  panelRect.value = getDefaultPanelRect()
  savePanelRect()
}

function startPanelTransition() {
  window.clearTimeout(panelTransitionTimer)
  panelTransitioning.value =
    panelOpen.value &&
    !mobileViewport.value &&
    !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (!panelTransitioning.value) return
  panelTransitionTimer = window.setTimeout(finishPanelTransition, 340)
}

function finishPanelTransition(event) {
  if (event && event.target !== event.currentTarget) return
  if (
    event &&
    !['width', 'height', 'left', 'top', 'right', 'bottom'].includes(event.propertyName)
  ) {
    return
  }
  window.clearTimeout(panelTransitionTimer)
  panelTransitioning.value = false
}

function startPanelVisibilityTransition() {
  panelVisibilityTransitioning.value = true
}

function finishPanelVisibilityTransition() {
  panelVisibilityTransitioning.value = false
}

function handleFocusAfterReleased(event) {
  if (componentActive.value && panelOpen.value && !standalone.value) event.preventDefault()
}

function startPanelKeyboardAdjustment() {
  window.clearTimeout(panelKeyboardAdjustTimer)
  panelKeyboardAdjusting.value = true
  panelKeyboardAdjustTimer = window.setTimeout(finishPanelKeyboardAdjustment, 120)
}

function finishPanelKeyboardAdjustment() {
  window.clearTimeout(panelKeyboardAdjustTimer)
  panelKeyboardAdjusting.value = false
}

function handlePanelKeyboardAdjust({ key, resize }) {
  if (
    expanded.value ||
    mobileViewport.value ||
    panelTransitioning.value ||
    panelVisibilityTransitioning.value
  ) {
    return
  }
  if (!panelRect.value) initPanelRect()
  const currentRect = renderedPanelRect.value || getDefaultPanelRect()
  const step = 16
  let nextRect
  if (resize) {
    const deltaX = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0
    const deltaY = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0
    nextRect = resizePanelRect(currentRect, deltaX, deltaY, 'se')
  } else {
    const deltaX = key === 'ArrowLeft' ? -step : key === 'ArrowRight' ? step : 0
    const deltaY = key === 'ArrowUp' ? -step : key === 'ArrowDown' ? step : 0
    nextRect = clampPanelRect({
      ...currentRect,
      x: currentRect.x + deltaX,
      y: currentRect.y + deltaY
    })
  }
  if (panelRectsEqual(currentRect, nextRect)) return
  startPanelKeyboardAdjustment()
  panelRect.value = nextRect
  savePanelRect()
}

function syncBackgroundInert() {
  const shouldBeInert =
    componentActive.value && panelOpen.value && modalPanel.value && !standalone.value
  if (shouldBeInert && !backgroundInertState) {
    const element = document.getElementById('app')
    if (!element) return
    backgroundInertState = { element, inert: element.inert }
    element.inert = true
    return
  }
  if (!shouldBeInert && backgroundInertState) {
    backgroundInertState.element.inert = backgroundInertState.inert
    backgroundInertState = undefined
  }
}

async function initWorkspace() {
  if (iframeMode.value || initialized.value) return
  initialized.value = true
  await nextTick()
  if (iframeMode.value || !workspace.value) {
    initialized.value = false
    return
  }
  await workspace.value?.init()
}

function focusActiveContent() {
  if (iframeMode.value) iframe.value?.focus()
  else workspace.value?.focus()
}

async function open() {
  finishLauncherDrag()
  if (!standalone.value && !mobileViewport.value && !panelRect.value) initPanelRect()
  panelOpen.value = true
  if (!iframeMode.value) await initWorkspace()
  await nextTick()
  focusActiveContent()
}

async function close() {
  finishPanelInteraction()
  finishPanelKeyboardAdjustment()
  finishPanelTransition()
  panelOpen.value = false
  await nextTick()
  const returnTarget = launcher.value || launcherRestore.value
  returnTarget?.focus()
}

function setExpanded(value) {
  if (expanded.value === value || panelVisibilityTransitioning.value) return
  finishPanelInteraction()
  finishPanelKeyboardAdjustment()
  startPanelTransition()
  expanded.value = value
  writeStorage(EXPANDED_KEY, String(value))
  if (!value && !mobileViewport.value) {
    if (!panelRect.value) initPanelRect()
  }
}

async function handleWindowMessage(event) {
  if (
    !componentActive.value ||
    event.data !== 'show-chat-panel' ||
    event.origin !== window.location.origin ||
    standalone.value ||
    event.source === iframe.value?.contentWindow
  ) {
    return
  }
  await open()
}

watch(iframeMode, async (enabled) => {
  initialized.value = false
  if (!standalone.value && panelOpen.value) await close()
  if (!enabled && standalone.value && componentActive.value) await initWorkspace()
})

function attachWindowListeners() {
  if (windowListenersAttached) return
  window.addEventListener('message', handleWindowMessage)
  window.addEventListener('resize', scheduleViewportResize)
  window.visualViewport?.addEventListener('resize', scheduleViewportResize)
  window.visualViewport?.addEventListener('scroll', scheduleViewportResize)
  windowListenersAttached = true
}

function detachWindowListeners() {
  finishLauncherDrag()
  if (!windowListenersAttached) return
  window.removeEventListener('message', handleWindowMessage)
  window.removeEventListener('resize', scheduleViewportResize)
  window.visualViewport?.removeEventListener('resize', scheduleViewportResize)
  window.visualViewport?.removeEventListener('scroll', scheduleViewportResize)
  window.cancelAnimationFrame(viewportResizeFrame)
  window.clearTimeout(viewportResizeTimer)
  viewportResizing.value = false
  finishPanelKeyboardAdjustment()
  finishPanelTransition()
  finishPanelVisibilityTransition()
  windowListenersAttached = false
  finishPanelInteraction()
}

onMounted(async () => {
  attachWindowListeners()
  if (!standalone.value) {
    if (!mobileViewport.value) initPanelRect()
  }
  if (!iframeMode.value && (standalone.value || panelOpen.value)) await initWorkspace()
  syncBackgroundInert()
})

watch([componentActive, panelOpen, modalPanel, standalone], syncBackgroundInert, { flush: 'post' })

onActivated(async () => {
  componentActive.value = true
  attachWindowListeners()
  syncBackgroundInert()
  if (!iframeMode.value && (standalone.value || panelOpen.value)) await initWorkspace()
})

onDeactivated(() => {
  componentActive.value = false
  syncBackgroundInert()
  detachWindowListeners()
})

onBeforeUnmount(() => {
  componentActive.value = false
  detachWindowListeners()
  syncBackgroundInert()
})
</script>

<style lang="scss" scoped>
.chat-ai-portal {
  --ai-primary: var(--el-color-primary, #1ab394);
  --ai-primary-dark: var(--el-color-primary-dark-2, #148f76);
  --ai-border: var(--color-border, #e9ecef);
  --ai-text: var(--color-text-primary, #292827);
  --ai-text-secondary: var(--color-text-secondary, #7c7c7c);
  position: fixed;
  z-index: 2600;
  right: 0;
  bottom: 0;
  pointer-events: none;
}

.assistant-launcher-wrap {
  position: fixed;
  top: var(--launcher-top);
  right: 18px;
  width: 48px;
  height: 48px;
  pointer-events: auto;

  &:hover .assistant-launcher__hide,
  &:focus-within .assistant-launcher__hide {
    opacity: 1;
    pointer-events: auto;
    transform: scale(1);
  }
}

.assistant-launcher {
  display: grid;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 1px solid rgb(26 179 148 / 24%);
  border-radius: 50%;
  color: var(--ai-text);
  background: linear-gradient(145deg, #fff 10%, #e9f9f5 100%);
  box-shadow:
    0 8px 18px rgb(16 72 62 / 20%),
    inset 0 1px 0 rgb(255 255 255 / 95%),
    inset 0 -2px 3px rgb(20 143 118 / 10%);
  cursor: ns-resize;
  isolation: isolate;
  place-items: center;
  touch-action: none;
  user-select: none;
  transition:
    transform 0.16s ease,
    border-color 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    border-color: rgb(26 179 148 / 48%);
    box-shadow:
      0 11px 24px rgb(16 72 62 / 26%),
      inset 0 1px 0 #fff,
      inset 0 -2px 3px rgb(20 143 118 / 12%);
    transform: translateY(-2px);
  }

  &:active {
    box-shadow:
      0 4px 10px rgb(16 72 62 / 18%),
      inset 0 2px 4px rgb(20 143 118 / 14%);
    transform: translateY(1px);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-8, #d1efe8);
    outline-offset: 3px;
  }

  img {
    display: block;
    width: 30px;
    height: auto;
    filter: drop-shadow(0 2px 2px rgb(16 72 62 / 20%));
    pointer-events: none;
  }

  &__hide {
    position: absolute;
    z-index: 2;
    top: 3px;
    right: 3px;
    display: grid;
    width: 16px;
    height: 16px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    opacity: 0;
    color: var(--ai-text-secondary);
    background: rgb(255 255 255 / 96%);
    box-shadow: 0 1px 5px rgb(24 43 38 / 20%);
    cursor: pointer;
    pointer-events: none;
    place-items: center;
    transform: scale(0.82);
    transition:
      opacity 0.15s ease,
      color 0.15s ease,
      background 0.15s ease,
      transform 0.15s ease;

    &:hover,
    &:focus-visible {
      opacity: 1;
      color: var(--ai-primary-dark);
      outline: none;
      transform: scale(1);
    }

    .el-icon {
      width: 10px;
      height: 10px;
      font-size: 10px;
    }

    &:hover .el-icon,
    &:focus-visible .el-icon {
      color: var(--ai-primary-dark);
    }

    &:focus-visible .el-icon {
      outline: 2px solid var(--el-color-primary-light-7, #a3dfd1);
      outline-offset: 2px;
    }
  }
}

.assistant-launcher-restore {
  position: fixed;
  z-index: 1;
  top: calc(var(--launcher-top) - 1px);
  right: 0;
  display: block;
  width: 48px;
  height: 48px;
  padding: 0;
  border: 0;
  background: transparent;
  cursor: pointer;
  pointer-events: auto;

  &__surface {
    position: absolute;
    top: 0;
    right: 0;
    display: flex;
    width: 16px;
    height: 48px;
    align-items: center;
    overflow: hidden;
    box-sizing: border-box;
    padding: 3px;
    border: 1px solid var(--ai-border);
    border-right: 0;
    border-radius: 10px 0 0 10px;
    background: #fff;
    box-shadow: 0 5px 16px rgb(24 43 38 / 16%);
    justify-content: flex-start;
    transition:
      width 0.18s ease,
      border-color 0.18s ease,
      box-shadow 0.18s ease;

    img {
      width: 26px;
      height: auto;
      flex: 0 0 26px;
      border-radius: 50%;
    }
  }

  &:hover &__surface,
  &:focus-visible &__surface {
    width: 46px;
    border-color: var(--ai-primary);
    box-shadow: 0 8px 22px rgb(24 43 38 / 22%);
  }

  &:focus-visible {
    outline: none;
  }

  &:focus-visible &__surface {
    outline: 2px solid var(--el-color-primary-light-7, #a3dfd1);
    outline-offset: -2px;
  }
}

.is-launcher-dragging {
  .assistant-launcher {
    transform: none;
    transition: none;
  }

  .assistant-launcher__hide {
    opacity: 0;
    pointer-events: none;
  }
}

.assistant-panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: min(520px, calc(100vw - 32px));
  height: min(780px, calc(100dvh - 32px));
  overflow: hidden;
  box-sizing: border-box;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 20px 56px rgb(23 43 38 / 22%);
  pointer-events: auto;
  transition:
    width 0.28s ease,
    height 0.28s ease,
    left 0.28s ease,
    top 0.28s ease,
    right 0.28s ease,
    bottom 0.28s ease,
    border-radius 0.28s ease;
}

.iframe-assistant {
  --ai-header-height: 52px;

  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--ai-text);
  background: #fff;
  flex-direction: column;

  &__header {
    position: relative;
    z-index: 20;
    display: flex;
    height: var(--ai-header-height);
    min-height: var(--ai-header-height);
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 0 12px;
    border-bottom: 1px solid var(--ai-border);
    background: #fff;
    cursor: grab;
    touch-action: none;
    user-select: none;

    &:focus-visible {
      outline: 2px solid rgb(26 179 148 / 42%);
      outline-offset: -2px;
    }
  }

  &__brand,
  &__actions {
    display: flex;
    align-items: center;
  }

  &__brand {
    min-width: 0;
    gap: 8px;
  }

  &__brand-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 2px;

    strong {
      overflow: hidden;
      color: var(--ai-text);
      font-size: 14px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: var(--ai-text-secondary);
      font-size: 11px;
    }
  }

  &__actions {
    flex: 0 0 auto;
    gap: 4px;

    button {
      display: grid;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 1px solid transparent;
      border-radius: 8px;
      color: var(--ai-text-secondary);
      background: transparent;
      cursor: pointer;
      font-size: 16px;
      place-items: center;
      transition: all 0.18s ease;

      &:hover:not(:disabled) {
        border-color: var(--el-color-primary-light-8, #d1efe8);
        color: var(--ai-primary-dark);
        background: var(--el-color-primary-light-9, #e8f7f3);
      }

      &:focus-visible {
        outline: 2px solid rgb(26 179 148 / 42%);
        outline-offset: 2px;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.45;
      }
    }
  }

  &__frame {
    display: block;
    width: 100%;
    min-height: 0;
    flex: 1;
    border: 0;
    background: #fff;
  }

  &__frame--standalone {
    height: 100%;
  }
}

.is-expanded .assistant-panel {
  width: 100vw;
  height: 100dvh;
  max-width: none;
  max-height: none;
  inset: 0;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-radius: 0;
}

.is-window-moving .assistant-panel,
.is-window-resizing .assistant-panel,
.is-viewport-resizing .assistant-panel,
.is-keyboard-adjusting .assistant-panel {
  transition: none;
}

.is-window-moving .assistant-panel :deep(.assistant-header) {
  cursor: grabbing;
}

.is-window-moving .assistant-panel .iframe-assistant__header {
  cursor: grabbing;
}

.is-panel-transitioning .assistant-panel :deep(.assistant-header) {
  cursor: default;
}

.is-expanded .assistant-panel .iframe-assistant__header,
.is-panel-transitioning .assistant-panel .iframe-assistant__header {
  cursor: default;
}

.assistant-resize-handle {
  position: absolute;
  z-index: 40;
  display: block;
  touch-action: none;

  &.is-n,
  &.is-s {
    right: 12px;
    left: 12px;
    height: 6px;
    cursor: ns-resize;
  }

  &.is-n {
    top: 0;
  }

  &.is-s {
    bottom: 0;
  }

  &.is-e,
  &.is-w {
    top: 12px;
    bottom: 12px;
    width: 6px;
    cursor: ew-resize;
  }

  &.is-e {
    right: 0;
  }

  &.is-w {
    left: 0;
  }

  &.is-ne,
  &.is-nw,
  &.is-se,
  &.is-sw {
    width: 12px;
    height: 12px;
  }

  &.is-ne {
    top: 0;
    right: 0;
    cursor: nesw-resize;
  }

  &.is-nw {
    top: 0;
    left: 0;
    cursor: nwse-resize;
  }

  &.is-se {
    right: 0;
    bottom: 0;
    cursor: nwse-resize;

    &::after {
      position: absolute;
      right: 3px;
      bottom: 3px;
      width: 5px;
      height: 5px;
      border-right: 1px solid rgb(7 58 49 / 32%);
      border-bottom: 1px solid rgb(7 58 49 / 32%);
      content: '';
    }
  }

  &.is-sw {
    bottom: 0;
    left: 0;
    cursor: nesw-resize;
  }
}

.launcher-pop-enter-active,
.launcher-pop-leave-active,
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.28s cubic-bezier(0.22, 1, 0.36, 1);
}

.launcher-pop-enter-from,
.launcher-pop-leave-to {
  opacity: 0;
  transform: translateY(12px) scale(0.88);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  opacity: 0;
  transform: translateX(36px) scale(0.97);
}

@media (max-width: 620px) {
  .assistant-launcher {
    width: 48px;
    height: 48px;

    img {
      width: 30px;
      height: auto;
    }
  }

  .assistant-launcher-wrap {
    right: 12px;
  }

  .assistant-panel,
  .is-expanded .assistant-panel {
    width: 100vw;
    height: 100dvh;
    max-width: none;
    max-height: none;
    inset: 0;
    border: 0;
    border-radius: 0;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .iframe-assistant__header {
    cursor: default;
  }
}

@media (pointer: coarse) {
  .assistant-launcher__hide {
    opacity: 0.72;
    pointer-events: auto;
    transform: scale(1);
  }

  .assistant-resize-handle {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .assistant-launcher,
  .assistant-launcher-restore,
  .assistant-panel {
    transition: none;
    animation: none;
  }
}
</style>
