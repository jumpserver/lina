<template>
  <div>
    <MFAVerifyDialog
      v-if="mfaDialogShow"
      @MFAVerifyDone="showExportDialog"
      @MFAVerifyCancel="handleExportCancel"
    />
    <Dialog
      v-if="exportDialogShow"
      :title="$t('common.Export')"
      :visible.sync="exportDialogShow"
      :destroy-on-close="true"
      @confirm="handleExportConfirm()"
      @cancel="handleExportCancel()"
    >
      <el-form label-position="left" style="padding-left: 50px">
        <el-form-item :label="$t('common.fileType' )" :label-width="'100px'">
          <el-radio-group v-model="exportTypeOption">
            <el-radio v-for="option of exportTypeOptions" :key="option.value" style="padding: 10px 20px;" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item class="export-form" :label="this.$t('common.imExport.ExportRange')" :label-width="'100px'">
          <el-radio-group v-model="exportOption">
            <el-radio v-for="option of exportOptions" :key="option.value" class="export-item" :label="option.value" :disabled="!option.can">{{ option.label }}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
import MFAVerifyDialog from '@/components/MFAVerifyDialog'
import { createSourceIdCache } from '@/api/common'
import * as queryUtil from '@/components/DataTable/compenents/el-data-table/utils/query'

export default {
  name: 'ExportDialog',
  components: {
    Dialog,
    MFAVerifyDialog
  },
  props: {
    selectedRows: {
      type: Array,
      default: () => []
    },
    url: {
      type: String,
      default: ''
    },
    beforeExport: {
      type: Function,
      default: () => {}
    },
    mfaVerifyRequired: {
      type: Boolean,
      default: false
    },
    performExport: {
      type: Function,
      default(selectedRows, exportOptions, query, exportType) {
        return this.defaultPerformExport(selectedRows, exportOptions, query, exportType)
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
      exportDialogShow: false,
      exportOption: 'all',
      exportTypeOption: 'csv',
      meta: {},
      mfaVerified: false,
      mfaDialogShow: false
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
    },
    exportTypeOptions() {
      return [
        {
          label: 'CSV',
          value: 'csv',
          can: true
        },
        {
          label: 'Excel',
          value: 'xlsx',
          can: true
        }
      ]
    }
  },
  mounted() {
    this.$eventBus.$on('showExportDialog', ({ selectedRows, url, name }) => {
      // Todo: 没有时间了，只能先这么处理了
      if (url === this.url || url.indexOf(this.url) > -1 || url.indexOf('account') > -1) {
        this.showExportDialog()
      }
    })
  },
  methods: {
    showExportDialog() {
      if (!this.mfaVerifyRequired) {
        this.exportDialogShow = true
        return
      }
      // 这是需要校验 MFA 的
      if (!this.mfaDialogShow) {
        this.mfaDialogShow = true
      } else {
        this.exportDialogShow = true
      }
    },
    downloadCsv(url) {
      const a = document.createElement('a')
      a.href = url
      a.click()
      window.URL.revokeObjectURL(url)
    },
    async defaultPerformExport(selectRows, exportOption, q, exportTypeOption) {
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
      }
      query['format'] = exportTypeOption
      const queryStr =
          (url.indexOf('?') > -1 ? '&' : '?') +
          queryUtil.stringify(query, '=', '&')
      return this.downloadCsv(url + queryStr)
    },
    async handleExport() {
      const listTableRef = this.$parent.$parent.$parent.$parent
      const query = listTableRef['dataTable'].getQuery()
      delete query['limit']
      delete query['offset']
      await this.beforeExport()
      return this.performExport(this.selectedRows, this.exportOption, query, this.exportTypeOption)
    },
    async handleExportConfirm() {
      await this.handleExport()
      this.exportDialogShow = false
      this.mfaDialogShow = false
    },
    handleExportCancel() {
      this.exportDialogShow = false
      this.mfaDialogShow = false
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
