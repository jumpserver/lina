<template>
  <div>
    <el-link :type="col.type || 'success'" class="detail" @click="dialogVisible=true">
      {{ iTitle }}
    </el-link>
    <Dialog
      :show-cancel="false"
      :title="dialogTitle"
      :visible.sync="dialogVisible"
      width="60%"
      @confirm="onCancel"
    >
      <DetailCard :items="detailCardItems" :title="detailTitle" class="card" />
    </Dialog>
  </div>
</template>

<script>
import DetailCard from '@/components/Cards/DetailCard/index.vue'
import Dialog from '@/components/Dialog/index.vue'
import BaseFormatter from './base.vue'

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

<style lang="scss" scoped>
.card >>> .el-card__body {
  padding: 0;
}
.el-card {
  border: 0!important;
}
</style>
