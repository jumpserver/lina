<template>
  <span>{{ display }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DisplayFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          displayKey: this.col.prop + '_display'
        }
      }
    }
  },
  data() {
    return {
      display: this.getValue()
    }
  },
  methods: {
    getValue() {
      const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
      const displayKey = formatterArgs.displayKey
      let value = this.row[displayKey]
      if (value === undefined) {
        value = this.row[this.col.prop]
      }
      return value
    }
  }
}
</script>

<style scoped>

</style>
