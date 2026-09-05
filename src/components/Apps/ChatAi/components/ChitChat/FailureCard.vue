<template>
  <section class="failure-card" :class="{ 'is-cancelled': cancelled }" role="status">
    <header>
      <el-icon><Warning /></el-icon>
      <strong>{{ cancelled ? t('ChatAIFailureStopped') : stageLabel }}</strong>
    </header>
    <p>{{ text.reason }}</p>
    <p v-if="failure.failed_step" class="failure-card__location">
      <strong>{{ t('ChatAIFailureStoppedAt') }}</strong> {{ stepLabel(failure.failed_step) }}
    </p>
    <div v-if="failure.completed_steps.length" class="failure-card__steps">
      <strong>{{ t('ChatAIFailureCompletedSteps') }}</strong>
      <ul>
        <li v-for="(step, index) in failure.completed_steps" :key="index">{{ stepLabel(step) }}</li>
      </ul>
    </div>
    <div v-if="failure.uncertain_steps.length" class="failure-card__steps">
      <strong>{{ t('ChatAIFailureUncertainSteps') }}</strong>
      <ul>
        <li v-for="(step, index) in failure.uncertain_steps" :key="index">{{ stepLabel(step) }}</li>
      </ul>
    </div>
    <p class="failure-card__next">{{ text.action }}</p>
    <button v-if="canRetry && !cancelled" type="button" @click="emit('retry')">
      <el-icon><RefreshRight /></el-icon>{{ t('Retry') }}
    </button>
  </section>
</template>

<script setup>
import { computed } from 'vue'
import { RefreshRight, Warning } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { failureText } from '../../utils/failurePresentation'

const props = defineProps({
  failure: { type: Object, required: true },
  cancelled: { type: Boolean, default: false },
  canRetry: { type: Boolean, default: false }
})
const emit = defineEmits(['retry'])
const { t } = useI18n()
const text = computed(() => failureText(props.failure, t))
const stageLabel = computed(() => {
  const labels = {
    model: 'ChatAIFailureStageModel',
    tool: 'ChatAIFailureStageTool',
    approval: 'ChatAIFailureStageApproval',
    preparing: 'ChatAIFailureStagePreparing',
    interrupted: 'ChatAIFailureStageInterrupted'
  }
  return t(labels[props.failure.stage] || labels.interrupted)
})

function stepLabel(step) {
  if (
    String(step.tool_name || '')
      .split('.')
      .at(-1) === 'search_core_api'
  ) {
    return t('ChatAIFailureStepSearch')
  }
  const method = String(step.method || '').toUpperCase()
  const actions = {
    GET: 'ChatAIFailureStepRead',
    HEAD: 'ChatAIFailureStepRead',
    OPTIONS: 'ChatAIFailureStepRead',
    POST: 'ChatAIFailureStepOperation',
    PUT: 'ChatAIFailureStepUpdate',
    PATCH: 'ChatAIFailureStepUpdate',
    DELETE: 'ChatAIFailureStepDelete'
  }
  const resourceKey = {
    assets: 'ChatAIFailureResourceAssets',
    accounts: 'ChatAIFailureResourceAccounts',
    users: 'ChatAIFailureResourceUsers',
    perms: 'ChatAIFailureResourcePermissions',
    tickets: 'ChatAIFailureResourceTickets',
    terminal: 'ChatAIFailureResourceSessions'
  }[String(step.operation_id || '').split('_')[0]]
  const resource = t(resourceKey || 'ChatAIFailureResourcePlatform')
  const operation = String(step.operation_id || '')
  const suffixActions = [
    ['partial_update', 'ChatAIFailureStepUpdate'],
    ['update', 'ChatAIFailureStepUpdate'],
    ['create', 'ChatAIFailureStepCreate'],
    ['destroy', 'ChatAIFailureStepDelete'],
    ['list', 'ChatAIFailureStepRead'],
    ['retrieve', 'ChatAIFailureStepRead']
  ]
  const operationAction = suffixActions.find(([suffix]) => operation.endsWith(`_${suffix}`))?.[1]
  return t(
    operationAction ||
      actions[method] ||
      (step.read_only === true ? 'ChatAIFailureStepRead' : 'ChatAIFailureStepOperation'),
    { resource }
  )
}
</script>

<style lang="scss" scoped>
.failure-card {
  display: grid;
  gap: 9px;
  margin-top: 12px;
  padding: 12px 14px;
  border: 1px solid #ecd7bc;
  border-radius: 10px;
  color: #705538;
  background: #fffaf3;
  font-size: 12px;
  line-height: 1.6;

  &.is-cancelled {
    border-color: #e2e5e9;
    color: #606a76;
    background: #f8fafb;
  }

  header,
  button {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  p,
  ul {
    margin: 0;
  }
  ul {
    padding-left: 20px;
  }

  &__steps strong {
    font-size: 11px;
  }
  &__next {
    font-weight: 600;
  }

  button {
    justify-self: start;
    padding: 5px 10px;
    border: 1px solid currentColor;
    border-radius: 6px;
    color: inherit;
    background: transparent;
    cursor: pointer;
  }

  button:focus-visible {
    outline: 2px solid var(--ai-primary, #1ab394);
    outline-offset: 2px;
  }
}
</style>
