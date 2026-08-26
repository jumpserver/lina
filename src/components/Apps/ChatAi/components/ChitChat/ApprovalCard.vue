<template>
  <section :class="['approval-card', { 'is-expired': expired }]">
    <header class="approval-card__header">
      <span class="approval-icon"
        ><el-icon><Lock /></el-icon
      ></span>
      <span class="approval-title">
        <span class="approval-eyebrow">{{ t('ChatAISecureApproval') }}</span>
        <strong>{{ t('ChatAIApprovalTitle') }}</strong>
      </span>
      <span :class="['risk-badge', `risk-${riskLevel}`]">
        {{ riskLabel }}
      </span>
    </header>

    <p class="approval-description">
      {{
        approval.recovery ? t('ChatAIApprovalRecoveryDescription') : t('ChatAIApprovalDescription')
      }}
    </p>

    <div v-if="!approval.recovery" class="operation-card">
      <div class="operation-card__route">
        <span class="method">{{ approval.method }}</span>
        <code>{{ approval.path }}</code>
      </div>
      <div v-if="approval.operation_id" class="operation-id">
        {{ approval.operation_id }}
      </div>
    </div>

    <details v-if="hasPreview && !approval.recovery" class="approval-preview">
      <summary>
        <span
          ><el-icon><View /></el-icon> {{ t('ChatAIReviewChanges') }}</span
        >
        <el-icon><ArrowDown /></el-icon>
      </summary>
      <pre>{{ prettyPreview }}</pre>
    </details>

    <div class="approval-meta">
      <span v-if="!approval.recovery">
        <el-icon><Clock /></el-icon>
        {{ expired ? t('ChatAIApprovalExpired') : t('ChatAIApprovalExpires', { time: countdown }) }}
      </span>
      <span
        ><el-icon><CircleCheck /></el-icon> {{ t('ChatAIApprovalProtected') }}</span
      >
    </div>

    <div class="approval-actions">
      <button
        class="approval-button secondary"
        :disabled="processing"
        type="button"
        @click="emit('cancel')"
      >
        {{ approval.recovery ? t('ChatAICancelTask') : t('ChatAICancelExecution') }}
      </button>
      <button
        v-if="!approval.recovery"
        class="approval-button primary"
        :disabled="processing || expired"
        type="button"
        @click="emit('confirm')"
      >
        <el-icon v-if="processing" class="spin"><Loading /></el-icon>
        <el-icon v-else><Check /></el-icon>
        {{ processing ? t('ChatAIExecuting') : t('ChatAIConfirmExecution') }}
      </button>
    </div>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { ArrowDown, Check, CircleCheck, Clock, Loading, Lock, View } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  approval: {
    type: Object,
    required: true
  },
  processing: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])
const { t } = useI18n()
const now = ref(Date.now())
let timer = null

