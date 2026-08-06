<template>
  <article :class="['chat-message', `is-${message.role}`, `status-${message.status}`]">
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
          v-if="message.role === 'assistant' && message.result_cards?.length"
          :cards="message.result_cards"
        />

        <div v-else-if="messageActive" class="thinking-state">
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

      <ExecutionTrace v-if="message.role === 'assistant'" :active="messageActive" :items="trace" />

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
          type="button"
          :aria-label="t('ChatAIEditMessage')"
          :title="t('ChatAIEditMessage')"
          @click="startEdit"
        >
          <el-icon><EditPen /></el-icon>
        </button>
        <button
          v-if="message.content"
          type="button"
          :aria-label="copied ? t('ChatAICopied') : t('Copy')"
          :title="copied ? t('ChatAICopied') : t('Copy')"
          @click="copyMessage"
        >
          <el-icon><Check v-if="copied" /><CopyDocument v-else /></el-icon>
        </button>
        <button
          v-if="message.role === 'assistant' && message.status === 'completed' && canRegenerate"
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
        <span v-if="message.status === 'completed' && message.output_tokens" class="token-usage">
          {{ t('ChatAITokens', { count: message.output_tokens }) }}
        </span>
      </footer>
    </div>

    <div v-if="message.role === 'user'" class="user-avatar">
      <el-icon><UserFilled /></el-icon>
    </div>
  </article>
</template>

<script setup>
import { computed, ref } from 'vue'
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
const editing = ref(false)
const editor = ref(null)
const draftContent = ref('')
const messageActive = computed(() => ['pending', 'streaming'].includes(props.message.status))
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
  return new Intl.DateTimeFormat(undefined, { hour: '2-digit', minute: '2-digit' }).format(date)
}

function copyMessage() {
  copy(props.message.content)
  copied.value = true
  window.setTimeout(() => (copied.value = false), 1200)
}

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
  gap: 11px;
  margin: 0 auto;
  padding: 13px 24px;

  &__avatar {
    padding-top: 2px;
  }

  &__main {
    min-width: 0;
    max-width: calc(100% - 42px);
    flex: 1;
  }

  &__meta {
    display: flex;
    min-height: 25px;
    align-items: center;
    gap: 8px;
    color: #7c7c7c;
    font-size: 10px;
  }

  &__content {
    position: relative;
    min-width: 0;
    color: #35394b;
  }

  &.is-user {
    max-width: 840px;
    justify-content: flex-end;
    padding-top: 18px;
    padding-bottom: 18px;

    .chat-message__main {
      max-width: min(78%, 620px);
      flex: 0 1 auto;
    }

    .chat-message__content {
      padding: 10px 14px;
      border: 1px solid var(--ai-primary, #1ab394);
      border-radius: 6px 6px 0 6px;
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
    }

    .message-actions {
      justify-content: flex-end;
      opacity: 0;
    }

    &:hover .message-actions {
      opacity: 1;
    }
  }
}

.assistant-name {
  color: #555a70;
  font-size: 10px;
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
    border-radius: 5px;
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
    border-radius: 5px;
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
      font-size: 11px;
      font-weight: 600;
    }

    small {
      color: #9298a7;
      font-size: 9px;
    }
  }
}

.message-editor {
  display: flex;
  min-width: min(520px, calc(100vw - 120px));
  flex-direction: column;
  gap: 8px;

  textarea {
    width: 100%;
    min-height: 88px;
    padding: 10px 11px;
    border: 1px solid rgb(255 255 255 / 45%);
    border-radius: 5px;
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
      border-radius: 5px;
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
  border-radius: 4px;
  color: #777e94;
  background: #fff;
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
  border-radius: 4px;
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
  min-height: 26px;
  align-items: center;
  gap: 8px;
  margin-top: 5px;
  transition: opacity 0.18s ease;

  button {
    display: inline-flex;
    width: 25px;
    height: 25px;
    align-items: center;
    justify-content: center;
    padding: 0;
    border: 0;
    border-radius: 7px;
    color: #9ba0b1;
    background: transparent;
    cursor: pointer;
    font-size: 10px;

    &:hover {
      color: var(--ai-primary-dark, #148f76);
      background: var(--ai-primary-light, #e8f7f3);
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
    }
  }
}

.answer-version {
  display: inline-flex;
  align-items: center;
  gap: 2px;
  color: #8f959e;
  font-size: 10px;

  button {
    width: 22px;
    height: 22px;
  }
}

.token-usage {
  color: #8f959e;
  font-size: 10px;
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
    overflow: hidden;
    color: #b17780;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
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
