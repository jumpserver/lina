<template>
  <article
    :aria-busy="messageActive"
    :class="['chat-message', `is-${message.role}`, `status-${message.status}`]"
  >
    <div v-if="message.role === 'assistant'" class="chat-message__avatar">
      <AssistantMark :active="messageActive" size="small" />
    </div>

    <div class="chat-message__main">
      <header v-if="message.role === 'assistant'" class="chat-message__meta">
        <span class="assistant-name">{{ assistantName }}</span>
        <span class="message-time">{{ formatTime(message.date_created) }}</span>
        <span v-if="message.status === 'streaming'" class="live-indicator">
          <i /> {{ t('ChatAILive') }}
        </span>
        <span v-else-if="message.status === 'pending'" class="queued-indicator">
          {{ t('ChatAIQueued') }}
        </span>
      </header>

      <ExecutionTrace v-if="message.role === 'assistant'" :active="messageActive" :items="trace" />

      <div :class="['chat-message__content', { 'has-error': message.status === 'failed' }]">
        <div v-if="message.images?.length" class="message-images">
          <img
            v-for="image in message.images"
            :key="image.id || image.url"
            :alt="image.name"
            :src="resolveImageUrl(image.url)"
            loading="lazy"
          />
        </div>
        <div v-if="message.files?.length" class="message-files">
          <a
            v-for="file in message.files"
            :key="file.id || file.url"
            :download="file.name"
            :href="resolveAttachmentUrl(file.url)"
          >
            <el-icon><Document /></el-icon>
            <span>
              <strong>{{ file.name }}</strong>
              <small>{{ formatFileSize(file.size) }}</small>
            </span>
          </a>
        </div>
        <div v-if="editing" class="message-editor">
          <textarea
            ref="editor"
            v-model="draftContent"
            :aria-label="t('ChatAIEditMessage')"
            rows="4"
            @keydown.ctrl.enter.prevent="submitEdit"
            @keydown.esc.stop.prevent="cancelEdit"
            @keydown.meta.enter.prevent="submitEdit"
          />
          <div class="message-editor__actions">
            <span>{{ t('ChatAIEditCreatesBranch') }}</span>
            <button class="is-secondary" type="button" @click="cancelEdit">
              {{ t('Cancel') }}
            </button>
            <button type="button" :disabled="!editSubmittable" @click="submitEdit">
              {{ t('ChatAIBranchConversation') }}
            </button>
          </div>
        </div>
        <template v-else-if="message.content">
          <MessageText :content="message.content" />
        </template>

        <ResultCards
          v-if="message.role === 'assistant' && visibleResultCards.length"
          :cards="visibleResultCards"
        />

        <div v-if="showThinking" class="thinking-state" role="status">
          <span class="thinking-orbit"><i /><i /><i /></span>
          <span>
            <strong>{{ t('ChatAIThinking') }}</strong>
            <small>{{ t('ChatAIThinkingDescription') }}</small>
          </span>
        </div>

        <div v-if="message.status === 'failed'" class="message-error">
          <span class="message-error__icon"
            ><el-icon><Warning /></el-icon
          ></span>
          <span>
            <strong>{{ t('ChatAIResponseInterrupted') }}</strong>
            <small>{{ message.error || t('ServerBusyRetry') }}</small>
          </span>
          <button type="button" @click="emit('retry', message.id)">
            <el-icon><RefreshRight /></el-icon> {{ t('Retry') }}
          </button>
        </div>
      </div>

      <ApprovalCard
        v-if="messageApproval"
        :approval="messageApproval"
        :processing="approvalProcessing"
        @cancel="emit('cancel-approval')"
        @confirm="emit('confirm-approval')"
      />

      <footer
        v-if="!editing && (message.content || message.images?.length || message.files?.length)"
        class="message-actions"
      >
        <button
          v-if="message.role === 'user' && canEdit"
          class="message-action message-action--edit"
          type="button"
          :aria-label="t('ChatAIEditMessage')"
          :title="t('ChatAIEditMessage')"
          @click="startEdit"
        >
          <el-icon><EditPen /></el-icon>
        </button>
        <button
          v-if="message.content"
          :class="['message-action', 'message-action--copy', { 'is-success': copied }]"
          type="button"
          :aria-label="copied ? t('ChatAICopied') : t('Copy')"
          :title="copied ? t('ChatAICopied') : t('Copy')"
          @click="copyMessage"
        >
          <el-icon><Check v-if="copied" /><CopyDocument v-else /></el-icon>
        </button>
        <button
          v-if="message.role === 'assistant' && message.status === 'completed' && canRegenerate"
          class="message-action message-action--regenerate"
          type="button"
          :aria-label="t('ChatAIRegenerate')"
          :title="t('ChatAIRegenerate')"
          @click="emit('retry', message.id)"
        >
          <el-icon><RefreshRight /></el-icon>
        </button>
        <span v-if="message.version" class="answer-version">
          <button
            type="button"
            :aria-label="t('ChatAIPreviousVersion')"
            :disabled="!message.version.previous_id || messageActive"
            :title="t('ChatAIPreviousVersion')"
            @click="emit('select-version', message.version.previous_id)"
          >
            <el-icon><ArrowLeft /></el-icon>
          </button>
          <span>{{ message.version.index }} / {{ message.version.total }}</span>
          <button
            type="button"
            :aria-label="t('ChatAINextVersion')"
            :disabled="!message.version.next_id || messageActive"
            :title="t('ChatAINextVersion')"
            @click="emit('select-version', message.version.next_id)"
          >
            <el-icon><ArrowRight /></el-icon>
          </button>
        </span>
      </footer>
    </div>

    <div v-if="message.role === 'user'" class="user-avatar">
      <el-icon><UserFilled /></el-icon>
    </div>
  </article>
