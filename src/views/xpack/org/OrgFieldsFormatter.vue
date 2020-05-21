<template>
  <el-popover
    placement="bottom"
    trigger="click"
  >
    <span v-for="item in getCellValue" :key="item">{{ item }} <br></span>
    <el-button slot="reference" type="text">{{ getCellValueLength }}</el-button>
  </el-popover>
</template>

<script>
import BaseFormatter from '@/components/ListTable/formatters/base'
export default {
  name: 'LengthFormatter',
  extends: BaseFormatter,
  data() {
    return {
      visible: false,
      dataContent: this.cellValue
    }
  },
  computed: {
    getCellValueLength() {
      if (this.cellValue instanceof Array) {
        return this.cellValue.length
      }
      return this.cellValue
    },
    getCellValue() {
      return this.cellValue
    }
  }
}
</script>

<style scoped>

</style>
