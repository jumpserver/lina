<template>
  <el-config-provider :z-index="2700">
    <iframe
      v-if="standalone && iframeMode"
      ref="iframe"
      class="iframe-assistant__frame iframe-assistant__frame--standalone"
      :src="iframeSource"
      :title="t('ChatAIIframeMethod')"
      referrerpolicy="no-referrer"
      sandbox="allow-forms allow-scripts"
    />

    <AssistantWorkspace v-else-if="standalone" ref="workspace" :active="true" :standalone="true" />

    <Teleport v-else to="body">
      <div :class="['chat-ai-portal', { 'is-open': panelOpen, 'is-expanded': expanded }]">
        <Transition name="launcher-pop">
          <div
            v-if="!panelOpen && !launcherHidden"
            :class="['assistant-launcher-wrap', { 'is-dragging': launcherDragging }]"
            :style="launcherStyle"
          >
            <button
              ref="launcher"
              class="assistant-launcher"
              type="button"
              :aria-label="t('ChatAIName')"
              aria-haspopup="dialog"
              :title="t('ChatAIName')"
              @click="handleLauncherClick"
              @pointerdown="startLauncherDrag"
            >
              <img :src="assistantIcon" alt="" draggable="false" />
            </button>
            <button
              class="assistant-launcher__hide"
              type="button"
              :aria-label="t('ChatAIHideLauncher')"
              :title="t('ChatAIHideLauncher')"
              @click.stop="hideLauncher"
              @pointerdown.stop
            >
              <el-icon><Close /></el-icon>
            </button>
          </div>

          <button
            v-else-if="!panelOpen"
            :class="['assistant-launcher-restore', `is-${launcherSide}`]"
            :style="restoreStyle"
            type="button"
            :aria-label="t('ChatAIShowLauncher')"
            :title="t('ChatAIShowLauncher')"
            @click="showLauncher"
          >
            <img :src="assistantIcon" alt="" />
          </button>
        </Transition>

        <Transition name="panel-slide">
          <section
            v-show="panelOpen"
            class="assistant-panel"
            :aria-label="t('ChatAIName')"
            role="dialog"
          >
            <div v-if="iframeMode" class="iframe-assistant">
              <header class="iframe-assistant__header">
                <div class="iframe-assistant__brand">
                  <img :src="assistantIcon" alt="" />
                  <span>
                    <strong>{{ t('ChatAIName') }}</strong>
                    <small>{{ t('ChatAIIframeMethod') }}</small>
                  </span>
                </div>
                <div class="iframe-assistant__actions">
                  <button
                    :aria-label="expanded ? t('ChatAICompress') : t('ChatAIExpand')"
                    :title="expanded ? t('ChatAICompress') : t('ChatAIExpand')"
                    type="button"
                    @click="setExpanded(!expanded)"
                  >
                    <el-icon>
                      <component :is="expanded ? ScaleToOriginal : FullScreen" />
                    </el-icon>
                  </button>
                  <button :aria-label="t('Close')" :title="t('Close')" type="button" @click="close">
                    <el-icon><Close /></el-icon>
                  </button>
                </div>
              </header>
              <iframe
                ref="iframe"
                class="iframe-assistant__frame"
                :src="iframeSource"
                :title="t('ChatAIIframeMethod')"
                loading="lazy"
                referrerpolicy="no-referrer"
                sandbox="allow-forms allow-scripts"
              />
            </div>
            <AssistantWorkspace
              v-else
              ref="workspace"
              :active="panelOpen"
              :expanded="expanded"
              @close="close"
              @compress="setExpanded(false)"
              @expand="setExpanded(true)"
            />
          </section>
        </Transition>
      </div>
    </Teleport>
  </el-config-provider>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'
