<template>
  <div>
    <TableAction :table-url="tableConfig.url" :search-table="search" v-bind="headerActions" :selected-rows="selectedRows" :reload-table="reloadTable" />
    <el-card class="table-content" shadow="never">
      <AutoDataTable ref="dataTable" :config="tableConfig" @selection-change="handleSelectionChange" />
      <Dialog :title="$t('Export')" :visible.sync="showExportDialog" @comfirm="handleDialogConfirm('export')" @cancel="handleDialogCancel('export')">
        <el-form>
          <el-form-item label="导出范围" :label-width="'100px'">
            <p>{{ $d(new Date(), 'short') }}</p>
            <el-radio v-model="exportOption" class="export-item" label="1">导出全部</el-radio>
            <el-radio v-model="exportOption" class="export-item" label="2">仅导出选中项</el-radio>
            <el-radio v-model="exportOption" class="export-item" label="3">仅导出搜索项</el-radio>
          </el-form-item>
        </el-form>
      </Dialog>
      <Dialog :title="$t('Import')" :visible.sync="showImportDialog" @comfirm="handleDialogConfirm('import')" @cancel="handleDialogCancel('import')">
        <el-form>
          <el-form-item label="导入/更新" :label-width="'100px'">
            <el-radio v-model="importOption" class="export-item" label="1">导出全部</el-radio>
            <el-radio v-model="importOption" class="export-item" label="2">仅导出选中项</el-radio>
            <el-radio v-model="importOption" class="export-item" label="3">仅导出搜索项</el-radio>
          </el-form-item>
        </el-form>
        <div>
          <el-upload
            class="upload-card"
            :action="upLoadUrl"
            :on-preview="handlePreview"
            :on-remove="handleRemove"
            :before-remove="beforeRemove"
            :on-exceed="handleExceed"
          >
            <el-button size="small" type="primary">点击上传</el-button>
            <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
          </el-upload>
        </div>
      </Dialog>
    </el-card>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */
import AutoDataTable from '../AutoDataTable'
import Dialog from '../Dialog'
import TableAction from './TableAction'
import { createSourceIdCache } from '@/api/common'

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
    },
    upLoadUrl() {
      return process.env.VUE_APP_BASE_API + this.tableConfig.url
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
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    handleSelectionChange(val) {
      this.selectedRows = val
    },
    reloadTable() {
      this.$refs.dataTable.getList()
    },
    search(attrs) {
      return this.$refs.dataTable.search(attrs)
    },
    async handleExport() {
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
      const spm = await createSourceIdCache(resources)
      const url = process.env.VUE_APP_BASE_API + `${this.tableConfig.url}?format=csv&?spm=` + spm.spm
      return this.downloadCsv(url)
    },
    handleImport() {

    },
    async handleDialogConfirm(val) {
      switch (val) {
        case 'export':
          await this.handleExport()
          this.showExportDialog = false
          break
        case 'import':
          await this.handleImport()
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
