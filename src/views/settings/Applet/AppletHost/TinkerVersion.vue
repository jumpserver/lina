<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  row: {
    tinker_version?: string
    tinker_version_status?: string
    tinker_target_version?: string
    date_synced?: string
  }
}>()
const { t } = useI18n()
const status = computed(() => {
  if (!props.row.date_synced) return { type: 'info', label: 'TinkerNotDeployed' } as const
  const choices = {
    unknown: { type: 'warning', label: 'TinkerVersionUnknown' },
    unsupported: { type: 'danger', label: 'TinkerVersionUnsupported' },
    compatible: { type: 'info', label: 'TinkerVersionCompatible' },
    newer: { type: 'warning', label: 'TinkerVersionNewer' },
    ok: { type: 'success', label: 'TinkerVersionCurrent' }
  } as const
  return choices[props.row.tinker_version_status as keyof typeof choices] || choices.unknown
})
</script>

<template>
  <el-tooltip
    :content="t('TinkerRecommendedVersion', { version: row.tinker_target_version || '-' })"
  >
    <span class="tinker-version">
      <span>{{ row.tinker_version || '-' }}</span>
      <el-tag :type="status.type" size="small">{{ t(status.label) }}</el-tag>
    </span>
  </el-tooltip>
</template>

<style scoped>
.tinker-version {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
