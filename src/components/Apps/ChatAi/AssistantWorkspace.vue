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
          ref="historyToggle"
          class="header-icon history-toggle"
          :aria-label="t('History')"
          :title="t('History')"
          type="button"
          @click="historyOpen = !historyOpen"
        >
          <el-icon><Clock /></el-icon>
        </button>
        <AssistantMark :active="streaming" size="small" />
        <span class="brand-copy">
          <strong>{{ t('ChatAIName') }}</strong>
          <small>
            <i :class="{ 'is-busy': busy || transcribing || composerRecording }" />
            {{ busy || transcribing || composerRecording ? activityLabel : t('ChatAIReady') }}
          </small>
        </span>
      </div>

      <div class="assistant-header__actions">
        <button
          class="new-chat-button"
          :aria-label="t('NewChat')"
          :disabled="navigationLocked"
          :title="navigationLocked ? t('ChatAIFinishCurrentTask') : t('NewChat')"
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
        ref="conversationPanel"
        :active-id="activeConversationId"
        :conversations="conversations"
        :loading="loadingConversations"
        :navigation-locked="navigationLocked"
        :open="historyOpen"
        @close="historyOpen = false"
        @delete="handleDelete"
        @new="handleNew"
        @rename="handleRename"
        @select="selectConversation"
      />

      <main class="chat-stage" :inert="historyOpen">
        <div ref="scrollArea" class="chat-scroll" @scroll="handleScroll">
          <div
            v-if="loadingMessages || (!initialized && loadingConversations)"
            class="message-loading"
          >
            <div v-for="item in 3" :key="item" class="message-loading__row">
              <span class="message-loading__avatar" />
              <span class="message-loading__lines"><i /><i /><i /></span>
            </div>
          </div>

          <section v-else-if="messageLoadFailed" class="message-load-error" role="alert">
            <span class="message-load-error__icon">
              <el-icon><Warning /></el-icon>
            </span>
            <h2>{{ t('ChatAILoadFailedTitle') }}</h2>
            <p>{{ t('ChatAILoadFailedDescription') }}</p>
            <button type="button" @click="retryLoadingMessages">
              {{ t('ChatAIRetryLoad') }}
            </button>
          </section>

          <div v-else-if="!visibleMessages.length" class="assistant-welcome">
            <h1>{{ t('ChatAIWelcomeTitle') }}</h1>
            <p>{{ t('ChatAIWelcomeDescription') }}</p>
            <div
              v-if="suggestions.length"
              :class="[
                'suggestion-grid',
                { 'is-one': suggestions.length === 1, 'is-two': suggestions.length === 2 }
              ]"
            >
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
              :key="item.version?.root_id || item._render_key || item.id"
              :approval="approval"
              :approval-processing="approvalProcessing"
              :assistant-name="t('ChatAIName')"
              :can-edit="!busy"
              :can-regenerate="item.id === latestAssistantMessageId"
              :message="item"
              :trace="traces[item.id] || []"
              @cancel-approval="handleCancelApproval"
              @branch="handleBranchMessage"
              @confirm-approval="handleConfirmApproval"
              @retry="handleRegenerateMessage"
              @select-version="selectAnswerVersion(item.version?.root_id, $event)"
            />
          </div>
        </div>

        <transition name="scroll-latest">
          <button
            v-if="showScrollToLatest"
            class="scroll-latest-button"
            type="button"
            :aria-label="t('ChatAIScrollToLatest')"
            :title="t('ChatAIScrollToLatest')"
            @click="handleScrollToLatest"
          >
            <el-icon><Bottom /></el-icon>
          </button>
        </transition>

        <footer class="composer-area">
          <div v-if="recoverableRun" class="recovery-banner">
            <span
              ><el-icon><Warning /></el-icon> {{ t('ChatAIRunRecovery') }}</span
            >
            <button type="button" @click="stopGeneration">{{ t('ChatAICancelTask') }}</button>
          </div>
          <ChatInput
            ref="composer"
            :active="active"
            :busy="busy"
            :disabled="awaitingApproval || recoverableRun"
            :draft-key="composerDraftKey"
            :stopping="stopping"
            :stop-disabled="approvalProcessing || backgroundQueuing || preparing"
            :transcribing="transcribing"
            :voice-transcription-mode="voiceTranscriptionMode"
            :web-search-available="webSearchAvailable"
            @audio="handleAudio"
            @error="handleMicrophoneError"
            @attachment-error="handleAttachmentError"
            @recording-change="composerRecording = $event"
            @send="sendMessage"
            @stop="stopGeneration"
          />
          <div class="composer-disclaimer">
            <span :title="t('ChatAIDisclaimer')">{{ t('ChatAIDisclaimer') }}</span>
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
  Bottom,
  Close,
  Clock,
  Connection,
  EditPen,
  FullScreen,
  Monitor,
  ScaleToOriginal,
  Setting,
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
  active: {
    type: Boolean,
    default: true
  },
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
const conversationPanel = ref(null)
const historyToggle = ref(null)
const historyOpen = ref(false)
const composerRecording = ref(false)
const stickToBottom = ref(true)
const showScrollToLatest = ref(false)
const voiceTranscriptionMode = computed(() => {
  return store.getters.publicSettings?.CHAT_AI_VOICE_TRANSCRIPTION_MODE === 'server'
    ? 'server'
    : 'browser'
})
const webSearchAvailable = computed(() => {
  return Boolean(store.getters.publicSettings?.CHAT_AI_WEB_SEARCH_ENABLED)
})

