<template>
  <span>{{ cellValue }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ArrayFormatter',
  extends: BaseFormatter,
  mounted() {
    console.log(this.cellValue, '111')
  }
}
</script>

<style scoped>

</style>
