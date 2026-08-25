<template>
  <div v-if="displayedItems.length" :class="['execution-trace', { 'is-open': opened }]">
    <button
      class="execution-trace__summary"
      type="button"
      :aria-expanded="opened"
      @click="toggleOpened"
    >
      <span :class="['trace-state', { 'is-running': running }]">
        <el-icon v-if="running"><Loading /></el-icon>
        <el-icon v-else><CircleCheck /></el-icon>
      </span>
      <span class="summary-copy">
        <strong>{{ summaryTitle }}</strong>
        <small>{{ summaryDescription }}</small>
      </span>
      <span class="trace-count">{{ displayedItems.length }}</span>
      <el-icon class="summary-arrow"><ArrowDown /></el-icon>
    </button>

    <transition name="trace-slide">
      <div v-show="opened" class="execution-trace__details">
        <div
          v-for="(item, index) in displayedItems"
          :key="item.id"
          :class="['trace-item', `is-${item.type}`, `is-${item.status}`]"
        >
          <span class="trace-item__rail">
            <span class="trace-item__dot">
              <el-icon v-if="item.status === 'running'"><Loading /></el-icon>
              <el-icon v-else-if="item.status === 'failed'"><Warning /></el-icon>
              <el-icon v-else-if="item.status === 'approval'"><Lock /></el-icon>
              <el-icon v-else><Check /></el-icon>
            </span>
            <span v-if="index < displayedItems.length - 1" class="trace-item__line" />
          </span>
          <span class="trace-item__content">
            <span class="trace-item__title">
              <strong>{{ itemTitle(item) }}</strong>
              <span v-if="item.count > 1" class="trace-item__count">×{{ item.count }}</span>
            </span>
            <small v-if="itemDescription(item)">{{ itemDescription(item) }}</small>
          </span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDown, Check, CircleCheck, Loading, Lock, Warning } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  },
  active: {
    type: Boolean,
    default: false
  }
})

const { t } = useI18n()
const displayedItems = computed(() => {
  const result = []
  for (const sourceItem of props.items) {
    const item = { ...sourceItem, data: { ...sourceItem.data }, count: 1 }
    if (item.type !== 'api_call') {
      result.push(item)
      continue
    }

    const key = item.data?.operation_id || item.data?.summary || item.id
    const existingIndex = result.findIndex((entry) => entry._groupKey === key)
    if (existingIndex < 0) {
      result.push({ ...item, _groupKey: key })
      continue
    }

    const existing = result.splice(existingIndex, 1)[0]
    result.push({
      ...existing,
      id: item.id,
      status: mergedStatus(existing.status, item.status),
      data: { ...existing.data, ...item.data },
      count: existing.count + 1,
      _groupKey: key
    })
  }
  return result
})
const running = computed(() => displayedItems.value.some((item) => item.status === 'running'))
const failed = computed(() => displayedItems.value.some((item) => item.status === 'failed'))
const opened = ref(props.active || failed.value)
const clock = ref(Date.now())
let collapseTimer = null
let clockTimer = null

const summaryTitle = computed(() => {
  if (running.value || props.active) return t('ChatAIWorking')
  if (failed.value) return t('ChatAIExecutionIssue')
  return t('ChatAIExecutionComplete')
})

const summaryDescription = computed(() => {
  const current = [...props.items].reverse().find((item) => item.status === 'running')
  if (current) {
    const title = itemTitle(current)
    return elapsedLabel.value ? `${title} · ${elapsedLabel.value}` : title
  }
  const summary = t('ChatAIExecutionSummary', { count: displayedItems.value.length })
  return elapsedLabel.value ? `${summary} · ${elapsedLabel.value}` : summary
})

const elapsedLabel = computed(() => {
  const timestamps = props.items
    .map((item) => Number(item.timestamp))
    .filter((value) => Number.isFinite(value) && value > 0)
  if (!timestamps.length) return ''
  const startedAt = Math.min(...timestamps)
  const endedAt = props.active || running.value ? clock.value : Math.max(...timestamps)
  return formatDuration(Math.max(endedAt - startedAt, 1000))
})

