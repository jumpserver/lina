<template>
  <span>{{ cellValue.toString() }}</span>
</template>

<script>
import BaseFormatter from './base'
export default {
  name: 'ArrayFormatter',
  extends: BaseFormatter
}
</script>

<style scoped>

</style>
