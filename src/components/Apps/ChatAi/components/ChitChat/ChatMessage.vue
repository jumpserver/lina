<template>
  <article :class="['chat-message', `is-${message.role}`, `status-${message.status}`]">
    <div v-if="message.role === 'assistant'" class="chat-message__avatar">
      <AssistantMark :active="message.status === 'streaming'" size="small" />
    </div>

    <div class="chat-message__main">
      <header v-if="message.role === 'assistant'" class="chat-message__meta">
        <span class="assistant-name">{{ t('ChatAIName') }}</span>
        <span class="message-time">{{ formatTime(message.date_created) }}</span>
        <span v-if="message.status === 'streaming'" class="live-indicator">
          <i /> {{ t('ChatAILive') }}
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
        <template v-if="message.content">
          <MessageText :content="message.content" />
        </template>

        <div v-else-if="message.status === 'streaming'" class="thinking-state">
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
          <button type="button" @click="emit('retry')">
            <el-icon><RefreshRight /></el-icon> {{ t('Retry') }}
          </button>
        </div>
      </div>

      <ExecutionTrace
        v-if="message.role === 'assistant'"
        :active="message.status === 'streaming'"
        :items="trace"
      />

      <ApprovalCard
        v-if="messageApproval"
        :approval="messageApproval"
        :processing="approvalProcessing"
        @cancel="emit('cancel-approval')"
        @confirm="emit('confirm-approval')"
      />

      <footer v-if="message.content" class="message-actions">
        <button
          type="button"
          :aria-label="copied ? t('ChatAICopied') : t('Copy')"
          :title="copied ? t('ChatAICopied') : t('Copy')"
          @click="copyMessage"
        >
          <el-icon><Check v-if="copied" /><CopyDocument v-else /></el-icon>
        </button>
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
import { Check, CopyDocument, RefreshRight, UserFilled, Warning } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { copy } from '@/utils/common/index'
import { withBaseApi } from '@/utils/env'
import ApprovalCard from './ApprovalCard.vue'
import ExecutionTrace from './ExecutionTrace.vue'
import MessageText from './MessageText.vue'
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
  }
})

const emit = defineEmits(['retry', 'confirm-approval', 'cancel-approval'])
const { t } = useI18n()
const copied = ref(false)

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

function resolveImageUrl(url) {
  if (/^(blob:|data:|https?:)/.test(url || '')) return url
  return withBaseApi(url)
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
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
  }
}
</style>
