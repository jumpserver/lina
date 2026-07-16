<template>
  <section
    :class="[
      'assistant-workspace',
      {
        'is-standalone': standalone,
        'is-expanded': expanded,
        'is-compact': !standalone && !expanded
      }
    ]"
  >
    <header class="assistant-header">
      <div class="assistant-header__brand">
        <button
          class="header-icon history-toggle"
          :aria-label="t('History')"
          :title="t('History')"
          type="button"
          @click="historyOpen = !historyOpen"
        >
          <el-icon><Menu /></el-icon>
        </button>
        <AssistantMark :active="streaming" />
        <span class="brand-copy">
          <strong>{{ t('ChatAIName') }}</strong>
          <small>
            <i :class="{ 'is-busy': busy }" />
            {{ busy ? activityLabel : t('ChatAIReady') }}
          </small>
        </span>
      </div>

      <div class="assistant-header__actions">
        <button
          class="new-chat-button"
          :aria-label="t('NewChat')"
          :disabled="streaming || stopping"
          type="button"
          @click="handleNew"
        >
          <el-icon><EditPen /></el-icon>
          <span>{{ t('NewChat') }}</span>
        </button>
        <button
          v-if="!standalone"
          class="header-icon"
          :aria-label="expanded ? t('ChatAICompress') : t('ChatAIExpand')"
          :title="expanded ? t('ChatAICompress') : t('ChatAIExpand')"
          type="button"
          @click="emit(expanded ? 'compress' : 'expand')"
        >
          <el-icon><component :is="expanded ? ScaleToOriginal : FullScreen" /></el-icon>
        </button>
        <button
          v-if="!standalone"
          class="header-icon"
          :aria-label="t('Close')"
          :title="t('Close')"
          type="button"
          @click="emit('close')"
        >
          <el-icon><Close /></el-icon>
        </button>
      </div>
    </header>

    <div class="assistant-body">
      <div v-if="historyOpen" class="mobile-backdrop" @click="historyOpen = false" />
      <ConversationPanel
        :active-id="activeConversationId"
        :conversations="conversations"
        :loading="loadingConversations"
        :open="historyOpen"
        @close="historyOpen = false"
        @delete="handleDelete"
        @new="handleNew"
        @rename="handleRename"
        @select="selectConversation"
      />

      <main class="chat-stage">
        <div ref="scrollArea" class="chat-scroll" @scroll="handleScroll">
          <div v-if="loadingMessages" class="message-loading">
            <div v-for="item in 3" :key="item" class="message-loading__row">
              <span class="message-loading__avatar" />
              <span class="message-loading__lines"><i /><i /><i /></span>
            </div>
          </div>

          <div v-else-if="!visibleMessages.length" class="assistant-welcome">
            <div class="welcome-orb">
              <AssistantMark size="large" />
            </div>
            <span class="welcome-kicker">{{ t('ChatAIWorkspace') }}</span>
            <h1>{{ t('ChatAIWelcomeTitle') }}</h1>
            <p>{{ t('ChatAIWelcomeDescription') }}</p>
            <div class="suggestion-grid">
              <button
                v-for="suggestion in suggestions"
                :key="suggestion.text"
                type="button"
                @click="fillSuggestion(suggestion.text)"
              >
                <span :class="['suggestion-icon', `tone-${suggestion.tone}`]">
                  <el-icon><component :is="suggestion.icon" /></el-icon>
                </span>
                <span>
                  <strong>{{ suggestion.title }}</strong>
                  <small>{{ suggestion.text }}</small>
                </span>
                <el-icon class="suggestion-arrow"><ArrowRight /></el-icon>
              </button>
            </div>
          </div>

          <div v-else class="message-list">
            <ChatMessage
              v-for="item in visibleMessages"
              :key="item.id"
              :approval="approval"
              :approval-processing="approvalProcessing"
              :message="item"
              :trace="traces[item.id] || []"
              @cancel-approval="handleCancelApproval"
              @confirm-approval="handleConfirmApproval"
              @retry="retryLastMessage"
            />
          </div>
        </div>

        <footer class="composer-area">
          <div v-if="recoverableRun" class="recovery-banner">
            <span
              ><el-icon><Warning /></el-icon> {{ t('ChatAIRunRecovery') }}</span
            >
            <button type="button" @click="stopGeneration">{{ t('ChatAICancelTask') }}</button>
          </div>
          <ChatInput
            ref="composer"
            :busy="busy"
            :disabled="awaitingApproval || recoverableRun"
            :stopping="stopping"
            :transcribing="transcribing"
            :voice-transcription-mode="voiceTranscriptionMode"
            @audio="handleAudio"
            @error="handleMicrophoneError"
            @image-error="handleImageError"
            @send="sendMessage"
            @stop="stopGeneration"
          />
          <div class="composer-disclaimer">
            <el-icon><Lock /></el-icon>
            <span>{{ t('ChatAIDisclaimer') }}</span>
          </div>
        </footer>
      </main>
    </div>
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import {
  ArrowRight,
  Close,
  Coin,
  Connection,
  EditPen,
  FullScreen,
  Lock,
  Menu,
  Monitor,
  ScaleToOriginal,
  Warning
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'
import { useStore } from 'vuex'

import { message } from '@/utils/vue/message'
import AssistantMark from './components/AssistantMark.vue'
import ConversationPanel from './components/ConversationPanel.vue'
import ChatInput from './components/ChitChat/ChatInput.vue'
import ChatMessage from './components/ChitChat/ChatMessage.vue'
import { useChatAi } from './composables/useChatAi'

const props = defineProps({
  expanded: {
    type: Boolean,
    default: false
  },
  standalone: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'expand', 'compress'])
const { t } = useI18n()
const store = useStore()
const composer = ref(null)
const scrollArea = ref(null)
const historyOpen = ref(false)
const stickToBottom = ref(true)
const voiceTranscriptionMode = computed(() => {
  return store.getters.publicSettings?.CHAT_AI_VOICE_TRANSCRIPTION_MODE === 'server'
    ? 'server'
    : 'browser'
})

const {
  conversations,
  activeConversationId,
  visibleMessages,
  traces,
  approval,
  loadingConversations,
  loadingMessages,
  streaming,
  stopping,
  approvalProcessing,
  transcribing,
  awaitingApproval,
  recoverableRun,
  busy,
  initialize,
  selectConversation: selectConversationState,
  newConversation,
  removeConversation,
  renameConversation,
  sendMessage: sendMessageState,
  stopGeneration,
  confirmApproval,
  rejectApproval,
  transcribe,
  retryLastMessage
} = useChatAi({ onError: handleRequestError })

const activityLabel = computed(() => {
  if (stopping.value) return t('ChatAIStopping')
  if (transcribing.value) return t('ChatAITranscribing')
  if (approvalProcessing.value) return t('ChatAIExecuting')
  if (awaitingApproval.value) return t('ChatAIWaitingApproval')
  return t('ChatAIWorking')
})

const suggestions = computed(() => [
  {
    icon: Monitor,
    tone: 'primary',
    title: t('ChatAISuggestionAssetsTitle'),
    text: t('ChatAISuggestionAssets')
  },
  {
    icon: Connection,
    tone: 'info',
    title: t('ChatAISuggestionNodesTitle'),
    text: t('ChatAISuggestionNodes')
  },
  {
    icon: Coin,
    tone: 'warning',
    title: t('ChatAISuggestionCreateTitle'),
    text: t('ChatAISuggestionCreate')
  }
])

function friendlyError(error) {
  const code = error?.code || error?.response?.data?.code
  if (code === 'CONVERSATION_BUSY') return t('ChatAIConversationBusy')
  if (code === 'MODEL_UNAVAILABLE') return t('ChatAIModelUnavailable')
  if (code === 'MODEL_TIMEOUT') return t('ChatAIModelTimeout')
  if (code === 'audio_too_long') return t('ChatAIAudioTooLong')
  if (code === 'audio_file_too_large') return t('ChatAIAudioTooLarge')
  if (code === 'transcription_busy') return t('ChatAITranscriptionBusy')
  return error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
}

function handleRequestError(error) {
  if (error?.name === 'AbortError') return
  message.error(friendlyError(error))
}

async function init() {
  await initialize()
  await nextTick()
  scrollToBottom(false)
  composer.value?.focus()
}

function focus() {
  composer.value?.focus()
}

async function selectConversation(id) {
  const selected = await selectConversationState(id)
  if (!selected) message.warning(t('ChatAIFinishCurrentTask'))
  await nextTick()
  scrollToBottom(false)
}

function handleNew() {
  if (!newConversation()) {
    message.warning(t('ChatAIFinishCurrentTask'))
    return
  }
  historyOpen.value = false
  nextTick(() => composer.value?.focus())
}

async function handleDelete(conversation) {
  try {
    await ElMessageBox.confirm(
      t('ChatAIDeleteConversationDescription', {
        title: conversation.title || t('ChatAIUntitledConversation')
      }),
      t('ChatAIDeleteConversation'),
      {
        confirmButtonText: t('Delete'),
        cancelButtonText: t('Cancel'),
        type: 'warning',
        modalClass: 'chat-ai-message-box-overlay'
      }
    )
    await removeConversation(conversation.id)
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    handleRequestError(error)
  }
}

async function handleRename(conversation, title) {
  try {
    await renameConversation(conversation.id, title)
  } catch (error) {
    handleRequestError(error)
  }
}

async function sendMessage(content, images) {
  stickToBottom.value = true
  await sendMessageState(content, images)
  await nextTick()
  stickToBottom.value = true
  scrollToBottom(true, true)
}

function fillSuggestion(content) {
  composer.value?.setValue(content)
}

async function handleAudio(file) {
  try {
    const language = (navigator.language || '').split(/[-_]/)[0]
    const result = await transcribe(file, language)
    composer.value?.setValue(result.text || '')
    message.success(t('ChatAITranscriptionReady'))
  } catch {
    // The composable already surfaces a precise error.
  }
}

function handleMicrophoneError() {
  message.warning(t('ChatAIMicrophonePermission'))
}

function handleImageError(detail) {
  message.warning(detail)
}

async function handleConfirmApproval() {
  try {
    const result = await confirmApproval()
    if (result?.result?.ok) message.success(t('ChatAIExecutionSucceeded'))
    else message.warning(t('ChatAIExecutionIssue'))
  } catch {
    // The composable already surfaces a precise error.
  }
}

async function handleCancelApproval() {
  try {
    await rejectApproval()
    message.info(t('ChatAIExecutionCancelled'))
  } catch {
    // The composable already surfaces a precise error.
  }
}

function handleScroll() {
  const element = scrollArea.value
  if (!element) return
  stickToBottom.value = element.scrollHeight - element.scrollTop - element.clientHeight < 100
}

function scrollToBottom(smooth = true, force = false) {
  if (!force && !stickToBottom.value && smooth) return
  const element = scrollArea.value
  if (!element) return
  if (force || !smooth) {
    element.scrollTop = element.scrollHeight
    return
  }
  element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
}

function handleShortcut(event) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    handleNew()
  }
}

