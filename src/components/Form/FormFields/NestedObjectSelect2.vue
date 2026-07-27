<template>
  <Select2
    v-bind="attrsWithoutValue"
    v-model="iValue"
    :multiple="multiple"
    @change="onChange"
    @change-options="onChangeOptions"
  />
</template>

<script>
import Select2 from './Select2.vue'

export default {
  name: 'NestedObjectSelect2',
  inheritAttrs: false,
  components: {
    Select2
  },
  emits: ['input', 'change', 'changeOptions', 'update:modelValue'],
  props: {
    value: {
      type: [Array, String, Number, Boolean, Object],
      default: () => []
    },
    modelValue: {
      type: [Array, String, Number, Boolean, Object],
      default: undefined
    },
    multiple: {
      type: Boolean,
      default: true
    },
    // 自定义label字段的name
    customLabelKeyName: {
      type: String,
      default: 'name'
    }
  },
  data() {
    return {}
  },
  computed: {
    attrsWithoutValue() {
      const attrs = Object.assign({ clearable: this.clearable }, this.$attrs)
      delete attrs.value
      delete attrs.modelValue
      delete attrs['model-value']
      delete attrs['onUpdate:modelValue']
      delete attrs['onUpdate:model-value']
      return attrs
    },
    externalValue() {
      return this.modelValue !== undefined ? this.modelValue : this.value
    },
    iValue: {
      set(val) {
        const value = this.valuesToObjects(val)
        this.$log.debug('set iValue', value)
        this.$emit('input', value)
        this.$emit('update:modelValue', value)
      },
      get() {
        const value = this.objectsToValues(this.externalValue)
        return value
      }
    },
    clearable() {
      if (this.$attrs.clearable === undefined) {
        return this.multiple
      } else {
        return this.$attrs.clearable
      }
    }
  },
  methods: {
    onChange(val) {
      val = this.valuesToObjects(val)
      this.$log.debug('onChange .... ', val)
      this.$emit('change', val)
    },
    onChangeOptions(val) {
      val = this.valuesToObjects(val)
      this.$log.debug('onChangeOptions', val)
      this.$emit('changeOptions', val)
    },
    valuesToObjects(values) {
      if (
        !this.multiple &&
        (values === null ||
          values === undefined ||
          values === '' ||
          (Array.isArray(values) && values.length === 0))
      ) {
        return ''
      }
      let value = values
      if (!this.multiple && !Array.isArray(value)) {
        value = [value]
      }
      value = value.map((v) => {
        // uuid v4
        const uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
        return typeof v === 'object'
          ? v
          : this.$attrs?.allowCreate && !uuid.test(v)
            ? { [this.customLabelKeyName]: v }
            : { pk: v }
      })
      if (!this.multiple) {
        value = value[0]
      }
      return value
    },
    objectsToValues(objects) {
      let val = objects
      if (val === null || val === undefined) {
        val = []
      }
      if (!Array.isArray(val)) {
        val = [val]
      }
      val = val.map((v) => {
        if (v && typeof v === 'object') {
          return (
            v.pk ||
            v.id ||
            (this.$attrs?.allowCreate ? v?.[this.customLabelKeyName] + ':' + v?.value : '')
          )
        } else {
          return v
        }
      })
      if (!this.multiple) {
        val = val[0]
      }
      return val
    }
  }
}
</script>

<style scoped></style>
