<template>
  <Select2
    v-if="options.length && !loading && !failed"
    v-bind="$attrs"
    :model-value="modelValue"
    :options="options"
    :disabled="disabled"
    :multiple="false"
    :clearable="false"
    :validate-event="false"
    @update:model-value="$emit('update:modelValue', $event)"
    @change="$emit('change', $event)"
  />
  <el-input
    v-else
    class="workflow-status"
    model-value=""
    readonly
    :validate-event="false"
    :placeholder="statusText"
    :title="statusText"
    :aria-label="`${$t('TicketFlow')}: ${statusText}`"
    :aria-busy="loading"
  >
    <template #suffix>
      <el-icon v-if="loading" class="is-loading"><Loading /></el-icon>
      <el-button
        v-else
        link
        :title="$t('TicketWorkflowReload')"
        :aria-label="$t('TicketWorkflowReload')"
        @click="$emit('retry')"
      >
        <el-icon><Refresh /></el-icon>
      </el-button>
    </template>
  </el-input>
</template>

<script>
import Select2 from '@/components/Form/FormFields/Select2'

export default {
  components: { Select2 },
  inheritAttrs: false,
  props: {
    modelValue: { type: String, default: '' },
    options: { type: Array, default: () => [] },
    loading: Boolean,
    failed: Boolean,
    disabled: Boolean
  },
  emits: ['update:modelValue', 'change', 'retry'],
  computed: {
    statusText() {
      return this.$t(
        this.loading
          ? 'TicketWorkflowLoading'
          : this.failed
            ? 'TicketWorkflowFailed'
            : 'TicketWorkflowEmpty'
      )
    }
  }
}
</script>

<style scoped>
.workflow-status :deep(.el-input__inner::placeholder) {
  color: var(--el-text-color-regular);
}
.workflow-status :deep(.el-button:focus-visible) {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
</style>