watch(
  () =>
    visibleMessages.value
      .map((item) => `${item.id}:${item.content.length}:${item.status}`)
      .join('|'),
  async () => {
    await nextTick()
    scrollToBottom(streaming.value)
  }
)

watch(
  () => props.expanded,
  async () => {
    await nextTick()
    scrollToBottom(false)
  }
)

onMounted(() => {
  window.addEventListener('keydown', handleShortcut)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleShortcut)
})

defineExpose({ init, focus, newConversation: handleNew })
</script>

<style lang="scss" scoped>
:global(.chat-ai-message-box-overlay) {
  z-index: 3000 !important;
}

.assistant-workspace {
  --ai-header-height: 56px;
  --ai-primary: var(--el-color-primary, #1ab394);
  --ai-primary-dark: var(--el-color-primary-dark-2, #148f76);
  --ai-primary-light: var(--el-color-primary-light-9, #e8f7f3);
  --ai-primary-light-2: var(--el-color-primary-light-8, #d1efe8);
  --ai-text: var(--color-text-primary, #292827);
  --ai-text-secondary: var(--color-text-secondary, #7c7c7c);
  --ai-border: var(--color-border, #e9ecef);
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--ai-text);
  background: #fff;
  font-family:
    'Open Sans',
    Inter,
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  flex-direction: column;
  user-select: text;
}

.assistant-workspace,
.assistant-workspace :deep(*) {
  box-sizing: border-box;
}

.assistant-header {
  position: relative;
  z-index: 20;
  display: flex;
  height: var(--ai-header-height);
  min-height: var(--ai-header-height);
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;
  border-bottom: 1px solid var(--ai-border);
  background: #fff;

  &__brand,
  &__actions {
    display: flex;
    align-items: center;
  }

  &__brand {
    min-width: 0;
    gap: 10px;
  }

  &__actions {
    gap: 7px;
  }
}

.brand-copy {
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
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--ai-text-secondary);
    font-size: 10px;

    i {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--ai-primary);

      &.is-busy {
        background: var(--ai-primary);
        animation: status-pulse 1.5s ease-in-out infinite;
      }
    }
  }
}

.header-icon {
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--ai-text-secondary);
  background: transparent;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    color: var(--ai-primary-dark);
    border-color: var(--ai-primary-light-2);
    background: var(--ai-primary-light);
  }
}

.new-chat-button {
  display: inline-flex;
  height: 33px;
  align-items: center;
  gap: 6px;
  padding: 0 11px;
  border: 1px solid var(--ai-primary);
  border-radius: 4px;
  color: #fff;
  background: var(--ai-primary);
  cursor: pointer;
  font-size: 10px;
  font-weight: 600;
  transition: all 0.18s ease;

  &:hover:not(:disabled) {
    border-color: var(--ai-primary-dark);
    background: var(--ai-primary-dark);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.5;
  }
}

.history-toggle {
  display: none;
}

.assistant-body {
  position: relative;
  display: flex;
  min-height: 0;
  flex: 1;
}

.chat-stage {
  position: relative;
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  background: #fff;
}

.chat-scroll {
  min-height: 0;
  flex: 1;
  overflow: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgb(86 92 122 / 17%) transparent;
}

.message-list {
  width: 100%;
  padding: 15px 0 20px;
}

.scroll-anchor {
  width: 1px;
  height: 1px;
}

.composer-area {
  position: relative;
  z-index: 10;
  padding: 9px 20px 10px;
  border-top: 1px solid var(--ai-border);
  background: #fff;
}

.composer-disclaimer {
  display: flex;
  min-height: 21px;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #8f959e;
  font-size: 10px;

  .el-icon {
    font-size: 10px;
  }
}

.recovery-banner {
  display: flex;
  width: min(100%, 780px);
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin: 0 auto 7px;
  padding: 6px 9px 6px 11px;
  border: 1px solid #f0d6aa;
  border-radius: 11px;
  color: #91652a;
  background: #fff8e9;
  font-size: 10px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  button {
    padding: 4px 8px;
    border: 1px solid #ead0a2;
    border-radius: 7px;
    color: #966426;
    background: #fff;
    cursor: pointer;
    font-size: 10px;
  }
}

.assistant-welcome {
  display: flex;
  width: min(760px, calc(100% - 38px));
  min-height: 100%;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 38px 0 26px;
  text-align: center;
  flex-direction: column;

  h1 {
    margin: 8px 0 7px;
    color: var(--ai-text);
    font-size: clamp(20px, 3vw, 29px);
    font-weight: 500;
    line-height: 1.25;
  }

  > p {
    max-width: 560px;
    margin: 0;
    color: var(--ai-text-secondary);
    font-size: 12px;
    line-height: 1.7;
  }
}

.welcome-orb {
  position: relative;
  display: grid;
  width: 72px;
  height: 72px;
  margin-bottom: 8px;
  place-items: center;
}

.welcome-kicker {
  padding: 4px 8px;
  border: 1px solid var(--ai-primary-light-2);
  border-radius: 10px;
  color: var(--ai-primary-dark);
  background: var(--ai-primary-light);
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.suggestion-grid {
  display: grid;
  width: 100%;
  margin-top: 25px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 9px;

  button {
    display: flex;
    min-width: 0;
    min-height: 76px;
    align-items: center;
    gap: 9px;
    padding: 11px;
    border: 1px solid var(--ai-border);
    border-radius: 4px;
    color: #606266;
    background: #fff;
    cursor: pointer;
    text-align: left;
    transition: all 0.2s ease;

    &:hover {
      border-color: var(--ai-primary);
      background: var(--ai-primary-light);

      .suggestion-arrow {
        opacity: 1;
        transform: translateX(0);
      }
    }

    > span:nth-child(2) {
      display: flex;
      min-width: 0;
      flex: 1;
      flex-direction: column;
      gap: 4px;
    }

    strong,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      color: var(--ai-text);
      font-size: 10px;
      font-weight: 700;
    }

    small {
      color: var(--ai-text-secondary);
      font-size: 10px;
    }
  }
}

.suggestion-icon {
  display: grid;
  width: 34px;
  height: 34px;
  flex: 0 0 34px;
  place-items: center;
  border-radius: 4px;
  font-size: 15px;

  &.tone-primary {
    color: var(--ai-primary-dark);
    background: var(--ai-primary-light);
  }

  &.tone-info {
    color: #299f98;
    background: #e6f7f4;
  }

  &.tone-warning {
    color: #bd7a27;
    background: #fff3dc;
  }
}

.suggestion-arrow {
  color: var(--ai-primary);
  opacity: 0;
  transform: translateX(-4px);
  transition: all 0.2s ease;
}

.message-loading {
  width: min(100%, 840px);
  margin: 0 auto;
  padding: 35px 24px;

  &__row {
    display: flex;
    gap: 12px;
    margin-bottom: 30px;
  }

  &__avatar {
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    border-radius: 10px;
    background: #e8e9f0;
  }

  &__lines {
    display: flex;
    width: 62%;
    flex-direction: column;
    gap: 8px;

    i {
      height: 8px;
      border-radius: 8px;
      background: linear-gradient(90deg, #e9eaf0, #f5f6f9, #e9eaf0);
      background-size: 220% 100%;
      animation: skeleton 1.5s linear infinite;

      &:nth-child(2) {
        width: 85%;
      }

      &:nth-child(3) {
        width: 44%;
      }
    }
  }
}

.mobile-backdrop {
  display: none;
}

.is-compact {
  :deep(.conversation-panel) {
    position: absolute;
    z-index: 31;
    top: 0;
    bottom: 0;
    left: 0;
    width: min(82%, 300px);
    transform: translateX(-105%);
    box-shadow: 20px 0 50px rgb(29 33 55 / 17%);
    transition: transform 0.25s ease;

    &.is-open {
      transform: translateX(0);
    }
  }

  .history-toggle {
    display: inline-grid;
  }

  .mobile-backdrop {
    position: absolute;
    z-index: 30;
    display: block;
    inset: 0;
    background: rgb(27 30 45 / 18%);
    backdrop-filter: blur(2px);
  }

  .assistant-welcome {
    padding-top: 25px;
  }

  .suggestion-grid {
    grid-template-columns: 1fr;

    button {
      min-height: 58px;
    }
  }
}

@keyframes status-pulse {
  50% {
    opacity: 0.45;
  }
}

@keyframes skeleton {
  to {
    background-position: -220% 0;
  }
}

@media (max-width: 760px) {
  .history-toggle {
    display: inline-grid;
  }

  .mobile-backdrop {
    position: absolute;
    z-index: 29;
    display: block;
    inset: 0;
    background: rgb(27 30 45 / 18%);
    backdrop-filter: blur(2px);
  }

  .assistant-header {
    padding-right: 10px;
    padding-left: 10px;
  }

  .new-chat-button span {
    display: none;
  }

  .new-chat-button {
    width: 32px;
    padding: 0;
    justify-content: center;
  }

  .composer-area {
    padding-right: 10px;
    padding-left: 10px;
  }

  .suggestion-grid {
    grid-template-columns: 1fr;

    button {
      min-height: 58px;
    }
  }
}

@media (max-height: 650px) {
  .welcome-orb {
    width: 74px;
    height: 74px;
  }

  .assistant-welcome {
    padding-top: 20px;
  }

  .suggestion-grid {
    margin-top: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    scroll-behavior: auto !important;
    animation: none !important;
    transition: none !important;
  }
}
</style>
