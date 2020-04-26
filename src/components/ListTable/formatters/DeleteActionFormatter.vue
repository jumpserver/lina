<template>
  <el-button size="mini" type="danger" @click="handleDelete(col, row, cellValue, reload)">
    <i class="fa fa-minus" />
  </el-button>
</template>

<script>
import BaseFormatter from './base'

export default {
  name: 'DeleteActionFormatter',
  extends: BaseFormatter,
  methods: {
    handleDelete(col, row, cellValue, reload) {
      const url = col.deleteUrl + cellValue
      this.$axios.delete(url).then(res => {
        this.$message.success(this.$tc('Delete success'))
        reload()
      }).catch(error => {
        this.$message.error(this.$tc('Delete failed' + ' ' + error))
      })
    }
  }
}
</script>

<style scoped>

</style>
