<template>
  <span :class="formatterArgs.cls">{{ value }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
export default {
  name: 'ObjectRelatedFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          displayKey: null,
          delimiter: ', ',
          cls: ''
        }
      }
    }
  },
  data() {
    return {
      formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    }
  },
  computed: {
    value() {
      if (this.cellValue === null || this.cellValue?.length === 0) {
        return ''
      }
      let objects = this.cellValue
      if (!Array.isArray(this.cellValue)) {
        objects = [this.cellValue]
      }
      const values = objects.map(object => object?.[this.iKey]) || []
      return values.join(this.formatterArgs.delimiter)
    },
    iKey() {
      if (this.formatterArgs.displayKey) {
        return this.formatterArgs.displayKey
      }
      let object
      if (this.isM2M()) {
        object = this.cellValue[0]
      } else {
        object = this.cellValue
      }
      for (const key of ['label', 'name', 'value']) {
        if (object?.[key]) {
          return key
        }
      }
      return ''
    }
  },
  methods: {
    isM2M() {
      return Array.isArray(this.cellValue)
    }
  }
}
</script>

<style scoped>

</style>
