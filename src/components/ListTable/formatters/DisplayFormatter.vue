<template>
  <span>{{ display }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DisplayFormatter',
  extends: BaseFormatter,
  data() {
    return {
      display: this.getValue()
    }
  },
  methods: {
    getValue() {
      let displayKey = this.col.displayKey
      if (!displayKey) {
        displayKey = this.col.prop + '_display'
      }
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
