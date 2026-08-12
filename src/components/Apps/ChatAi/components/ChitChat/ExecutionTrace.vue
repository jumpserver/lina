<template>
  <div v-if="items.length" :class="['execution-trace', { 'is-open': opened }]">
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
      <span class="trace-count">{{ items.length }}</span>
      <el-icon class="summary-arrow"><ArrowDown /></el-icon>
    </button>

    <transition name="trace-slide">
      <div v-show="opened" class="execution-trace__details">
        <div
          v-for="(item, index) in items"
          :key="item.id"
          :class="['trace-item', `is-${item.status}`]"
        >
          <span class="trace-item__rail">
            <span class="trace-item__dot">
              <el-icon v-if="item.status === 'running'"><Loading /></el-icon>
              <el-icon v-else-if="item.status === 'failed'"><Warning /></el-icon>
              <el-icon v-else-if="item.status === 'approval'"><Lock /></el-icon>
              <el-icon v-else><Check /></el-icon>
            </span>
            <span v-if="index < items.length - 1" class="trace-item__line" />
          </span>
          <span class="trace-item__content">
            <strong>{{ itemTitle(item) }}</strong>
            <small>{{ itemDescription(item) }}</small>
            <span v-if="item.data?.status_code" class="status-code">
              HTTP {{ item.data.status_code }}
            </span>
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
const running = computed(() => props.items.some((item) => item.status === 'running'))
const failed = computed(() => props.items.some((item) => item.status === 'failed'))
const opened = ref(props.active || failed.value)
let collapseTimer = null

const summaryTitle = computed(() => {
  if (failed.value) return t('ChatAIExecutionIssue')
  if (running.value || props.active) return t('ChatAIWorking')
  return t('ChatAIExecutionComplete')
})

const summaryDescription = computed(() => {
  const current = [...props.items].reverse().find((item) => item.status === 'running')
  if (current) return itemTitle(current)
  return t('ChatAIExecutionSummary', { count: props.items.length })
})

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
})

function toggleOpened() {
  if (collapseTimer) window.clearTimeout(collapseTimer)
  collapseTimer = null
  opened.value = !opened.value
}

function itemTitle(item) {
  if (item.type === 'agent_plan') return t('ChatAIPlanReady')
  if (item.type === 'api_search') {
    return item.status === 'running'
      ? t('ChatAISearchingCapabilities')
      : t('ChatAICapabilitiesFound')
  }
  if (item.type === 'web_search') {
    if (item.status === 'failed') return t('ChatAIWebSearchFailed')
    return item.status === 'running' ? t('ChatAIWebSearching') : t('ChatAIWebSearchComplete')
  }
  if (item.type === 'api_call') {
    if (item.status === 'approval') return t('ChatAIWaitingApproval')
    if (item.status === 'failed') return t('ChatAICallFailed')
    if (item.status === 'completed') return t('ChatAICallComplete')
    return item.data?.summary || t('ChatAICallingCapability')
  }
  if (item.type === 'error') return t('ChatAIExecutionIssue')
  return t('ChatAIWorking')
}

function itemDescription(item) {
  if (item.type === 'agent_plan') {
    return t('ChatAIPlanDescription', {
      steps: item.data?.max_steps || 0,
      calls: item.data?.max_api_calls || 0
    })
  }
  if (item.type === 'api_search') {
    if (item.status === 'running') return item.data?.query || t('ChatAISearchingCapabilities')
    return t('ChatAICapabilityCount', { count: item.data?.operationCount || 0 })
  }
  if (item.type === 'web_search') {
    if (item.status === 'running') return item.data?.query || t('ChatAIWebSearching')
    if (item.status === 'failed') return item.data?.error || t('ChatAIWebSearchFailed')
    return t('ChatAIWebSourceCount', { count: item.data?.sourceCount || 0 })
  }
  if (item.type === 'api_call') {
    const method = item.data?.method || ''
    const path = item.data?.path || item.data?.operation_id || ''
    return [method, path].filter(Boolean).join(' · ')
  }
  if (item.type === 'error') return item.data?.detail || item.data?.code || ''
  return ''
}
</script>

<style lang="scss" scoped>
.execution-trace {
  max-width: 620px;
  margin: 10px 0 4px;
  overflow: hidden;
  border: 1px solid var(--ai-border, #e9ecef);
  border-radius: var(--ai-radius-md, 10px);
  background: var(--ai-surface-muted, #f7f9f8);

  &__summary {
    display: flex;
    width: 100%;
    min-height: 52px;
    align-items: center;
    gap: 10px;
    padding: 9px 11px;
    border: 0;
    color: #4b5067;
    background: transparent;
    cursor: pointer;
    text-align: left;
    transition: background 0.16s ease;

    &:hover {
      background: var(--ai-surface-hover, #f1f7f5);
    }

    &:focus-visible {
      outline: 2px solid rgb(26 179 148 / 38%);
      outline-offset: -2px;
    }
  }

  &__details {
    padding: 2px 14px 12px;
    border-top: 1px solid rgb(78 84 118 / 7%);
  }
}

.trace-state {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
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
  min-height: 44px;
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
}

.status-code {
  width: fit-content;
  margin-top: 2px;
  padding: 2px 5px;
  border-radius: 5px;
  color: #7d8396;
  background: #eceef3;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
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