import { Close, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue'

import { getAssetUrl } from '@/utils/assets'
import AssistantWorkspace from './AssistantWorkspace.vue'

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
const launcher = ref(null)
const iframe = ref(null)
const panelOpen = ref(props.defaultShowPanel)
const expanded = ref(localStorage.getItem('chat_ai_expanded') === 'true')
const launcherHidden = ref(localStorage.getItem('chat_ai_launcher_hidden') === 'true')
const launcherDragging = ref(false)
const launcherPosition = ref(null)
const launcherSide = ref('right')
const initialized = ref(false)
const launcherStyle = computed(() => {
  if (!launcherPosition.value) return undefined
  return {
    left: `${launcherPosition.value.x}px`,
    top: `${launcherPosition.value.y}px`,
    right: 'auto',
    bottom: 'auto'
  }
})
const restoreStyle = computed(() => {
  const y = launcherPosition.value?.y ?? getDefaultLauncherPosition().y
  return { top: `${clamp(y, VIEWPORT_GAP, window.innerHeight - RESTORE_HEIGHT - VIEWPORT_GAP)}px` }
})
const standalone = computed(() => props.drawerPanelVisible)
const iframeMode = computed(() =>
  ['embed', 'iframe'].includes(store.getters.publicSettings?.CHAT_AI_METHOD)
)
const iframeSource = computed(() => {
  const rawUrl = String(store.getters.publicSettings?.CHAT_AI_EMBED_URL || '').trim()
  if (!iframeMode.value || !rawUrl) return 'about:blank'
  try {
    const url = new URL(rawUrl)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : 'about:blank'
  } catch {
    return 'about:blank'
  }
})
const assistantIcon = getAssetUrl('img/ai-assistant.svg')
const LAUNCHER_POSITION_KEY = 'chat_ai_launcher_position'
const LAUNCHER_HIDDEN_KEY = 'chat_ai_launcher_hidden'
const LAUNCHER_SIZE = 44
const RESTORE_HEIGHT = 46
const VIEWPORT_GAP = 12
const dragState = {
  startX: 0,
  startY: 0,
  originX: 0,
  originY: 0,
  moved: false
}
let ignoreLauncherClick = false
let ignoreLauncherClickTimer

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), Math.max(min, max))
}

function getDefaultLauncherPosition() {
  const mobile = window.innerWidth <= 620
  const right = mobile ? 12 : 18
  const bottom = mobile ? 82 : 116
  return {
    x: window.innerWidth - LAUNCHER_SIZE - right,
    y: window.innerHeight - LAUNCHER_SIZE - bottom
  }
}

function clampLauncherPosition(position) {
  return {
    x: clamp(position.x, VIEWPORT_GAP, window.innerWidth - LAUNCHER_SIZE - VIEWPORT_GAP),
    y: clamp(position.y, VIEWPORT_GAP, window.innerHeight - LAUNCHER_SIZE - VIEWPORT_GAP)
  }
}

function updateLauncherSide() {
  const center = (launcherPosition.value?.x || 0) + LAUNCHER_SIZE / 2
  launcherSide.value = center < window.innerWidth / 2 ? 'left' : 'right'
}

function saveLauncherPosition() {
  if (!launcherPosition.value) return
  localStorage.setItem(LAUNCHER_POSITION_KEY, JSON.stringify(launcherPosition.value))
}

function initLauncherPosition() {
  let position
  try {
    const saved = JSON.parse(localStorage.getItem(LAUNCHER_POSITION_KEY))
    if (Number.isFinite(saved?.x) && Number.isFinite(saved?.y)) position = saved
  } catch {
    // Ignore invalid saved positions and fall back to the default placement.
  }
  launcherPosition.value = clampLauncherPosition(position || getDefaultLauncherPosition())
  updateLauncherSide()
}

function startLauncherDrag(event) {
  if (event.button !== 0) return
  if (!launcherPosition.value) initLauncherPosition()
  dragState.startX = event.clientX
  dragState.startY = event.clientY
  dragState.originX = launcherPosition.value.x
  dragState.originY = launcherPosition.value.y
  dragState.moved = false
  event.currentTarget.setPointerCapture?.(event.pointerId)
  window.addEventListener('pointermove', moveLauncher)
  window.addEventListener('pointerup', stopLauncherDrag)
  window.addEventListener('pointercancel', stopLauncherDrag)
}

