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
import Select2 from './Select2'

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
        return typeof v === 'object' ? v : { pk: v }
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
          return v.pk || v.id
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
