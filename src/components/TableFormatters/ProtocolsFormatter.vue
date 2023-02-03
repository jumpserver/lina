<template>
  <span class="protocol-cell">
    <el-tag v-for="p of cellValue" :key="p.name" size="mini">
      {{ p.name }}/{{ p.port }}
    </el-tag>
  </span>
</template>

<script>
import BaseFormatter from './base'

export default {
  name: 'ProtocolsFormatter',
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {}
      }
    },
    data() {
      return {
        formatterArgs: Object.assign(this.formatterArgsDefault, this.col.formatterArgs || {})
      }
    }
  }
}
</script>

<style lang='scss' scoped>
.protocol-cell {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;

  .el-tag {
    margin-right: 2px;
  }
}

</style>