function moveLauncher(event) {
  const deltaX = event.clientX - dragState.startX
  const deltaY = event.clientY - dragState.startY
  if (!dragState.moved && Math.hypot(deltaX, deltaY) < 4) return
  dragState.moved = true
  launcherDragging.value = true
  launcherPosition.value = clampLauncherPosition({
    x: dragState.originX + deltaX,
    y: dragState.originY + deltaY
  })
  event.preventDefault()
}

function stopLauncherDrag() {
  window.removeEventListener('pointermove', moveLauncher)
  window.removeEventListener('pointerup', stopLauncherDrag)
  window.removeEventListener('pointercancel', stopLauncherDrag)
  launcherDragging.value = false
  const moved = dragState.moved
  dragState.moved = false
  if (!moved) return
  updateLauncherSide()
  saveLauncherPosition()
  ignoreLauncherClick = true
  clearTimeout(ignoreLauncherClickTimer)
  ignoreLauncherClickTimer = window.setTimeout(() => {
    ignoreLauncherClick = false
  })
}

async function handleLauncherClick() {
  if (ignoreLauncherClick) return
  await open()
}

function hideLauncher() {
  launcherHidden.value = true
  updateLauncherSide()
  localStorage.setItem(LAUNCHER_HIDDEN_KEY, 'true')
}

async function showLauncher() {
  launcherHidden.value = false
  localStorage.removeItem(LAUNCHER_HIDDEN_KEY)
  await nextTick()
  launcher.value?.focus()
}

function handleViewportResize() {
  if (!launcherPosition.value) return
  launcherPosition.value = clampLauncherPosition(launcherPosition.value)
  updateLauncherSide()
  saveLauncherPosition()
}

async function initWorkspace() {
  if (initialized.value) return
  initialized.value = true
  await nextTick()
  await workspace.value?.init()
}

async function open() {
  panelOpen.value = true
  if (!iframeMode.value) await initWorkspace()
  await nextTick()
  if (iframeMode.value) {
    iframe.value?.focus()
  } else {
    workspace.value?.focus()
  }
}

async function close() {
  panelOpen.value = false
  await nextTick()
  launcher.value?.focus()
}

function setExpanded(value) {
  expanded.value = value
  localStorage.setItem('chat_ai_expanded', String(value))
}

async function handleWindowMessage(event) {
  if (event.data !== 'show-chat-panel' || standalone.value) return
  await open()
}

watch(iframeMode, () => {
  panelOpen.value = false
  initialized.value = false
})

onMounted(async () => {
  window.addEventListener('message', handleWindowMessage)
  window.addEventListener('resize', handleViewportResize)
  if (!standalone.value) initLauncherPosition()
  if (!iframeMode.value && (standalone.value || panelOpen.value)) await initWorkspace()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleWindowMessage)
  window.removeEventListener('resize', handleViewportResize)
  stopLauncherDrag()
  clearTimeout(ignoreLauncherClickTimer)
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
    transform: scale(1);
  }

  &.is-dragging {
    cursor: grabbing;
    user-select: none;

    .assistant-launcher {
      cursor: grabbing;
      transform: scale(1.03);
    }
  }
}

