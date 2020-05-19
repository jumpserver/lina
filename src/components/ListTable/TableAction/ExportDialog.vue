<template>
  <Dialog :title="$t('common.Export')" :visible.sync="showExportDialog" @confirm="handleExportConfirm()" @cancel="handleExportCancel()">
    <el-form label-position="left" style="padding-left: 50px">
      <el-form-item :label="this.$t('common.imExport.ExportRange')" :label-width="'100px'">
        <el-radio v-model="exportOption" class="export-item" label="1">{{ this.$t('common.imExport.ExportAll') }}</el-radio>
        <br>
        <el-radio v-model="exportOption" class="export-item" label="2">{{ this.$t('common.imExport.ExportOnlySelectedItems') }}</el-radio>
        <br>
        <el-radio v-model="exportOption" class="export-item" label="3">{{ this.$t('common.imExport.ExportOnlyFiltered') }}</el-radio>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { createSourceIdCache } from '@/api/common'
import * as queryUtil from '@/components/DataTable/compenents/el-data-table/utils/query'

export default {
  name: 'ExportDialog',
  components: {
    Dialog
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
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
  },
  methods: {
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async handleExport() {
      const url = process.env.VUE_APP_BASE_API + `${this.url}`
      let query = {}
      if (this.exportOption === '2') {
        const resources = []
        const data = this.selectedRows
        for (let index = 0; index < data.length; index++) {
          resources.push(data[index].id)
        }
        const spm = await createSourceIdCache(resources)
        query['spm'] = spm.spm
      } else if (this.exportOption === '3') {
        const listTableRef = this.$parent.$parent.$parent.$parent
        console.log(listTableRef)
        console.log(listTableRef.dataTable)
        query = listTableRef.dataTable.getQuery()
        delete query['limit']
        delete query['offset']
      }
      query['format'] = 'csv'
      const queryStr =
        (url.indexOf('?') > -1 ? '&' : '?') +
        queryUtil.stringify(query, '=', '&')
      return this.downloadCsv(url + queryStr)
    },
    async handleExportConfirm() {
      await this.handleExport()
      this.showExportDialog = false
    },
    handleExportCancel() {
      this.showExportDialog = false
    }
  }
}
</script>

<style lang='less' scoped>

</style>