watch(
  [() => props.active, running],
  ([active, hasRunning]) => {
    if (clockTimer) window.clearInterval(clockTimer)
    clockTimer = null
    if (active || hasRunning) {
      clock.value = Date.now()
      clockTimer = window.setInterval(() => (clock.value = Date.now()), 1000)
    }
  },
  { immediate: true }
)

watch(
  () => props.active,
  (active) => {
    if (collapseTimer) window.clearTimeout(collapseTimer)
    if (active) opened.value = true
    else if (!failed.value) collapseTimer = window.setTimeout(() => (opened.value = false), 3200)
  }
)

watch(failed, (hasFailed) => {
  if (hasFailed) {
    if (collapseTimer) window.clearTimeout(collapseTimer)
    opened.value = true
  }
})

onBeforeUnmount(() => {
  if (collapseTimer) window.clearTimeout(collapseTimer)
  if (clockTimer) window.clearInterval(clockTimer)
})

function toggleOpened() {
  if (collapseTimer) window.clearTimeout(collapseTimer)
  collapseTimer = null
  opened.value = !opened.value
}

function mergedStatus(previous, current) {
  return current || previous || 'completed'
}

function formatDuration(milliseconds) {
  const totalSeconds = Math.max(1, Math.round(milliseconds / 1000))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = [minutes, seconds].map((value) => String(value).padStart(2, '0'))
  if (hours) parts.unshift(String(hours))
  return parts.join(':')
}

function itemTitle(item) {
  if (item.type === 'progress') return item.data?.content || t('ChatAIWorking')
  if (item.type === 'api_search') {
    if (item.data?.action) return item.data.action
    return item.status === 'running'
      ? t('ChatAISearchingCapabilities')
      : t('ChatAICapabilitiesFound')
  }
  if (item.type === 'web_search') {
    if (item.data?.action) return item.data.action
    if (item.status === 'failed') return t('ChatAIWebSearchFailed')
    return item.status === 'running' ? t('ChatAIWebSearching') : t('ChatAIWebSearchComplete')
  }
  if (item.type === 'api_call') {
    if (item.data?.action) return item.data.action
    const summary = readableSummary(item.data?.summary)
    if (summary) return summary
    if (item.status === 'approval') return t('ChatAIWaitingApproval')
    if (item.status === 'failed') return t('ChatAICallFailed')
    if (item.status === 'completed') return t('ChatAICallComplete')
    return item.data?.summary || t('ChatAICallingCapability')
  }
  if (item.type === 'error') return t('ChatAIExecutionIssue')
  return t('ChatAIWorking')
}