.assistant-launcher {
  display: grid;
  width: 44px;
  height: 44px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  color: var(--ai-text);
  background: transparent;
  cursor: grab;
  isolation: isolate;
  place-items: center;
  touch-action: none;
  transition:
    transform 0.2s ease,
    filter 0.2s ease;

  &:hover {
    filter: drop-shadow(0 7px 8px rgb(24 43 38 / 18%));
    transform: translateY(-2px);
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
    top: -7px;
    right: -7px;
    display: grid;
    width: 20px;
    height: 20px;
    padding: 0;
    border: 1px solid var(--ai-border);
    border-radius: 50%;
    opacity: 0;
    color: var(--ai-text-secondary);
    background: #fff;
    box-shadow: 0 3px 9px rgb(24 43 38 / 18%);
    cursor: pointer;
    place-items: center;
    transform: scale(0.75);
    transition:
      opacity 0.15s ease,
      color 0.15s ease,
      transform 0.15s ease;

    &:hover,
    &:focus-visible {
      opacity: 1;
      color: var(--ai-primary-dark);
      outline: none;
      transform: scale(1);
    }

    .el-icon {
      font-size: 12px;
    }
  }
}

.assistant-launcher-restore {
  position: fixed;
  z-index: 1;
  top: 50%;
  display: flex;
  width: 16px;
  height: 46px;
  align-items: center;
  overflow: hidden;
  padding: 3px;
  border: 1px solid var(--ai-border);
  background: #fff;
  box-shadow: 0 5px 16px rgb(24 43 38 / 16%);
  cursor: pointer;
  pointer-events: auto;
  transition:
    width 0.18s ease,
    box-shadow 0.18s ease;

  img {
    width: 38px;
    height: 38px;
    flex: 0 0 38px;
    border-radius: 8px;
  }

  &.is-left {
    left: 0;
    justify-content: flex-end;
    border-left: 0;
    border-radius: 0 10px 10px 0;
  }

  &.is-right {
    right: 0;
    justify-content: flex-start;
    border-right: 0;
    border-radius: 10px 0 0 10px;
  }

  &:hover,
  &:focus-visible {
    width: 46px;
    border-color: var(--ai-primary);
    outline: none;
    box-shadow: 0 8px 22px rgb(24 43 38 / 22%);
  }
}

.assistant-panel {
  position: fixed;
  right: 16px;
  bottom: 16px;
  width: min(520px, calc(100vw - 24px));
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
    right 0.28s ease,
    bottom 0.28s ease,
    border-radius 0.28s ease;
}

.iframe-assistant {
  display: flex;
  height: 100%;
  min-height: 0;
  flex-direction: column;
  background: #fff;

  &__header {
    display: flex;
    min-height: 54px;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 0 14px;
    border-bottom: 1px solid var(--ai-border);
    background: linear-gradient(110deg, #fff 0%, #f4fbf8 100%);
  }

  &__brand {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 9px;

    img {
      width: 34px;
      height: 34px;
      border-radius: 8px;
    }

    span {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 1px;
    }

    strong {
      overflow: hidden;
      color: var(--ai-text);
      font-size: 13px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    small {
      color: var(--ai-text-secondary);
      font-size: 10px;
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    gap: 4px;

    button {
      display: inline-grid;
      width: 30px;
      height: 30px;
      padding: 0;
      border: 0;
      border-radius: 6px;
      color: var(--ai-text-secondary);
      background: transparent;
      cursor: pointer;
      place-items: center;

      &:hover {
        color: var(--ai-primary-dark);
        background: var(--el-color-primary-light-9, #edf8f5);
      }

      &:focus-visible {
        outline: 2px solid var(--el-color-primary-light-7, #a5dfd1);
        outline-offset: 1px;
      }
    }
  }

  &__frame {
    width: 100%;
    min-height: 0;
    flex: 1;
    border: 0;
    background: #fff;
  }

  &__frame--standalone {
    display: block;
    height: 100%;
  }
}

.is-expanded .assistant-panel {
  right: 0;
  bottom: 0;
  width: min(1080px, 100vw);
  height: 100dvh;
  padding-top: env(safe-area-inset-top, 0px);
  padding-bottom: env(safe-area-inset-bottom, 0px);
  border-radius: 0;
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

  .assistant-panel,
  .is-expanded .assistant-panel {
    right: 0;
    bottom: 0;
    width: 100vw;
    height: 100dvh;
    border: 0;
    border-radius: 0;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
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
