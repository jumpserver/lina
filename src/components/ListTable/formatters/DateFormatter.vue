<template>
  <span>{{ value }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'DateFormatter',
  extends: BaseFormatter,
  data() {
    const dt = new Date(this.cellValue)
    const year = dt.getFullYear()
    const month = dt.getMonth() + 1
    const date = dt.getDate()
    const hour = dt.getHours()
    const minutes = dt.getMinutes()
    const seconds = dt.getSeconds()
    return {
      value: `${year}-${month}-${date} ${hour}:${minutes}:${seconds}`
    }
  }
}
</script>

<style scoped>

</style>
