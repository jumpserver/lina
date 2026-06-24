<template>
  <DataForm
    v-bind="dataFormAttrs"
    v-if="!loading"
    :disabled="disabled"
    :fields="iFields"
    :form="iValue"
    class="sub-form"
    @update:form="updateValue($event)"
  />
</template>

<script>
import DataForm from '@/components/Form/DataForm/index.vue'
import _ from 'lodash'

export default {
  name: 'NestedField',
  components: {
    DataForm
  },
  inheritAttrs: false,
  emits: ['input', 'update:form'],
  props: {
    fields: {
      type: Array,
      default: () => []
    },
    value: {
      type: Object,
      default: () => ({})
    },
    errors: {
      type: [Object, String],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: false,
      formJson: JSON.stringify(this.value),
      iValue: this.value,
      kwargs: {
        hasReset: false,
        hasSaveContinue: false,
        hasButtons: false
      }
    }
  },
  computed: {
    dataFormAttrs() {
      const attrs = { ...this.$attrs }
      delete attrs.onInput
      delete attrs.onChange
      delete attrs['onUpdate:modelValue']
      delete attrs['onUpdate:model-value']
      delete attrs.modelValue
      delete attrs['model-value']

      return {
        ...attrs,
        ...this.kwargs
      }
    },
    iFields() {
      const fields = this.fields
      if (this.errors && typeof this.errors === 'object') {
        // eslint-disable-next-line prefer-const
        for (let [name, error] of Object.entries(this.errors)) {
          const field = fields.find((v) => v.prop === name)
          if (!field) {
            continue
          }
          this.$log.debug(`${name}: ${error}`)
          if (typeof error === 'object' && !Array.isArray(error)) {
            error = this.objectToString(error)
          }
          field.attrs.error = error.toString()
        }
      }
      this.$log.debug('Fields change: ', fields, this.errors)
      return fields
    }
  },
  watch: {
    iValue: {
      handler(val) {
        this.formJson = JSON.stringify(val)
      },
      deep: true
    },
    value: {
      handler(val) {
        const valJson = JSON.stringify(val)
        // 外部值同步时直接更新内部值，避免通过 loading 重挂整个子表单造成闪烁
        if (valJson !== this.formJson) {
          this.iValue = val
          this.formJson = valJson
          this.$log.debug('Sub form value synced: ', this.formJson, valJson)
        }
      },
      deep: true
    }
  },
  methods: {
    outputValue: _.debounce(function (val) {
      this.$emit('input', val)
      this.$emit('update:form', val)
    }),
    updateValue(val) {
      if (val && typeof val !== 'object') {
        return
      }
      this.iValue = val
      this.outputValue(val)
    },
    objectToString(obj) {
      let data = ''
      // eslint-disable-next-line prefer-const
      for (let [key, value] of Object.entries(obj)) {
        if (typeof value === 'object') {
          value = this.objectToString(value)
        }
        data += ` ${key}: ${value} `
      }
      return data
    }
  }
}
</script>

<style lang="scss" scoped>
.sub-form {
  width: 100%;
  margin-left: 0;
  margin-right: 0;
  min-width: 0;
}

.sub-form :deep(.el-form) {
  margin-right: 0;
  margin-bottom: 0;
}

/*
 * 子表单复用与外层一致的 label 宽度（attrs meta 传入的 labelWidth），
 * label-wrap 为 flex: 0 0 var(--label-width)，输入框自然从 label-width + gap 处开始，
 * 因此无需任何负 margin 偏移即可与上下 group 的输入框左侧对齐。
 */
.sub-form :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.sub-form :deep(.form-buttons) {
  margin-top: 20px;
}
</style>
