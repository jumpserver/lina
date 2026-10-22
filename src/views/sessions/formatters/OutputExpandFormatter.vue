<template>
  <pre
    style="
      border: none;
      background: none;
      white-space: pre-wrap;
      word-wrap: break-word;
      padding: 10px 20px;
    ">
{{ $t('Source') }}: <CommandSourceFormatter :row="row" />
<br>
{{ '$ '+ row.input }}
<br>
{{ row.output }}
  </pre>
</template>

<script>
import BaseFormatter from '@/components/Table/TableFormatters/base'
import CommandSourceFormatter from './CommandSourceFormatter.vue'

export default {
  name: 'OutputExpandFormatter',
  components: { CommandSourceFormatter },
  extends: BaseFormatter
}
</script>

<style scoped></style>