</template>

<script setup>
import { computed, onBeforeUnmount, ref } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CopyDocument,
  Document,
  EditPen,
  RefreshRight,
  UserFilled,
  Warning
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { copy } from '@/utils/common/index'
import { withBaseApi } from '@/utils/env'
import ApprovalCard from './ApprovalCard.vue'
import ExecutionTrace from './ExecutionTrace.vue'
import MessageText from './MessageText.vue'
import ResultCards from './ResultCards.vue'
import AssistantMark from '../AssistantMark.vue'

const props = defineProps({
  message: {
    type: Object,
    required: true
  },
  trace: {
    type: Array,
    default: () => []
  },
  approval: {
    type: Object,
    default: null
  },
  approvalProcessing: {
    type: Boolean,
    default: false
  },
  assistantName: {
    type: String,
    default: ''
  },
  canRegenerate: {
    type: Boolean,
    default: false
  },
  canEdit: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'retry',
  'branch',
  'select-version',
  'confirm-approval',
  'cancel-approval'
])
const { t } = useI18n()
const copied = ref(false)
let copyTimer = null
const editing = ref(false)
const editor = ref(null)
const draftContent = ref('')
const messageActive = computed(() => ['pending', 'streaming'].includes(props.message.status))
const visibleResultCards = computed(() => {
  return (props.message.result_cards || []).filter((card) => card && card.type !== 'progress')
})
const showThinking = computed(() => {
  return (
    messageActive.value &&
    !props.message.content &&
    !props.trace.length &&
    !visibleResultCards.value.length
  )
})
const editSubmittable = computed(() => {
  const hasAttachments = props.message.images?.length || props.message.files?.length
  return (
    draftContent.value !== props.message.content && (draftContent.value.trim() || hasAttachments)
  )
})

const messageApproval = computed(() => {
  if (!props.approval) return null
  return props.approval.messageId === props.message.id ? props.approval : null
})

function formatTime(value) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const now = new Date()
  const isToday = date.toDateString() === now.toDateString()
  return new Intl.DateTimeFormat(
    undefined,
    isToday
      ? { hour: '2-digit', minute: '2-digit' }
      : { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }
  ).format(date)
}

function copyMessage() {
  copy(props.message.content)
  copied.value = true
  if (copyTimer) window.clearTimeout(copyTimer)
  copyTimer = window.setTimeout(() => (copied.value = false), 1200)
}

onBeforeUnmount(() => {
  if (copyTimer) window.clearTimeout(copyTimer)
})

function startEdit() {
  if (!props.canEdit) return
  draftContent.value = props.message.content
  editing.value = true
  requestAnimationFrame(() => {
    editor.value?.focus()
    editor.value?.setSelectionRange(draftContent.value.length, draftContent.value.length)
  })
}

function cancelEdit() {
  editing.value = false
  draftContent.value = ''
}

function submitEdit() {
  if (!editSubmittable.value) return
  emit('branch', props.message.id, draftContent.value)
  cancelEdit()
}

function resolveImageUrl(url) {
  if (/^(blob:|data:|https?:)/.test(url || '')) return url
  return withBaseApi(url)
}

function resolveAttachmentUrl(url) {
  if (/^(blob:|data:|https?:)/.test(url || '')) return url
  return withBaseApi(url)
}

function formatFileSize(size) {
  if (size < 1024) return `${size} B`
  if (size < 1024 * 1024) return `${Math.ceil(size / 1024)} KiB`
  return `${(size / (1024 * 1024)).toFixed(1)} MiB`
}
</script>

