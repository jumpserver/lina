<template>
  <div class="update-select">
    <el-button
      v-show="!iShowSelect"
      :disabled="disabled"
      class="button-text"
      link
      @click="iShowSelect = true"
    >
      {{ iLabel }}
      <svg-icon class-name="icon" icon-class="switch" />
    </el-button>
    <Select2
      v-bind="$attrs"
      v-show="iShowSelect"
      ref="select2"
      v-model="iValue"
      :disabled="disabled"
      @change="onSelectChange"
      @visible-change="onVisibleChange"
    />
  </div>
</template>

<script>
import Select2 from './Select2.vue'

export default {
  components: {
    Select2
  },
  props: {
    value: {
      type: [String, Number],
      default: undefined
    },
    modelValue: {
      type: [String, Number],
      default: undefined
    },
    label: {
      type: String,
      default: () => ''
    },
    showSelect: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  emits: ['change', 'input', 'update:modelValue', 'update:model-value'],
  data() {
    return {
      iShowSelect: this.showSelect,
      iLabel: this.label || this.$t('Select')
    }
  },
  computed: {
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    iValue: {
      get() {
        return this.externalValue
      },
      set(val) {
        this.$emit('input', val)
        this.$emit('update:modelValue', val)
        this.$emit('update:model-value', val)
      }
    }
  },
  watch: {
    label(value) {
      this.iLabel = value || this.$t('Select')
    },
    showSelect(value) {
      this.iShowSelect = value
    }
  },
  methods: {
    onSelectChange(val) {
      const option = this.$refs.select2.iOptions.find((item) => item.value === val)
      this.iShowSelect = this.showSelect
      this.iLabel = val ? option?.label || this.iLabel : this.$t('Select')
      this.$emit('change', val)
    },
    onVisibleChange(visible) {
      if (!visible && !this.showSelect) {
        this.iShowSelect = false
      }
    }
  }
}
</script>

<style scoped>
.button-text {
  color: #676a6c;
  padding: 5px !important;
}

.update-select {
  display: inline-flex;
  justify-content: flex-end;
  width: 100%;
}

.update-select :deep(.select2) {
  width: 100%;
}

.icon {
  color: #676a6c !important;
}
</style>
