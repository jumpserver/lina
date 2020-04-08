<template>
  <span>{{ getCellValueLength }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'LengthFormatter',
  extends: BaseFormatter,
  computed: {
    getCellValueLength() {
      if (this.cellValue instanceof Array) {
        return this.cellValue.length
      }
      return this.cellValue
    }
  }
}
</script>

<style scoped>

</style>
