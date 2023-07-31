<template>
  <Select2
    v-model="iValue"
    :multiple="multiple"
    v-bind="attrsWithoutValue"
    @change="onChange"
    @change-options="onChangeOptions"
  />
</template>

<script>
import Select2 from './Select2.vue'

export default {
  name: 'NestedObjectSelect2',
  components: {
    Select2
  },
  props: {
    value: {
      type: [Array, String, Number, Boolean, Object],
      default: () => ([])
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
      const attrs = Object.assign({}, this.$attrs)
      delete attrs.value
      return attrs
    },
    iValue: {
      set(val) {
        const value = this.valuesToObjects(val)
        this.$log.debug('set iValue', value)
        this.$emit('input', value)
      },
      get() {
        const value = this.objectsToValues(this.value)
        return value
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
      let value = values
      if (!this.multiple && !Array.isArray(value)) {
        value = [value]
      }
      value = value.map(v => {
        // uuid v4
        const uuid = /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i
        return typeof v === 'object' ? v
          : this.$attrs?.allowCreate && !uuid.test(v) ? { [this.customLabelKeyName]: v } : { pk: v }
      })
      if (!this.multiple) {
        value = value[0]
      }
      return value
    },
    objectsToValues(objects) {
      let val = objects
      if (!this.multiple) {
        val = [val]
      }
      val = val.map((v) => {
        if (v && typeof v === 'object') {
          return v.pk || v.id || (this.$attrs?.allowCreate ? (v?.[this.customLabelKeyName] + ':' + v?.value) : '')
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

<style scoped>

</style>
