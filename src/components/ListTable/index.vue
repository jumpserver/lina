<template>
  <div>
    <TableAction :table-url="tableConfig.url" :search-table="search" v-bind="headerActions" :selected-rows="selectedRows" :reload-table="reloadTable" />
    <el-card class="table-content" shadow="never">
      <AutoDataTable ref="dataTable" :config="tableConfig" @selection-change="handleSelectionChange" />
      <Dialog :title="$t('Export')" :visible.sync="showExportDialog" @comfirm="handleDialogConfirm('export')" @cancel="handleDialogCancel('export')">
        <el-form>
          <el-form-item label="导出范围" :label-width="'100px'">
            <el-radio v-model="importOption" class="export-item" label="1">导出全部</el-radio>
            <el-radio v-model="importOption" class="export-item" label="2">仅导出选中项</el-radio>
            <el-radio v-model="importOption" class="export-item" label="3">仅导出搜索项</el-radio>
          </el-form-item>
        </el-form>
      </Dialog>
      <Dialog :title="$t('Import')" :visible.sync="showImportDialog" @comfirm="handleDialogConfirm('import')" @cancel="handleDialogCancel('import')">
        <el-form>
          <el-form-item label="导出范围" :label-width="'100px'">
            <el-radio v-model="exportOption" class="export-item" label="1">导出全部</el-radio>
            <el-radio v-model="exportOption" class="export-item" label="2">仅导出选中项</el-radio>
            <el-radio v-model="exportOption" class="export-item" label="3">仅导出搜索项</el-radio>
          </el-form-item>
        </el-form>
      </Dialog>
    </el-card>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import AutoDataTable from '../AutoDataTable'
import Dialog from '../Dialog'
import TableAction from './TableAction'

export default {
  name: 'ListTable',
  components: {
    AutoDataTable,
    TableAction,
    Dialog
  },
  props: {
    // 定义 table 的配置
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    // 是否显示table左侧的action
    headerActions: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      selectedRows: [],
      showExportDialog: false,
      showImportDialog: false,
      importOption: '1',
      exportOption: '1',
      meta: {}
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    }
  },
  mounted() {
    this.$eventBus.$on('showExportDialog', (row) => {
      this.showExportDialog = true
    })
    this.$eventBus.$on('showImportDialog', (row) => {
      this.showImportDialog = true
    })
  },
  methods: {
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    reloadTable() {
      this.$refs.dataTable.getList()
    },
    search(attrs) {
      return this.$refs.dataTable.search(attrs)
    },
    handleExport() {
      let data
      var resources = []
      if (this.exportOption === '1') {
        data = this.$refs.dataTable.getData()
      } else if (this.exportOption === '2') {
        data = this.selectedRows
      } else {
        data = []
      }
      for (let index = 0; index < data.length; index++) {
        resources.push(data[index].id)
      }
      console.log(resources)
    },
    handleDialogConfirm(val) {
      switch (val) {
        case 'export':
          this.handleExport()
          this.showExportDialog = false
          break
        case 'import':
          this.handleImport()
          this.showImportDialog = false
          break
        default:
          break
      }
    },
    handleDialogCancel(val) {
      switch (val) {
        case 'export':
          this.showExportDialog = false
          break
        case 'import':
          this.showImportDialog = false
          break
        default:
          break
      }
    }
  }
}
</script>

<style lang="less" scoped>

  .table-content {
    margin-top: 10px;
  }
  //修改颜色
  // .el-button--text{
  //   color: #409EFF;
  // }
</style>
