<template>
  <DataForm v-bind="dataFormAttrs" v-if="!loading"
    :disabled="disabled"
    :fields="iFields"
    :form="iValue"
    class="sub-form"
    @change="updateValue($event)"
    @input="updateValue($event)" />
</template>

<script>
import DataForm from '@/components/Form/DataForm/index.vue'

export default {
  name: 'NestedField',
  components: {
    DataForm
  },
  inheritAttrs: false,
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
      return {
        ...this.$attrs,
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
        // 如果不想等，证明是 value 自己变化导致的， 需要重新渲染
        if (valJson !== this.formJson) {
          this.iValue = val
          this.$log.debug('Sub form value changed, rerender form: ', this.formJson, valJson)
          this.loading = true
          setTimeout(() => {
            this.loading = false
          }, 100)
        }
      },
      deep: true
    }
  },
  methods: {
    outputValue: _.debounce(function(val) {
      this.$emit('input', val)
    }),
    updateValue(val) {
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
  width: calc(100% + var(--label-width) + 20px);
  margin-left: calc(-1 * (var(--label-width) + 20px));
  margin-right: 0;
}

.sub-form :deep(.el-form) {
  margin-right: 0;
  margin-bottom: 0;
}

.sub-form :deep(.form-buttons) {
  margin-top: 20px;
}

@media screen and (max-width: 992px) {
  .sub-form {
    width: 100%;
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
