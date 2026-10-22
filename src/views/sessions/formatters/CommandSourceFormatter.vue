<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<{
  row?: { source?: string | { value?: string } | null }
}>()

const source = computed(() => {
  const value = props.row?.source
  return typeof value === 'object' ? value?.value : value
})
</script>

<template>
  <el-tag v-if="source === 'ai'" type="primary" size="small">{{ $t('ChatAIName') }}</el-tag>
  <span v-else>{{ source === 'manual' ? $t('ManualExecution') : $t('Unknown') }}</span>
</template>
