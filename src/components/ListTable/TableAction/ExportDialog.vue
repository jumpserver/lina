<template>
  <Dialog v-if="showExportDialog" :title="$t('common.Export')" :visible.sync="showExportDialog" :destroy-on-close="true" @confirm="handleExportConfirm()" @cancel="handleExportCancel()">
    <el-form label-position="left" style="padding-left: 50px">
      <el-form-item class="export-form" :label="this.$t('common.imExport.ExportRange')" :label-width="'100px'">
        <el-radio-group v-model="exportOption">
          <el-radio v-for="option of exportOptions" :key="option.value" class="export-item" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
        </el-radio-group>
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
    },
    performExport: {
      type: Function,
      default(selectedRows, exportOptions, query) {
        return this.defaultPerformExport(selectedRows, exportOptions, query)
      }
    },
    canExportAll: {
      type: Boolean,
      default: true
    },
    canExportSelected: {
      type: Boolean,
      default: true
    },
    canExportFiltered: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      showExportDialog: false,
      exportOption: '',
      meta: {}
    }
  },
  computed: {
    hasSelected() {
      return this.selectedRows.length > 0
    },
    tableQuery() {
      const listTableRef = this.$parent.$parent.$parent.$parent
      if (!listTableRef) {
        return {}
      }
      const query = listTableRef.dataTable.getQuery()
      delete query['limit']
      delete query['offset']
      delete query['date_from']
      delete query['date_to']
      return query
    },
    tableHasQuery() {
      return Object.keys(this.tableQuery).length > 0
    },
    exportOptions() {
      return [
        {
          label: this.$t('common.imExport.ExportAll'),
          value: 'all',
          can: this.canExportAll && !this.tableHasQuery
        },
        {
          label: this.$t('common.imExport.ExportOnlySelectedItems'),
          value: 'selected',
          can: this.selectedRows.length > 0 && this.canExportSelected
        },
        {
          label: this.$t('common.imExport.ExportOnlyFiltered'),
          value: 'filtered',
          can: this.tableHasQuery && this.canExportFiltered
        }
      ]
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
    async defaultPerformExport(selectRows, exportOption, q) {
      const url = (process.env.VUE_APP_ENV === 'production') ? (`${this.url}`) : (`${process.env.VUE_APP_BASE_API}${this.url}`)
      const query = Object.assign({}, q)
      if (exportOption === 'selected') {
        const resources = []
        const data = selectRows
        for (let index = 0; index < data.length; index++) {
          resources.push(data[index].id)
        }
        const spm = await createSourceIdCache(resources)
        query['spm'] = spm.spm
      } else if (exportOption === 'filtered') {
        // console.log(listTableRef)
        // console.log(listTableRef.dataTable)
        // delete query['limit']
        // delete query['offset']
      }
      query['format'] = 'csv'
      const queryStr =
          (url.indexOf('?') > -1 ? '&' : '?') +
          queryUtil.stringify(query, '=', '&')
      return this.downloadCsv(url + queryStr)
    },
    async handleExport() {
      const listTableRef = this.$parent.$parent.$parent.$parent
      const query = listTableRef.dataTable.getQuery()
      delete query['limit']
      delete query['offset']
      return this.performExport(this.selectedRows, this.exportOption, query)
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

<style lang='scss' scoped>
  .export-item {
    width: 100%;
    display: block;
    padding: 10px 20px;
  }

  .export-form >>> .el-form-item__label {
    line-height: 2
  }
</style>
