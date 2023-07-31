<template>
  <pre style="border: none; background: none; white-space: pre-wrap; word-wrap: break-word; padding: 10px 20px">
{{ '$ '+ row.input }}
<br>
{{ row.output }}
  </pre>
</template>

<script>
import BaseFormatter from '@/components/Table/TableFormatters/base'

export default {
  name: 'OutputExpandFormatter',
  extends: BaseFormatter

}
</script>

<style scoped>

</style>
