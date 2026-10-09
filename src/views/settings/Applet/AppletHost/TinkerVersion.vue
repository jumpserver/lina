<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps<{
  row: {
    tinker_version?: string
    tinker_version_status?: string
  }
}>()
const { t } = useI18n()
const version = computed(() => props.row.tinker_version?.trim() || '')
const updateHint = computed(() => {
  if (!version.value) return t('TinkerVersionNotReportedHelp')
  if (props.row.tinker_version_status === 'unsupported') return t('TinkerVersionTooLowHelp')
  if (!['compatible', 'newer', 'ok'].includes(props.row.tinker_version_status || '')) {
    return t('TinkerVersionUnknownHelp')
  }
  return ''
})
</script>

<template>
  <span class="tinker-version">
    <span>{{ version || '—' }}</span>
    <el-tooltip v-if="updateHint" :content="updateHint">
      <el-tag type="warning" size="small">{{ t('TinkerVersionUnsupported') }}</el-tag>
    </el-tooltip>
  </span>
</template>

<style scoped>
.tinker-version {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