<style lang="scss" scoped>
.chat-message {
  display: flex;
  width: 100%;
  max-width: 840px;
  gap: 10px;
  margin: 0 auto;
  padding: 11px 20px;

  &__avatar {
    padding-top: 2px;
  }

  &__main {
    min-width: 0;
    max-width: calc(100% - 36px);
    flex: 1;
  }

  &__meta {
    display: flex;
    min-height: 22px;
    align-items: center;
    gap: 6px;
    color: #68707c;
    font-size: 11px;
  }

  &__content {
    position: relative;
    min-width: 0;
    color: #303544;
  }

  &.is-user {
    max-width: 840px;
    justify-content: flex-end;
    padding-top: 15px;
    padding-bottom: 15px;

    .chat-message__main {
      max-width: min(78%, 620px);
      flex: 0 1 auto;
    }

    .chat-message__content {
      padding: 8px 12px;
      border: 1px solid var(--ai-primary, #1ab394);
      border-radius: 12px 12px 3px 12px;
      color: #fff;
      background: var(--ai-primary, #1ab394);

      :deep(.message-text) {
        color: #fff;
      }

      :deep(a) {
        color: #fff;
      }

      :deep(code:not(.hljs)) {
        color: #fff;
        border-color: rgb(255 255 255 / 13%);
        background: rgb(255 255 255 / 12%);
      }

      :deep(.markdown-body h1),
      :deep(.markdown-body h2),
      :deep(.markdown-body h3),
      :deep(.markdown-body h4) {
        color: #fff;
      }

      :deep(.markdown-body blockquote) {
        color: rgb(255 255 255 / 88%);
        border-left-color: rgb(255 255 255 / 55%);
        background: rgb(255 255 255 / 10%);
      }

      :deep(.markdown-body table th),
      :deep(.markdown-body table td) {
        border-color: rgb(255 255 255 / 22%);
      }

      :deep(.markdown-body table th) {
        color: #fff;
        background: rgb(255 255 255 / 10%);
      }
    }

    .message-actions {
      justify-content: flex-end;
      opacity: 0;
    }

    &:hover .message-actions {
      opacity: 1;
    }

    &:focus-within .message-actions {
      opacity: 1;
    }
  }
}

.assistant-name {
  color: #444b5d;
  font-size: 11px;
  font-weight: 720;
}

.message-images {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 180px));
  gap: 6px;
  margin-bottom: 8px;

  img {
    display: block;
    width: 100%;
    max-height: 220px;
    border: 1px solid #e4e8e6;
    border-radius: var(--ai-radius-md, 10px);
    object-fit: cover;
  }
}

