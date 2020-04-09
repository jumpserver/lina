<template>
  <pre style="border: none; background: none; white-space: pre-wrap">
      {{ '$ '+ row.input }}
      <br>
      {{ row.output }}
  </pre>
</template>

<script>
import BaseFormatter from '@/components/ListTable/formatters/base'

export default {
  name: 'OutputExpandFormatter',
  extends: BaseFormatter

}
</script>

<style scoped>

</style>
