<template>
  <span :class="formatterArgs.cls">{{ value }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
import { getDisplayValue } from './displayValue'

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
      return getDisplayValue(this.cellValue, {
        displayKey: this.formatterArgs.displayKey,
        delimiter: this.formatterArgs.delimiter
      })
    }
  }
}
</script>

<style scoped></style>