.message-files {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 8px;

  a {
    display: flex;
    width: min(100%, 320px);
    align-items: center;
    gap: 9px;
    padding: 8px 10px;
    border: 1px solid #e1e4ea;
    border-radius: var(--ai-radius-sm, 8px);
    color: #555d70;
    background: #f8f9fb;
    text-decoration: none;

    > .el-icon {
      flex: 0 0 auto;
      color: var(--ai-primary-dark, #148f76);
      font-size: 22px;
    }

    > span {
      display: flex;
      min-width: 0;
      flex-direction: column;
      gap: 2px;
    }

    strong,
    small {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    strong {
      font-size: 12px;
      font-weight: 600;
    }

    small {
      color: #737b87;
      font-size: 11px;
    }
  }
}

.message-editor {
  display: flex;
  width: min(520px, 100%);
  max-width: 100%;
  min-width: 0;
  flex-direction: column;
  gap: 8px;

  textarea {
    width: 100%;
    min-height: 88px;
    padding: 10px 11px;
    border: 1px solid rgb(255 255 255 / 45%);
    border-radius: var(--ai-radius-sm, 8px);
    outline: none;
    color: #35394b;
    background: #fff;
    font: inherit;
    line-height: 1.65;
    resize: vertical;

    &:focus {
      border-color: rgb(255 255 255 / 85%);
      box-shadow: 0 0 0 2px rgb(255 255 255 / 18%);
    }
  }

  &__actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 7px;

    > span {
      margin-right: auto;
      color: rgb(255 255 255 / 82%);
      font-size: 9px;
    }

    button {
      height: 28px;
      padding: 0 10px;
      border: 1px solid #fff;
      border-radius: var(--ai-radius-xs, 6px);
      color: var(--ai-primary-dark, #148f76);
      background: #fff;
      cursor: pointer;
      font-size: 10px;
      font-weight: 600;

      &.is-secondary {
        color: #fff;
        background: transparent;
      }

      &:disabled {
        cursor: not-allowed;
        opacity: 0.5;
      }
    }
  }
}

.is-user .message-files a {
  border-color: rgb(255 255 255 / 24%);
  color: #fff;
  background: rgb(255 255 255 / 12%);

  > .el-icon,
  small {
    color: rgb(255 255 255 / 82%);
  }
}

.message-time {
  color: #8f959e;
}

.live-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: var(--ai-primary-dark, #148f76);
  font-weight: 650;

  i {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: var(--ai-primary, #1ab394);
    animation: live-pulse 1.4s ease-in-out infinite;
  }
}

.queued-indicator {
  color: #9298a7;
  font-weight: 600;
}

.user-avatar {
  display: grid;
  width: 28px;
  height: 28px;
  flex: 0 0 28px;
  margin-top: 2px;
  place-items: center;
  border: 1px solid #e6e8ef;
  border-radius: 9px;
  color: #777e94;
  background: #f8faf9;
}

.thinking-state {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 52px;
  color: #777d91;

  > span:last-child {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    color: #565c72;
    font-size: 11px;
    font-weight: 650;
  }

  small {
    color: #a1a6b6;
    font-size: 10px;
  }
}

.thinking-orbit {
  position: relative;
  display: inline-flex;
  width: 28px;
  height: 28px;
  align-items: center;
  justify-content: center;
  gap: 2px;
  border-radius: var(--ai-radius-sm, 8px);
  background: var(--ai-primary-light, #e8f7f3);

  i {
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: var(--ai-primary, #1ab394);
    animation: thinking 1.1s ease-in-out infinite;

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.message-actions {
  display: flex;
  min-height: 30px;
  align-items: center;
  gap: 2px;
  margin-top: 6px;
  transition: opacity 0.18s ease;

  button {
    display: inline-flex;
    width: 28px;
    height: 28px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 7px;
    color: #737c89;
    background: transparent;
    cursor: pointer;
    font-size: 15px;
    transition:
      color 0.16s ease,
      background-color 0.16s ease;

    .el-icon {
      width: 16px;
      height: 16px;
      font-size: 16px;
      transition: transform 0.18s ease;
    }

    &:hover {
      color: var(--ai-primary-dark, #148f76);
      background: var(--ai-primary-light, #e8f7f3);
    }

    &:active {
      background: var(--ai-primary-light-2, #d1efe8);
    }

    &:focus-visible {
      outline: 2px solid rgb(26 179 148 / 42%);
      outline-offset: 2px;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }

    &.is-success {
      color: var(--ai-primary-dark, #148f76);
      background: var(--ai-primary-light, #e8f7f3);
    }
  }
}

.message-action--regenerate:hover .el-icon {
  transform: rotate(-30deg);
}

.answer-version {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #8f959e;
  font-size: 10px;

  button {
    width: 26px;
    height: 26px;

    .el-icon {
      width: 13px;
      height: 13px;
      font-size: 13px;
    }
  }
}

.message-error {
  display: flex;
  width: min(100%, 600px);
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 10px 11px;
  border: 1px solid #f0d0d4;
  border-radius: 12px;
  color: #8f4d58;
  background: #fff5f6;

  &__icon {
    display: grid;
    width: 28px;
    height: 28px;
    flex: 0 0 28px;
    place-items: center;
    border-radius: 9px;
    color: #c85664;
    background: #ffe5e8;
  }

  > span:nth-child(2) {
    display: flex;
    min-width: 0;
    flex: 1;
    flex-direction: column;
    gap: 2px;
  }

  strong {
    font-size: 10px;
  }

  small {
    color: #b17780;
    font-size: 10px;
    line-height: 1.45;
    overflow-wrap: anywhere;
  }

  button {
    display: inline-flex;
    height: 28px;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
    border: 1px solid #edc7cc;
    border-radius: 8px;
    color: #a54e5a;
    background: #fff;
    cursor: pointer;
    font-size: 10px;
    flex: 0 0 auto;

    &:focus-visible {
      outline: 2px solid rgb(213 92 105 / 32%);
      outline-offset: 2px;
    }
  }
}

@media (hover: none) {
  .chat-message.is-user .message-actions {
    opacity: 1;
  }
}

@media (max-width: 520px) {
  .message-error {
    align-items: flex-start;
    flex-wrap: wrap;

    button {
      margin-left: 38px;
    }
  }
}

@keyframes thinking {
  0%,
  70%,
  100% {
    opacity: 0.35;
    transform: translateY(0);
  }

  35% {
    opacity: 1;
    transform: translateY(-3px);
  }
}

@keyframes live-pulse {
  50% {
    opacity: 0.45;
  }
}

@media (max-width: 620px) {
  .chat-message {
    padding-right: 16px;
    padding-left: 16px;

    &.is-user .chat-message__main {
      max-width: calc(100% - 39px);
    }
  }

  .message-editor {
    min-width: 0;

    &__actions {
      flex-wrap: wrap;

      > span {
        width: 100%;
      }
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
</style>
