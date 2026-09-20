<template>
  <el-radio-group
    :aria-label="$t('CommandMatchMode')"
    :model-value="currentValue"
    @update:model-value="handleChange"
  >
    <el-radio value="command">{{ $t('Command') }}</el-radio>
    <el-radio value="regex">{{ $t('Regex') }}</el-radio>
  </el-radio-group>
</template>

<script>
export default {
  name: 'CommandMatchMode',
  props: {
    value: {
      type: String,
      default: 'command'
    },
    modelValue: {
      type: String,
      default: undefined
    }
  },
  emits: ['input', 'change', 'update:modelValue', 'update:model-value'],
  computed: {
    currentValue() {
      return this.modelValue ?? this.value ?? 'command'
    }
  },
  methods: {
    emitValue(value) {
      this.$emit('input', value)
      this.$emit('update:modelValue', value)
      this.$emit('update:model-value', value)
      this.$emit('change', value)
    },
    handleChange(value) {
      this.emitValue(value)
    }
  }
}
</script>
