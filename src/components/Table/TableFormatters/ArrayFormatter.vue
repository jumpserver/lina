<template>
  <span>{{ value }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
import { getDisplayValue } from './displayValue'

export default {
  name: 'ArrayFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          delimiter: ', '
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
        delimiter: this.formatterArgs.delimiter
      })
    }
  }
}
</script>

<style scoped></style>
