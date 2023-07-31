<template>
  <el-button
    ref="deleteButton"
    size="mini"
    type="danger"
    :disabled="iDisabled"
    @click="onDelete(col, row, cellValue, reload)"
  >
    <i class="fa fa-minus" />
  </el-button>
</template>

<script>
import BaseFormatter from './base.vue'

export default {
  name: 'DeleteActionFormatter',
  extends: BaseFormatter,
  computed: {
    iDisabled() {
      // 禁用
      return (this.disabled() || this.$store.getters.currentOrgIsRoot)
    }
  },
  methods: {
    defaultOnDelete(col, row, cellValue, reload) {
      const url = col.deleteUrl + cellValue
      this.$axios.delete(url).then(res => {
        this.$message.success(this.$tc('common.deleteSuccessMsg'))
        reload()
      }).catch(error => {
        this.$message.error(this.$tc('common.deleteErrorMsg') + ' ' + error)
      })
    },
    onDelete(col, row, cellValue, reload) {
      if (col.onDelete && typeof col.onDelete === 'function') {
        col.onDelete(col, row, cellValue, reload)
      } else {
        this.defaultOnDelete(col, row, cellValue, reload)
      }
    },
    disabled() {
      if (this.col.objects === 'all') {
        return false
      }
      const objectIds = this.col.objects.map(i => i.id)
      return objectIds.indexOf(this.cellValue) === -1
    }
  }
}
</script>

<style scoped>

</style>
