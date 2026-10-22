<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  row?: { source?: number | { value?: number | null } | null }
}>()

const source = computed(() => {
  const value = props.row?.source
  const sourceValue = typeof value === 'object' ? value?.value : value
  return sourceValue ?? 0
})
</script>

<template>
  <el-tag v-if="source === 1" type="primary" size="small">{{ $t('ChatAIName') }}</el-tag>
  <span v-else>{{ source === 0 ? $t('ManualExecution') : '-' }}</span>
</template>
