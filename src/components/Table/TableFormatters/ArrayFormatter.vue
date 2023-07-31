<template>
  <span>{{ value }}</span>
</template>

<script>
import BaseFormatter from './base.vue'
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
      if (!(this.cellValue instanceof Array)) {
        return this.cellValue
      }
      return this.cellValue.join(this.formatterArgs.delimiter)
    }
  }
}
</script>

<style scoped>

</style>
