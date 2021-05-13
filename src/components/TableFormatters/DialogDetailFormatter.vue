<template>
  <div>
    <el-link class="detail" :type="col.type || 'success'" @click="dialogVisible=true">{{ iTitle }}</el-link>
    <Dialog width="60%" :visible.sync="dialogVisible" :title="dialogTitle" :show-cancel="true" :show-confirm="false" @cancel="onCancel">
      <DetailCard :items="detailCardItems" :title="detailTitle" />
    </Dialog>
  </div>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import Dialog from '@/components/Dialog'
import BaseFormatter from './base'
export default {
  name: 'DialogDetailFormatter',
  components: {
    DetailCard,
    Dialog
  },
  extends: BaseFormatter,
  props: {
    formatterArgsDefault: {
      type: Object,
      default() {
        return {
          getDetailItems({ col, row, cellValue }) {
            return []
          },
          getTitle({ col, row, cellValue }) {
            return cellValue
          },
          getDetailTitle({ col, row, cellValue }) {
            return ''
          },
          getDialogTile({ col, row, cellValue }) {
            return cellValue
          }
        }
      }
    }
  },
  data() {
    const formatterArgs = Object.assign(this.formatterArgsDefault, this.col.formatterArgs)
    return {
      formatterArgs: formatterArgs,
      iTitle: formatterArgs.getTitle({ col: this.col, row: this.row, cellValue: this.cellValue }),
      dialogTitle: formatterArgs.getDialogTile({ col: this.col, row: this.row, cellValue: this.cellValue }),
      dialogVisible: false,
      detailCardItems: formatterArgs.getDetailItems({ col: this.col, row: this.row, cellValue: this.cellValue }),
      detailTitle: formatterArgs.getDetailTitle({ col: this.col, row: this.row, cellValue: this.cellValue })
    }
  },
  methods: {
    onCancel() {
      this.dialogVisible = false
    }
  }
}
</script>

<style scoped>

</style>