const expiresAt = computed(() => {
  if (!props.approval.expires_at) return 0
  const value = String(props.approval.expires_at).replace(' ', 'T')
  return new Date(value).getTime()
})
const expired = computed(() => Boolean(expiresAt.value && expiresAt.value <= now.value))
const countdown = computed(() => {
  if (!expiresAt.value) return '--:--'
  const seconds = Math.max(0, Math.floor((expiresAt.value - now.value) / 1000))
  const minutes = Math.floor(seconds / 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`
})
const hasPreview = computed(() => Object.keys(props.approval.preview || {}).length > 0)
const prettyPreview = computed(() => JSON.stringify(props.approval.preview || {}, null, 2))
const riskLevel = computed(() => {
  const value = String(props.approval.risk_level || 'write').toLowerCase()
  return ['read', 'write', 'dangerous'].includes(value) ? value : 'write'
})
const riskLabel = computed(() => {
  if (props.approval.recovery) return t('ChatAIWaitingApproval')
  const labels = {
    read: 'ChatAIRiskRead',
    write: 'ChatAIRiskWrite',
    dangerous: 'ChatAIRiskDangerous'
  }
  return t(labels[riskLevel.value])
})

onMounted(() => {
  timer = window.setInterval(() => (now.value = Date.now()), 1000)
})

onBeforeUnmount(() => {
  if (timer) window.clearInterval(timer)
})
</script>

<style lang="scss" scoped>
.approval-card {
  position: relative;
  width: min(100%, 620px);
  margin-top: 14px;
  padding: 17px;
  overflow: hidden;
  border: 1px solid rgb(213 150 53 / 23%);
  border-radius: var(--ai-radius-lg, 12px);
  background: #fffaf2;
  box-shadow: 0 4px 14px rgb(121 82 30 / 6%);

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 11px;
  }
}

.approval-icon {
  display: grid;
  width: 37px;
  height: 37px;
  flex: 0 0 37px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 9px;
  color: #a96815;
  background: #fff0d1;
  font-size: 17px;
}

.approval-title {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;

  strong {
    color: #55401f;
    font-size: 14px;
    font-weight: 720;
  }
}

.approval-eyebrow {
  color: #bd8a41;
  font-size: 10px;
  font-weight: 750;
  letter-spacing: 0.11em;
  text-transform: uppercase;
}

.risk-badge {
  padding: 4px 7px;
  border: 1px solid #f0d6a8;
  border-radius: 999px;
  color: #a56c1b;
  background: #fff5df;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;

  &.risk-read {
    border-color: #cfe8df;
    color: #2f7463;
    background: #eff9f6;
  }

  &.risk-dangerous {
    border-color: #f0c9ce;
    color: #b84f5e;
    background: #fff0f2;
  }
}

.approval-description {
  position: relative;
  margin: 12px 0;
  color: #79684e;
  font-size: 11px;
  line-height: 1.65;
}

.operation-card {
  position: relative;
  padding: 10px 11px;
  border: 1px solid rgb(92 75 48 / 8%);
  border-radius: var(--ai-radius-sm, 8px);
  background: rgb(255 255 255 / 74%);

  &__route {
    display: flex;
    align-items: center;
    gap: 9px;

    code {
      overflow: hidden;
      color: #5d5549;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.method {
  padding: 3px 6px;
  border-radius: 5px;
  color: #7f5a1d;
  background: #fce7be;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  font-weight: 800;
}

.operation-id {
  margin-top: 7px;
  overflow: hidden;
  color: #a29a8d;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.approval-preview {
  margin-top: 9px;
  overflow: hidden;
  border: 1px solid rgb(92 75 48 / 8%);
  border-radius: var(--ai-radius-sm, 8px);
  background: rgb(255 255 255 / 62%);

  summary {
    display: flex;
    min-height: 35px;
    align-items: center;
    justify-content: space-between;
    padding: 0 11px;
    color: #7c6d58;
    cursor: pointer;
    font-size: 10px;
    font-weight: 650;
    list-style: none;

    &:focus-visible {
      outline: 2px solid rgb(196 126 36 / 32%);
      outline-offset: -2px;
    }

    span {
      display: flex;
      align-items: center;
      gap: 6px;
    }

    > .el-icon {
      transition: transform 0.2s ease;
    }
  }

  &[open] summary > .el-icon {
    transform: rotate(180deg);
  }

  pre {
    max-height: 180px;
    margin: 0;
    padding: 10px 11px;
    overflow: auto;
    border-top: 1px solid rgb(92 75 48 / 7%);
    color: #675e51;
    background: rgb(246 240 228 / 55%);
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 10px;
    line-height: 1.6;
    white-space: pre-wrap;
  }
}

.approval-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin: 11px 2px 0;
  color: #aa9575;
  font-size: 10px;

  span {
    display: inline-flex;
    align-items: center;
    gap: 4px;
  }
}

.approval-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 14px;
}

.approval-button {
  display: inline-flex;
  height: 34px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 13px;
  border-radius: var(--ai-radius-sm, 8px);
  cursor: pointer;
  font-size: 10px;
  font-weight: 700;
  transition: all 0.18s ease;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }

  &:focus-visible {
    outline: 2px solid rgb(196 126 36 / 36%);
    outline-offset: 2px;
  }

  &.secondary {
    border: 1px solid #ead9bd;
    color: #7f6d52;
    background: rgb(255 255 255 / 75%);

    &:hover:not(:disabled) {
      background: #fff;
    }
  }

  &.primary {
    border: 1px solid #a96d1a;
    color: #fff;
    background: var(--el-color-warning, #f8ac59);

    &:hover:not(:disabled) {
      filter: brightness(0.94);
    }
  }
}

.is-expired {
  filter: saturate(0.65);
}

.spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 560px) {
  .approval-card {
    padding: 14px;
  }

  .approval-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }

  .approval-button {
    width: 100%;
  }
}
</style>
