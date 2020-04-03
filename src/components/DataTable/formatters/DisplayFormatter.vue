<template>
  <span>{{ display }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DisplayFormatter',
  extends: BaseFormatter,
  data() {
    let displayKey = this.col.displayKey
    if (!displayKey) {
      displayKey = this.col.prop + '_display'
    }
    return {
      display: this.row[displayKey]
    }
  }
}
</script>

<style scoped>

</style>