const {
  conversations,
  activeConversationId,
  visibleMessages,
  latestAssistantMessageId,
  traces,
  approval,
  loadingConversations,
  loadingMessages,
  initialized,
  streaming,
  stopping,
  approvalProcessing,
  backgroundQueuing,
  preparing,
  transcribing,
  awaitingApproval,
  recoverableRun,
  busy,
  lastError,
  initialize,
  loadConversations,
  loadMessages,
  selectConversation: selectConversationState,
  newConversation,
  selectAnswerVersion,
  removeConversation,
  renameConversation,
  sendMessage: sendMessageState,
  stopGeneration,
  confirmApproval,
  rejectApproval,
  transcribe,
  branchMessage,
  regenerateMessage
} = useChatAi({ onError: handleRequestError })

const activityLabel = computed(() => {
  if (stopping.value) return t('ChatAIStopping')
  if (transcribing.value) return t('ChatAITranscribing')
  if (composerRecording.value) return t('ChatAIRecording')
  if (backgroundQueuing.value) return t('ChatAIBackgroundQueuing')
  if (approvalProcessing.value) return t('ChatAIExecuting')
  if (awaitingApproval.value) return t('ChatAIWaitingApproval')
  return t('ChatAIWorking')
})
const composerDraftKey = computed(() => {
  return activeConversationId.value || 'new'
})
const messageLoadFailed = computed(() => {
  const conversationFailed = activeConversationId.value && !visibleMessages.value.length
  const workspaceFailed = !initialized.value && !activeConversationId.value
  return Boolean(
    lastError.value &&
    !loadingConversations.value &&
    !loadingMessages.value &&
    (conversationFailed || workspaceFailed)
  )
})
const navigationLocked = computed(() => {
  return busy.value || composerRecording.value || transcribing.value || loadingMessages.value
})

const suggestions = computed(() => {
  const permissions = new Set(store.getters.currentOrgPerms || [])
  return [
    {
      permission: 'assets.view_asset',
      icon: Monitor,
      tone: 'primary',
      title: t('ChatAISuggestionAssetsTitle'),
      text: t('ChatAISuggestionAssets')
    },
    {
      permission: 'assets.view_node',
      icon: Connection,
      tone: 'info',
      title: t('ChatAISuggestionNodesTitle'),
      text: t('ChatAISuggestionNodes')
    },
    {
      permission: 'assets.add_asset',
      icon: Setting,
      tone: 'warning',
      title: t('ChatAISuggestionCreateTitle'),
      text: t('ChatAISuggestionCreate')
    }
  ].filter((suggestion) => permissions.has(suggestion.permission))
})

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
  if (navigationLocked.value) {
    message.warning(t('ChatAIFinishCurrentTask'))
    return
  }
  const selected = await selectConversationState(id)
  if (!selected) message.warning(t('ChatAIFinishCurrentTask'))
  await nextTick()
  scrollToBottom(false)
  composer.value?.focus()
}

