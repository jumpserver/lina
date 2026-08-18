<template>
  <el-switch
    v-bind="switchAttrs"
    :model-value="iValue"
    :class="type"
    inactive-color="#dcdfe6"
    @update:model-value="onInput"
  />
</template>

<script>
export default {
  name: 'Switcher', // 不能叫 Switch，否则会和 js 关键字冲突
  inheritAttrs: false,
  props: {
    type: {
      type: String,
      default: 'primary'
    },
    modelValue: {
      type: [Boolean, String],
      default: undefined
    },
    value: {
      type: [Boolean, String],
      default: undefined
    }
  },
  emits: ['input', 'update:modelValue', 'update:model-value'],
  computed: {
    switchAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.modelValue
      delete attrs['model-value']
      delete attrs.value
      return attrs
    },
    iValue() {
      const raw = this.modelValue !== undefined ? this.modelValue : this.value
      return !!raw
    }
  },
  methods: {
    onInput(newValue) {
      this.$emit('update:modelValue', newValue)
      this.$emit('update:model-value', newValue)
      this.$emit('input', newValue)
    }
  }
}
</script>
