<template>
  <el-button ref="deleteButton" size="mini" type="danger" :disabled="canDelete" @click="onDelete(col, row, cellValue, reload)">
    <i class="fa fa-minus" />
  </el-button>
</template>

<script>
import BaseFormatter from './base'

export default {
  name: 'DeleteActionFormatter',
  extends: BaseFormatter,
  computed: {
    canDelete() {
      return this.iCanDelete()
    }
  },
  methods: {
    onDelete(col, row, cellValue, reload) {
      const url = col.deleteUrl + cellValue
      this.$axios.delete(url).then(res => {
        this.$message.success(this.$tc('Delete success'))
        reload()
      }).catch(error => {
        this.$message.error(this.$tc('Delete failed' + ' ' + error))
      })
    },
    iCanDelete() {
      // console.log('this.col===', this.col)
      // console.log('this.row===', this.row)
      // console.log('this===', this)
      // console.log('objects===', this.col.objects)
      return this.col.objects.indexOf(this.cellValue) === -1
    }
  }
}
</script>

<style scoped>

</style>
