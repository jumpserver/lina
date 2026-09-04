<template>
  <el-config-provider :z-index="2700">
    <AssistantWorkspace
      v-if="standalone"
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
            'is-expanded': expanded,
            'is-window-moving': panelMoving,
            'is-window-resizing': panelResizing,
            'is-viewport-resizing': viewportResizing,
            'is-keyboard-adjusting': panelKeyboardAdjusting,
            'is-panel-transitioning': panelTransitioning
          }
        ]"
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
              <el-icon><ArrowRightBold /></el-icon>
            </button>
            <button
              ref="launcher"
              class="assistant-launcher"
              type="button"
              :aria-label="t('ChatAIName')"
              aria-haspopup="dialog"
              :title="t('ChatAIName')"
              @click="open"
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
              <AssistantWorkspace
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
import { useI18n } from 'vue-i18n'
import { ArrowRightBold } from '@element-plus/icons-vue'
import ElFocusTrap from 'element-plus/es/components/focus-trap/index.mjs'

import { getAssetUrl } from '@/utils/assets'
import AssistantWorkspace from './AssistantWorkspace.vue'

const EXPANDED_KEY = 'chat_ai_expanded'
const LAUNCHER_HIDDEN_KEY = 'chat_ai_launcher_hidden'
const PANEL_RECT_KEY = 'chat_ai_panel_rect'
const PANEL_GAP = 16
const PANEL_DEFAULT_WIDTH = 520
const PANEL_DEFAULT_HEIGHT = 780
const PANEL_MIN_WIDTH = 380
const PANEL_MIN_HEIGHT = 440
const PANEL_COMPACT_BREAKPOINT = 760
const MOBILE_BREAKPOINT = 620
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
const workspace = ref(null)
const launcher = ref(null)
const launcherRestore = ref(null)
const panelElement = ref(null)
const panelOpen = ref(props.defaultShowPanel)
const expanded = ref(readStorage(EXPANDED_KEY) === 'true')
const launcherHidden = ref(readStorage(LAUNCHER_HIDDEN_KEY) === 'true')
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
const mobileViewport = computed(() => layoutViewportWidth.value <= MOBILE_BREAKPOINT)
const modalPanel = computed(() => expanded.value || mobileViewport.value)
const focusTrapActive = computed(() => {
  return componentActive.value && panelOpen.value && modalPanel.value && !standalone.value
})
const compactViewport = computed(() => layoutViewportWidth.value <= PANEL_COMPACT_BREAKPOINT)
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
const assistantIcon = getAssetUrl('img/ai-assistant.svg')
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
  if (initialized.value) return
  initialized.value = true
  await nextTick()
  await workspace.value?.init()
}

async function open() {
  if (!standalone.value && !mobileViewport.value && !panelRect.value) initPanelRect()
  panelOpen.value = true
  await initWorkspace()
  await nextTick()
  workspace.value?.focus()
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
  if (!componentActive.value || event.data !== 'show-chat-panel' || standalone.value) return
  await open()
}

function attachWindowListeners() {
  if (windowListenersAttached) return
  window.addEventListener('message', handleWindowMessage)
  window.addEventListener('resize', scheduleViewportResize)
  window.visualViewport?.addEventListener('resize', scheduleViewportResize)
  window.visualViewport?.addEventListener('scroll', scheduleViewportResize)
  windowListenersAttached = true
}

function detachWindowListeners() {
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
  if (standalone.value || panelOpen.value) await initWorkspace()
  syncBackgroundInert()
})

watch([componentActive, panelOpen, modalPanel, standalone], syncBackgroundInert, { flush: 'post' })

onActivated(() => {
  componentActive.value = true
  attachWindowListeners()
  syncBackgroundInert()
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
  right: 18px;
  bottom: calc(116px + env(safe-area-inset-bottom, 0px));
  width: 44px;
  height: 44px;
  pointer-events: auto;

  &:hover .assistant-launcher__hide,
  &:focus-within .assistant-launcher__hide {
    opacity: 1;
    pointer-events: auto;
    transform: translateX(0);
  }
}

.assistant-launcher {
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  color: var(--ai-text);
  background: transparent;
  cursor: pointer;
  filter: drop-shadow(0 4px 10px rgb(16 72 62 / 18%));
  isolation: isolate;
  place-items: center;
  touch-action: manipulation;
  transition:
    transform 0.16s ease,
    filter 0.16s ease;

  &:hover {
    filter: drop-shadow(0 6px 13px rgb(16 72 62 / 24%));
    transform: translateY(-1px);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-8, #d1efe8);
    outline-offset: 3px;
  }

  img {
    display: block;
    width: 44px;
    height: 44px;
    pointer-events: none;
  }

  &__hide {
    position: absolute;
    z-index: 1;
    top: 0;
    left: -36px;
    display: grid;
    width: 36px;
    height: 44px;
    padding: 0;
    border: 0;
    opacity: 0;
    color: var(--ai-text-secondary);
    background: transparent;
    cursor: pointer;
    pointer-events: none;
    place-items: center;
    transform: translateX(4px);
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
      transform: translateX(0);
    }

    .el-icon {
      width: 24px;
      height: 24px;
      border-radius: 7px;
      background: rgb(255 255 255 / 94%);
      box-shadow: 0 2px 8px rgb(24 43 38 / 11%);
      font-size: 11px;
      transition: background 0.15s ease;
    }

    &:hover .el-icon,
    &:focus-visible .el-icon {
      background: var(--el-color-primary-light-9, #e8f7f3);
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
  right: 0;
  bottom: calc(115px + env(safe-area-inset-bottom, 0px));
  display: block;
  width: 46px;
  height: 46px;
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
    height: 46px;
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
      width: 38px;
      height: 38px;
      flex: 0 0 38px;
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

.is-panel-transitioning .assistant-panel :deep(.assistant-header) {
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
    width: 44px;
    height: 44px;

    img {
      width: 44px;
      height: 44px;
    }
  }

  .assistant-launcher-wrap {
    right: 12px;
    bottom: calc(82px + env(safe-area-inset-bottom, 0px));
  }

  .assistant-launcher-restore {
    bottom: calc(81px + env(safe-area-inset-bottom, 0px));
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
}

@media (pointer: coarse) {
  .assistant-launcher__hide {
    left: -44px;
    width: 44px;
    opacity: 0.72;
    pointer-events: auto;
    transform: translateX(0);
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
