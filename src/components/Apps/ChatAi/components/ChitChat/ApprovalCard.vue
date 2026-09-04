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

    <div v-if="previewSections.length && !approval.recovery" class="approval-changes">
      <div class="approval-changes__header">
        <span
          ><el-icon><View /></el-icon> {{ t('ChatAIReviewChanges') }}</span
        >
      </div>
      <section v-for="section in previewSections" :key="section.key">
        <h3>{{ section.label }}</h3>
        <dl>
          <template v-for="([key, value], index) in section.entries" :key="`${key}-${index}`">
            <dt>{{ fieldLabel(key) }}</dt>
            <dd>{{ formatPreviewValue(value) }}</dd>
          </template>
        </dl>
        <small v-if="section.total > section.entries.length">
          {{ t('ChatAIApprovalMoreFields', { count: section.total - section.entries.length }) }}
        </small>
      </section>
    </div>

    <p v-if="isPreviewTruncated && !approval.recovery" class="approval-preview-notice">
      {{ t('ChatAIApprovalPreviewTruncated') }}
    </p>

    <details v-if="!approval.recovery" class="approval-technical" :open="isPreviewTruncated">
      <summary>
        <span
          ><el-icon><View /></el-icon> {{ t('ChatAIApprovalTechnicalDetails') }}</span
        >
        <el-icon><ArrowDown /></el-icon>
      </summary>
      <div class="approval-technical__body">
        <div class="operation-card">
          <div class="operation-card__route">
            <span class="method">{{ approval.method }}</span>
            <code>{{ approval.path }}</code>
          </div>
          <div v-if="approval.operation_id" class="operation-id">
            {{ approval.operation_id }}
          </div>
        </div>
        <pre v-if="hasPreview">{{ prettyPreview }}</pre>
      </div>
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
const previewEntryLimit = 12

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
const preview = computed(() => props.approval.preview)
const hasPreview = computed(() => hasValue(preview.value))
const isPreviewTruncated = computed(() => {
  return Boolean(
    isPlainObject(preview.value) && preview.value.truncated === true && preview.value.preview
  )
})
const prettyPreview = computed(() => {
  try {
    return JSON.stringify(preview.value, null, 2) || String(preview.value || '')
  } catch {
    return String(preview.value || '')
  }
})
const previewSections = computed(() => {
  if (!hasPreview.value || isPreviewTruncated.value) return []

  const value = preview.value
  if (!isPlainObject(value)) {
    return [createPreviewSection('details', t('ChatAIApprovalChangeDetails'), value)]
  }

  const knownSections = [
    ['body', t('ChatAIApprovalChangeDetails')],
    ['path_params', t('ChatAIApprovalTarget')],
    ['query_params', t('ChatAIApprovalOptions')]
  ]
  const hasKnownStructure = knownSections.some(([key]) =>
    Object.prototype.hasOwnProperty.call(value, key)
  )
  if (!hasKnownStructure) {
    return [createPreviewSection('details', t('ChatAIApprovalChangeDetails'), value)]
  }
  return knownSections
    .filter(([key]) => hasValue(value[key]))
    .map(([key, label]) => createPreviewSection(key, label, value[key]))
})
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

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value))
}

function hasValue(value) {
  if (value === null || value === undefined || value === '') return false
  if (Array.isArray(value)) return value.length > 0
  if (isPlainObject(value)) return Object.keys(value).length > 0
  return true
}

function createPreviewSection(key, label, value) {
  let entries
  if (isPlainObject(value)) entries = Object.entries(value)
  else if (Array.isArray(value)) entries = [['items', value]]
  else entries = [['value', value]]
  return {
    key,
    label,
    total: entries.length,
    entries: entries.slice(0, previewEntryLimit)
  }
}

function fieldLabel(value) {
  const key = String(value || '')
  const known = {
    id: 'ID',
    name: t('ChatAIFieldName'),
    address: t('ChatAIFieldAddress'),
    username: t('ChatAIFieldUsername'),
    status: t('ChatAIFieldStatus'),
    is_active: t('ChatAIFieldActive'),
    date_created: t('ChatAIFieldDateCreated'),
    date_updated: t('ChatAIFieldDateUpdated'),
    org_name: t('ChatAIFieldOrganization'),
    platform: t('ChatAIFieldPlatform'),
    node: t('Node'),
    nodes: t('Nodes')
  }
  if (known[key]) return known[key]
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (character) => character.toUpperCase())
}