function readableSummary(value) {
  const summary = String(value || '').trim()
  if (!summary) return ''
  if (/^[a-z0-9]+(?:_[a-z0-9]+)+$/i.test(summary)) return ''
  if (/^(GET|POST|PUT|PATCH)\s+\//i.test(summary)) return ''
  return summary
}

function itemDescription(item) {
  if (item.type === 'progress') return ''
  if (item.type === 'api_search') {
    if (item.status === 'running') return t('ChatAISearchingCapabilities')
    return t('ChatAICapabilityCount', { count: item.data?.operationCount || 0 })
  }
  if (item.type === 'web_search') {
    if (item.status === 'running') return item.data?.query || t('ChatAIWebSearching')
    if (item.status === 'failed') return item.data?.error || t('ChatAIWebSearchFailed')
    return t('ChatAIWebSourceCount', { count: item.data?.sourceCount || 0 })
  }
  if (item.type === 'api_call') {
    if (item.status === 'approval') return t('ChatAIWaitingApproval')
    if (item.status === 'failed') return t('ChatAICallFailed')
    if (item.status === 'running') return t('ChatAICallingCapability')
    return t('ChatAICallComplete')
  }
  if (item.type === 'error') return item.data?.detail || item.data?.code || ''
  return ''
}
</script>

<style lang="scss" scoped>
.execution-trace {
  max-width: 620px;
  margin: 10px 0 4px;

  &__summary {
    display: flex;
    width: 100%;
    min-height: 36px;
    align-items: center;
    gap: 10px;
    padding: 5px 0;
    border: 0;
    color: #4b5067;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.16s ease;

    &:hover {
      color: var(--ai-primary-dark, #148f76);
    }

    &:focus-visible {
      outline: 2px solid rgb(26 179 148 / 38%);
      outline-offset: -2px;
    }
  }

  &__details {
    padding: 2px 0 8px 9px;
  }
}

.trace-state {
  display: grid;
  width: 24px;
  height: 24px;
  flex: 0 0 24px;
  place-items: center;
  border-radius: var(--ai-radius-sm, 8px);
  color: var(--ai-primary-dark, #148f76);
  background: var(--ai-primary-light, #e8f7f3);

  &.is-running {
    color: var(--ai-primary-dark, #148f76);
    background: var(--ai-primary-light, #e8f7f3);

    .el-icon {
      animation: spin 1.1s linear infinite;
    }
  }
}

.summary-copy {
  display: flex;
  min-width: 0;
  flex: 1;
  flex-direction: column;
  gap: 3px;

  strong {
    font-size: 12px;
    font-weight: 680;
  }

  small {
    overflow: hidden;
    color: #7c7c7c;
    font-size: 10px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.trace-count {
  display: grid;
  min-width: 20px;
  height: 20px;
  place-items: center;
  border-radius: 999px;
  color: #767c91;
  background: rgb(83 88 118 / 7%);
  font-size: 10px;
}

.summary-arrow {
  color: #999eb0;
  transition: transform 0.2s ease;
}

.is-open .summary-arrow {
  transform: rotate(180deg);
}

.trace-item {
  display: flex;
  min-height: 38px;
  gap: 10px;
  padding-top: 10px;

  &__rail {
    position: relative;
    display: flex;
    width: 20px;
    flex: 0 0 20px;
    justify-content: center;
  }

  &__dot {
    z-index: 1;
    display: grid;
    width: 20px;
    height: 20px;
    place-items: center;
    border: 1px solid #dfe2eb;
    border-radius: 50%;
    color: #5ca998;
    background: #fff;
    font-size: 10px;
  }

  &__line {
    position: absolute;
    z-index: 0;
    top: 20px;
    bottom: -12px;
    left: 9px;
    width: 1px;
    background: #e3e5ec;
  }

  &__content {
    display: flex;
    min-width: 0;
    flex: 1;
    padding-bottom: 5px;
    flex-direction: column;
    gap: 3px;

    > small {
      font-family: inherit;
    }

    strong {
      color: #5c6175;
      font-size: 11px;
      font-weight: 650;
    }

    small {
      overflow: hidden;
      color: #7c7c7c;
      font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
      font-size: 10px;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  &__title {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  &__count {
    color: #999eb0;
    font-size: 10px;
  }

  &.is-running {
    .trace-item__dot {
      color: var(--ai-primary-dark, #148f76);
      border-color: var(--ai-primary-light-2, #d1efe8);
      background: var(--ai-primary-light, #e8f7f3);

      .el-icon {
        animation: spin 1.1s linear infinite;
      }
    }
  }

  &.is-failed .trace-item__dot {
    color: #d65c69;
    border-color: #f1cdd2;
    background: #fff1f2;
  }

  &.is-approval .trace-item__dot {
    color: #bd7a27;
    border-color: #f0d4ab;
    background: #fff7e8;
  }

  &.is-progress {
    min-height: 48px;
    padding-top: 12px;

    .trace-item__dot {
      width: 7px;
      height: 7px;
      margin-top: 7px;
      border: 0;
      background: #a9d9cd;

      .el-icon {
        display: none;
      }
    }

    .trace-item__content strong {
      color: #454a5e;
      font-size: 12px;
      font-weight: 500;
      line-height: 1.65;
    }
  }
}

.trace-slide-enter-active,
.trace-slide-leave-active {
  transition: all 0.2s ease;
}

.trace-slide-enter-from,
.trace-slide-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation: none !important;
    transition: none !important;
  }
}
</style>
