<template>
  <el-config-provider :z-index="2700">
    <AssistantWorkspace v-if="standalone" ref="workspace" :active="true" :standalone="true" />

    <Teleport v-else to="body">
      <div :class="['chat-ai-portal', { 'is-open': panelOpen, 'is-expanded': expanded }]">
        <Transition name="launcher-pop">
          <button
            v-if="!panelOpen"
            ref="launcher"
            class="assistant-launcher"
            type="button"
            :aria-label="t('ChatAIName')"
            aria-haspopup="dialog"
            :title="t('ChatAIName')"
            @click="open"
          >
            <span class="assistant-launcher__icon">
              <img :src="assistantIcon" alt="" />
            </span>
            <span class="assistant-launcher__label">
              <strong>{{ t('ChatAIName') }}</strong>
              <small>{{ t('ChatAIReady') }}</small>
            </span>
          </button>
        </Transition>

        <Transition name="panel-slide">
          <section
            v-show="panelOpen"
            class="assistant-panel"
            :aria-label="t('ChatAIName')"
            role="dialog"
          >
            <AssistantWorkspace
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
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'

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
const workspace = ref(null)
const launcher = ref(null)
const panelOpen = ref(props.defaultShowPanel)
const expanded = ref(localStorage.getItem('chat_ai_expanded') === 'true')
const initialized = ref(false)
const standalone = computed(() => props.drawerPanelVisible)
const assistantIcon = getAssetUrl('img/ai-assistant.svg')

async function initWorkspace() {
  if (initialized.value) return
  initialized.value = true
  await nextTick()
  await workspace.value?.init()
}

async function open() {
  panelOpen.value = true
  await initWorkspace()
  await nextTick()
  workspace.value?.focus()
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

onMounted(async () => {
  window.addEventListener('message', handleWindowMessage)
  if (standalone.value || panelOpen.value) await initWorkspace()
})

onBeforeUnmount(() => {
  window.removeEventListener('message', handleWindowMessage)
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

.assistant-launcher {
  position: fixed;
  right: 18px;
  bottom: calc(116px + env(safe-area-inset-bottom, 0px));
  display: flex;
  height: 54px;
  align-items: center;
  gap: 8px;
  padding: 5px 13px 5px 5px;
  border: 1px solid var(--ai-border);
  border-radius: 12px;
  color: var(--ai-text);
  background: #fff;
  box-shadow: 0 8px 24px rgb(24 43 38 / 16%);
  cursor: pointer;
  pointer-events: auto;
  isolation: isolate;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    border-color: var(--ai-primary);
    box-shadow: 0 12px 30px rgb(24 43 38 / 20%);
    transform: translateY(-2px);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary-light-8, #d1efe8);
    outline-offset: 3px;
  }

  &__icon {
    display: grid;
    width: 42px;
    height: 42px;
    flex: 0 0 42px;
    place-items: center;
    overflow: hidden;
    border-radius: 9px;

    img {
      display: block;
      width: 42px;
      height: 42px;
    }
  }

  &__label {
    display: flex;
    min-width: 86px;
    flex-direction: column;
    align-items: flex-start;
    gap: 2px;
    text-align: left;

    strong {
      font-size: 13px;
      font-weight: 600;
    }

    small {
      color: var(--ai-text-secondary);
      font-size: 10px;
      white-space: nowrap;
    }
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
    right: 12px;
    bottom: calc(82px + env(safe-area-inset-bottom, 0px));
    width: 50px;
    height: 50px;
    padding: 5px;
    border-radius: 12px;

    &__icon,
    &__icon img {
      width: 38px;
      height: 38px;
    }

    &__label {
      display: none;
    }
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
  .assistant-panel {
    transition: none;
    animation: none;
  }
}
</style>
