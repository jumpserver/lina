<template>
  <el-checkbox-group :model-value="iValue" @update:model-value="handleChange">
    <el-checkbox v-for="item in options" :key="item.value" :label="item.value" :value="item.value">
      {{ item.label }}
    </el-checkbox>
  </el-checkbox-group>
</template>

<script>
import { normalizeClipboardOperationValues } from '../const'

export default {
  name: 'ClipboardOperationsCheckbox',
  props: {
    value: {
      type: [Array, Number, Object],
      default: () => []
    },
    modelValue: {
      type: [Array, Number, Object],
      default: undefined
    }
  },
  emits: ['change', 'input', 'update:modelValue', 'update:model-value'],
  computed: {
    options() {
      return [
        { label: this.$t('Copy'), value: 'copy' },
        { label: this.$t('Paste'), value: 'paste' }
      ]
    },
    iValue() {
      return normalizeClipboardOperationValues(this.modelValue ?? this.value)
    }
  },
  methods: {
    handleChange(value) {
      const operations = normalizeClipboardOperationValues(value)
      this.$emit('input', operations)
      this.$emit('update:modelValue', operations)
      this.$emit('update:model-value', operations)
      this.$emit('change', operations)
    }
  }
}
</script>
