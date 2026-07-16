<template>
  <el-cascader
    v-bind="$attrs"
    :disabled="disabled"
    :model-value="iValue"
    :options="options"
    :placeholder="iPlaceholder"
    :props="cascaderProps"
    class="account-backup-asset-type-cascader jms-input-spacing"
    clearable
    filterable
    style="width: 100%"
    @change="handleChange"
    @update:model-value="handleUpdate"
  />
</template>

<script>
export default {
  name: 'AssetTypeCascader',
  inheritAttrs: false,
  props: {
    value: {
      type: Array,
      default: () => []
    },
    modelValue: {
      type: Array,
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    placeholder: {
      type: String,
      default: ''
    }
  },
  emits: ['change', 'input', 'update:modelValue', 'update:model-value'],
  data() {
    return {
      options: [],
      cascaderProps: {
        multiple: true,
        emitPath: false,
        label: 'label',
        value: 'value',
        children: 'children'
      }
    }
  },
  computed: {
    iPlaceholder() {
      return this.placeholder || this.$t('PleaseSelect')
    },
    iValue() {
      const value = this.modelValue !== undefined ? this.modelValue : this.value
      return Array.isArray(value) ? value : []
    }
  },
  mounted() {
    this.loadOptions()
  },
  methods: {
    async loadOptions() {
      const resp = await this.$axios.get('/api/v1/assets/categories/')
      const categories = Array.isArray(resp) ? resp : resp?.results || []
      this.options = categories.map((category) => ({
        label: category.label,
        value: category.value,
        children: (category.types || []).map((type) => ({
          label: type.label,
          value: type.value
        }))
      }))
    },
    handleUpdate(value) {
      const payload = Array.isArray(value) ? value : []
      this.$emit('input', payload)
      this.$emit('update:modelValue', payload)
      this.$emit('update:model-value', payload)
    },
    handleChange(value) {
      this.$emit('change', Array.isArray(value) ? value : [])
    }
  }
}
</script>

<style lang="scss" scoped>
.account-backup-asset-type-cascader {
  width: 100%;

  :deep(.el-input) {
    min-height: 30px;
    height: auto;
  }

  :deep(.el-input__wrapper) {
    min-height: 30px;
    height: auto !important;
    align-items: center;
  }

  :deep(.el-input__inner) {
    min-height: 28px;
    height: auto;
  }
}
</style>