function formatPreviewValue(value) {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'boolean') return value ? t('ChatAIYes') : t('ChatAINo')
  let formatted
  if (typeof value === 'string' || typeof value === 'number') {
    formatted = String(value)
  } else if (
    Array.isArray(value) &&
    value.every((item) => item === null || ['string', 'number', 'boolean'].includes(typeof item))
  ) {
    formatted =
      value
        .map((item) => {
          if (item === null || item === '') return '—'
          if (typeof item === 'boolean') return item ? t('ChatAIYes') : t('ChatAINo')
          return String(item)
        })
        .join(', ') || '—'
  } else {
    try {
      formatted = JSON.stringify(value)
    } catch {
      formatted = String(value)
    }
  }
  return formatted.length > 240 ? `${formatted.slice(0, 239)}…` : formatted
}

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
  padding: 15px;
  overflow: hidden;
  border: 1px solid rgb(213 150 53 / 23%);
  border-radius: var(--ai-radius-lg, 12px);
  background: #fffaf2;
  box-shadow: 0 4px 14px rgb(121 82 30 / 6%);

  &__header {
    position: relative;
    display: flex;
    align-items: center;
    gap: 9px;
  }
}

.approval-icon {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border: 1px solid rgb(255 255 255 / 80%);
  border-radius: 9px;
  color: #a96815;
  background: #fff0d1;
  font-size: 15px;
}

.approval-title {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 2px;

  strong {
    color: #55401f;
    font-size: 13px;
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

.approval-changes {
  overflow: hidden;
  border: 1px solid rgb(151 111 48 / 13%);
  border-radius: var(--ai-radius-sm, 8px);
  background: rgb(255 255 255 / 82%);

  &__header {
    display: flex;
    min-height: 36px;
    align-items: center;
    padding: 0 11px;
    border-bottom: 1px solid rgb(151 111 48 / 10%);
    color: #5c4b31;
    background: rgb(255 249 237 / 76%);
    font-size: 11px;
    font-weight: 700;

    span {
      display: inline-flex;
      align-items: center;
      gap: 6px;
    }
  }

  > section {
    padding: 10px 11px;

    + section {
      border-top: 1px solid rgb(151 111 48 / 9%);
    }
  }

  h3 {
    margin: 0 0 7px;
    color: #a17636;
    font-size: 10px;
    font-weight: 700;
  }

  dl {
    display: grid;
    margin: 0;
    grid-template-columns: minmax(94px, 0.42fr) minmax(0, 1fr);
    gap: 6px 12px;
  }

  dt,
  dd {
    min-width: 0;
    font-size: 11px;
    line-height: 1.5;
  }

  dt {
    overflow: hidden;
    color: #8d806e;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  dd {
    margin: 0;
    color: #453d33;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }

  small {
    display: block;
    margin-top: 7px;
    color: #a08d70;
    font-size: 9px;
  }
}

.approval-preview-notice {
  margin: 0;
  padding: 10px 11px;
  border: 1px solid rgb(213 150 53 / 22%);
  border-radius: var(--ai-radius-sm, 8px);
  color: #8d652a;
  background: rgb(255 244 222 / 78%);
  font-size: 10px;
  line-height: 1.55;
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

.approval-technical {
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

  &__body {
    padding: 9px;
    border-top: 1px solid rgb(92 75 48 / 7%);
    background: rgb(246 240 228 / 38%);
  }

  pre {
    max-height: 180px;
    margin: 8px 0 0;
    padding: 9px 10px;
    overflow: auto;
    border: 1px solid rgb(92 75 48 / 7%);
    border-radius: var(--ai-radius-xs, 6px);
    color: #675e51;
    background: rgb(255 255 255 / 72%);
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
  margin-top: 12px;
}

.approval-button {
  display: inline-flex;
  height: 30px;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 0 11px;
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