function handleNew() {
  if (navigationLocked.value) {
    message.warning(t('ChatAIFinishCurrentTask'))
    return
  }
  const alreadyNew = !activeConversationId.value
  if (!newConversation()) {
    message.warning(t('ChatAIFinishCurrentTask'))
    return
  }
  historyOpen.value = false
  nextTick(() => {
    if (alreadyNew) composer.value?.clear()
    composer.value?.focus()
  })
}

async function handleDelete(conversation) {
  if (conversation.id === activeConversationId.value && navigationLocked.value) {
    message.warning(t('ChatAIFinishCurrentTask'))
    return
  }
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
    composer.value?.discardDraft(conversation.id)
    await nextTick()
    composer.value?.focus()
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

async function sendMessage(content, images, options) {
  stickToBottom.value = true
  const sent = await sendMessageState(content, images, options)
  if (sent && options?.background) message.success(t('ChatAIBackgroundQueued'))
  await nextTick()
  stickToBottom.value = true
  scrollToBottom(true, true)
}

async function handleBranchMessage(messageId, content) {
  stickToBottom.value = true
  const options = webSearchAvailable.value ? {} : { webSearch: false }
  const branched = await branchMessage(messageId, content, options)
  if (!branched) return
  await nextTick()
  scrollToBottom(true, true)
}

function handleRegenerateMessage(messageId) {
  const options = webSearchAvailable.value ? {} : { webSearch: false }
  return regenerateMessage(messageId, options)
}

function fillSuggestion(content) {
  composer.value?.setValue(content)
}

async function retryLoadingMessages() {
  if (loadingConversations.value || loadingMessages.value) return
  if (activeConversationId.value) await loadMessages(activeConversationId.value)
  else await initialize()
  await nextTick()
  if (!lastError.value) {
    scrollToBottom(false)
    composer.value?.focus()
  }
}

async function handleAudio(file) {
  try {
    const language = (navigator.language || '').split(/[-_]/)[0]
    const result = await transcribe(file, language)
    composer.value?.appendValue(result.text || '')
    message.success(t('ChatAITranscriptionReady'))
  } catch {
    // The composable already surfaces a precise error.
  }
}

function handleMicrophoneError() {
  message.warning(t('ChatAIMicrophonePermission'))
}

function handleAttachmentError(detail) {
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
  showScrollToLatest.value = !stickToBottom.value && visibleMessages.value.length > 0
}

function handleScrollToLatest() {
  stickToBottom.value = true
  showScrollToLatest.value = false
  scrollToBottom(true, true)
}

function scrollToBottom(smooth = true, force = false) {
  if (!force && !stickToBottom.value && smooth) return
  const element = scrollArea.value
  if (!element) return
  if (force || !smooth) {
    element.scrollTop = element.scrollHeight
    stickToBottom.value = true
    showScrollToLatest.value = false
    return
  }
  element.scrollTo({ top: element.scrollHeight, behavior: 'smooth' })
}

function handleShortcut(event) {
  if (!props.active || event.defaultPrevented) return
  if (event.key === 'Escape' && historyOpen.value) {
    event.preventDefault()
    historyOpen.value = false
    return
  }
  if (event.key === 'Escape' && !props.standalone) {
    event.preventDefault()
    emit('close')
    return
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault()
    handleNew()
  }
}

watch(
  () =>
    visibleMessages.value
      .map((item) => {
        const traceState = (traces.value[item.id] || [])
          .map((trace) => `${trace.id}:${trace.status}`)
          .join(',')
        return `${item.id}:${item.content.length}:${item.status}:${item.result_cards?.length || 0}:${traceState}`
      })
      .join('|') + `|approval:${approval.value?.id || ''}:${approval.value?.status || ''}`,
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

watch(
  () => props.active,
  (active) => {
    if (!active) historyOpen.value = false
  }
)

watch(historyOpen, async (open) => {
  await nextTick()
  if (open) conversationPanel.value?.focusSearch()
  else if (props.active) historyToggle.value?.focus()
})

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
  --ai-header-height: 52px;
  --ai-primary: var(--el-color-primary, #1ab394);
  --ai-primary-dark: var(--el-color-primary-dark-2, #148f76);
  --ai-primary-light: var(--el-color-primary-light-9, #e8f7f3);
  --ai-primary-light-2: var(--el-color-primary-light-8, #d1efe8);
  --ai-text: var(--color-text-primary, #292827);
  --ai-text-secondary: var(--color-text-secondary, #7c7c7c);
  --ai-border: var(--color-border, #e9ecef);
  --ai-surface-muted: #f7f9f8;
  --ai-surface-hover: #f1f7f5;
  --ai-radius-xs: 6px;
  --ai-radius-sm: 8px;
  --ai-radius-md: 10px;
  --ai-radius-lg: 12px;
  --ai-focus-ring: 0 0 0 3px rgb(26 179 148 / 16%);
  position: relative;
  display: flex;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  color: var(--ai-text);
  background: #fff;
  font-family:
    -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
    'Microsoft YaHei', 'Noto Sans CJK SC', sans-serif;
  font-size: 14px;
  flex-direction: column;
  user-select: text;
}

.assistant-workspace button:focus-visible {
  outline: 2px solid rgb(26 179 148 / 42%);
  outline-offset: 2px;
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
  padding: 0 12px;
  border-bottom: 1px solid var(--ai-border);
  background: #fff;

  &__brand,
  &__actions {
    display: flex;
    align-items: center;
  }

  &__brand {
    min-width: 0;
    gap: 8px;
  }

  &__actions {
    gap: 4px;
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
    font-size: 11px;

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
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 1px solid transparent;
  border-radius: var(--ai-radius-sm);
  color: var(--ai-text-secondary);
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.18s ease;

  &:hover {
    color: var(--ai-primary-dark);
    border-color: var(--ai-primary-light-2);
    background: var(--ai-primary-light);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }
}

.new-chat-button {
  display: inline-grid;
  width: 30px;
  height: 30px;
  padding: 0;
  place-items: center;
  border: 1px solid transparent;
  border-radius: var(--ai-radius-sm);
  color: var(--ai-text-secondary);
  background: transparent;
  cursor: pointer;
  font-size: 16px;
  transition: all 0.18s ease;

  &:hover:not(:disabled) {
    border-color: var(--ai-primary-light-2);
    color: var(--ai-primary-dark);
    background: var(--ai-primary-light);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
  }

  span {
    display: none;
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
  padding: 12px 0 16px;
}

.scroll-anchor {
  width: 1px;
  height: 1px;
}

.composer-area {
  position: relative;
  z-index: 10;
  padding: 6px 14px 6px;
  background: linear-gradient(180deg, rgb(255 255 255 / 72%), #fff 14px);
}

.scroll-latest-button {
  position: absolute;
  z-index: 12;
  right: 50%;
  bottom: 108px;
  display: grid;
  width: 32px;
  height: 32px;
  padding: 0;
  place-items: center;
  border: 1px solid var(--ai-border);
  border-radius: 50%;
  color: #6f7687;
  background: #fff;
  box-shadow: 0 6px 18px rgb(27 45 39 / 14%);
  cursor: pointer;
  transform: translateX(50%);

  &:hover {
    color: var(--ai-primary-dark);
    border-color: var(--ai-primary);
    background: var(--ai-primary-light);
  }
}

.scroll-latest-enter-active,
.scroll-latest-leave-active {
  transition:
    opacity 0.18s ease,
    transform 0.18s ease;
}

.scroll-latest-enter-from,
.scroll-latest-leave-to {
  opacity: 0;
  transform: translate(50%, 6px);
}

.composer-disclaimer {
  min-height: 16px;
  padding: 2px 4px 0;
  overflow: hidden;
  color: #737b87;
  font-size: 11px;
  line-height: 14px;
  text-align: center;

  span {
    display: -webkit-box;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: normal;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
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
  font-size: 11px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }

  button {
    padding: 4px 8px;
    border: 1px solid #ead0a2;
    border-radius: var(--ai-radius-xs);
    color: #966426;
    background: #fff;
    cursor: pointer;
    font-size: 11px;
  }
}

.assistant-welcome {
  display: flex;
  width: min(760px, calc(100% - 38px));
  min-height: 100%;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 24px 0;
  text-align: center;
  flex-direction: column;

  h1 {
    margin: 0 0 8px;
    color: var(--ai-text);
    font-size: clamp(20px, 2vw, 24px);
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

.suggestion-grid {
  display: grid;
  width: 100%;
  margin-top: 18px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;

  &.is-one {
    max-width: 280px;
    grid-template-columns: minmax(0, 1fr);
  }

  &.is-two {
    max-width: 540px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  button {
    display: flex;
    min-width: 0;
    min-height: 64px;
    align-items: center;
    gap: 9px;
    padding: 9px 10px;
    border: 1px solid var(--ai-border);
    border-radius: var(--ai-radius-md);
    color: #606266;
    background: #fff;
    cursor: pointer;
    text-align: left;
    box-shadow: 0 2px 7px rgb(34 52 46 / 4%);
    transition:
      border-color 0.2s ease,
      background 0.2s ease,
      box-shadow 0.2s ease,
      transform 0.2s ease;

    &:hover {
      border-color: var(--ai-primary);
      background: var(--ai-primary-light);
      box-shadow: 0 8px 20px rgb(20 143 118 / 10%);
      transform: translateY(-1px);

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
      font-size: 12px;
      font-weight: 700;
    }

    small {
      display: -webkit-box;
      color: var(--ai-text-secondary);
      font-size: 11px;
      line-height: 1.45;
      white-space: normal;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }
}

.suggestion-icon {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border-radius: var(--ai-radius-sm);
  font-size: 14px;

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

.message-load-error {
  display: flex;
  width: min(440px, calc(100% - 36px));
  min-height: 100%;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
  padding: 32px 0;
  color: var(--ai-text-secondary);
  text-align: center;
  flex-direction: column;

  &__icon {
    display: grid;
    width: 44px;
    height: 44px;
    margin-bottom: 13px;
    place-items: center;
    border-radius: var(--ai-radius-lg);
    color: #bd6d2a;
    background: #fff3e4;
    font-size: 20px;
  }

  h2 {
    margin: 0;
    color: var(--ai-text);
    font-size: 15px;
    font-weight: 600;
  }

  p {
    max-width: 360px;
    margin: 7px 0 16px;
    font-size: 11px;
    line-height: 1.65;
  }

  button {
    height: 34px;
    padding: 0 14px;
    border: 1px solid var(--ai-primary);
    border-radius: var(--ai-radius-sm);
    color: #fff;
    background: var(--ai-primary);
    cursor: pointer;
    font-size: 11px;
    font-weight: 600;

    &:hover {
      border-color: var(--ai-primary-dark);
      background: var(--ai-primary-dark);
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
    width: min(78%, 264px);
    transform: translateX(-105%);
    visibility: hidden;
    box-shadow: 20px 0 50px rgb(29 33 55 / 17%);
    transition:
      transform 0.25s ease,
      visibility 0s linear 0.25s;

    &.is-open {
      transform: translateX(0);
      visibility: visible;
      transition-delay: 0s;
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
      min-height: 54px;
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

  .composer-area {
    padding-right: 10px;
    padding-left: 10px;
  }

  .suggestion-grid {
    grid-template-columns: 1fr;

    button {
      min-height: 54px;
    }
  }
}

@media (max-width: 480px) {
  .brand-copy {
    display: none;
  }

  .assistant-header__actions {
    gap: 4px;
  }

  .header-icon,
  .new-chat-button {
    width: 32px;
    height: 32px;
  }
}

@media (max-height: 650px) {
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
