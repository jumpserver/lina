<template>
  <el-dialog
    append-to-body
    destroy-on-close
    :model-value="modelValue"
    :title="t('ChatAIUsageStats')"
    width="min(720px, calc(100vw - 24px))"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="stats-toolbar">
      <span>{{ t('ChatAIStatsRange') }}</span>
      <el-select v-model="days" size="small" @change="load">
        <el-option :label="t('ChatAILastDays', { count: 7 })" :value="7" />
        <el-option :label="t('ChatAILastDays', { count: 30 })" :value="30" />
        <el-option :label="t('ChatAILastDays', { count: 90 })" :value="90" />
      </el-select>
    </div>

    <el-skeleton v-if="loading" :rows="6" animated />
    <div v-else class="stats-content">
      <div class="stats-grid">
        <article v-for="item in cards" :key="item.label" class="stat-card">
          <span>{{ item.label }}</span>
          <strong>{{ item.value }}</strong>
          <small v-if="item.hint">{{ item.hint }}</small>
        </article>
      </div>

      <section class="stats-section">
        <h4>{{ t('ChatAITopOperations') }}</h4>
        <el-table :data="stats.top_operations || []" max-height="280" size="small">
          <el-table-column
            min-width="360"
            prop="operation_id"
            :label="t('ChatAIOperation')"
            show-overflow-tooltip
          />
          <el-table-column align="right" prop="count" :label="t('Count')" width="100" />
        </el-table>
        <el-empty
          v-if="!(stats.top_operations || []).length"
          :description="t('ChatAINoStats')"
          :image-size="60"
        />
      </section>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

import { getChatAIStats } from '@/api/chatAi'
import { message } from '@/utils/vue/message'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const days = ref(30)
const loading = ref(false)
const stats = ref({ usage: {}, top_operations: [] })

function number(value) {
  return Number(value || 0).toLocaleString()
}

const cards = computed(() => {
  const usage = stats.value.usage || {}
  return [
    {
      label: t('ChatAITotalRuns'),
      value: number(usage.total),
      hint: t('ChatAIActiveRuns', {
        count: Number(usage.queued || 0) + Number(usage.running || 0)
      })
    },
    {
      label: t('ChatAICompletedRuns'),
      value: number(usage.completed),
      hint: t('ChatAIFailedRunsHint', { count: number(usage.failed) })
    },
    {
      label: t('ChatAITokenUsage'),
      value: number(Number(usage.input_tokens || 0) + Number(usage.output_tokens || 0)),
      hint: t('ChatAITokenSplit', {
        input: number(usage.input_tokens),
        output: number(usage.output_tokens)
      })
    },
    {
      label: t('ChatAIAPICalls'),
      value: number(usage.api_calls),
      hint: t('ChatAIAverageDuration', {
        count: number(Math.round(Number(usage.average_model_duration_ms || 0)))
      })
    }
  ]
})

async function load() {
  loading.value = true
  try {
    stats.value = await getChatAIStats(days.value)
  } catch (error) {
    message.error(
      error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
    )
  } finally {
    loading.value = false
  }
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  }
)
</script>

<style scoped lang="scss">
.stats-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 16px;
  color: #747a87;
  font-size: 12px;

  :deep(.el-select) {
    width: 130px;
  }
}

.stats-content {
  display: grid;
  gap: 20px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 10px;
}

.stat-card {
  min-width: 0;
  padding: 13px;
  border: 1px solid #e8eaef;
  border-radius: 10px;
  background: #fafbfc;

  span,
  small {
    display: block;
    overflow: hidden;
    color: #7d8390;
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    display: block;
    margin: 7px 0 4px;
    color: #252936;
    font-size: 22px;
  }
}

.stats-section {
  h4 {
    margin: 0 0 10px;
    color: #303542;
    font-size: 14px;
  }
}

@media (max-width: 720px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
