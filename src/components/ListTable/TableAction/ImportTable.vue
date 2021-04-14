<template>
  <div>
    <el-row>
      <el-col :span="8">
        <div class="tableFilter">
          <el-radio-group v-model="importStatusFilter" size="small">
            <el-radio-button label="all">{{ $t('common.Total') }}</el-radio-button>
            <el-radio-button label="ok">{{ $t('common.Success') }}</el-radio-button>
            <el-radio-button label="error">{{ $t('common.Failed') }}</el-radio-button>
            <el-radio-button label="pending">{{ $t('common.Pending') }}</el-radio-button>
          </el-radio-group>
        </div>
      </el-col>
      <el-col :span="8" style="text-align: center">
        <span class="summary-item summary-total"> {{ $t('common.Total') }}: {{ totalCount }}</span>
        <span class="summary-item summary-success"> {{ $t('common.Success') }}: {{ successCount }}</span>
        <span class="summary-item summary-failed"> {{ $t('common.Failed') }}: {{ failedCount }}</span>
      </el-col>
    </el-row>
    <div class="row">
      <el-progress :percentage="processedPercent" />
    </div>
    <DataTable v-if="tableGenDone" id="importTable" :config="tableConfig" class="importTable" />
    <div class="row" style="padding-top: 20px">
      <div style="float: right">
        <el-button size="small" @click="performCancel">{{ $t('common.Cancel') }}</el-button>
        <el-button size="small" type="primary" @click="performImportAction">{{ importActionTitle }}</el-button>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from '@/components/DataTable'
import { sleep } from '@/utils/common'
import { EditableInputFormatter, StatusFormatter } from '@/components/ListTable/formatters'
export default {
  name: 'ImportTable',
  components: {
    DataTable
  },
  props: {
    jsonData: {
      type: Object,
      default: () => ({})
    },
    url: {
      type: String,
      required: true
    },
    importOption: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      columns: [],
      importStatusFilter: 'all',
      iTotalData: [],
      tableConfig: {
        hasSelection: false,
        hasPagination: false,
        columns: [],
        totalData: [],
        tableAttrs: {
          stripe: true, // 斑马纹表格
          border: true, // 表格边框
          fit: true, // 宽度自适应,
          tooltipEffect: 'dark',
          height: '60vh'
        }
      },
      tableGenDone: false,
      importTaskStatus: 'pending', // pending, started, stopped, done
      importTaskResult: '', // success, hasError
      hasImport: false,
      hasContinueButton: false,
      importActions: {
        import: this.$t('common.Import'),
        continue: this.$t('common.Continue'),
        stop: this.$t('common.Stop'),
        finished: this.$t('common.Finished')
      }
    }
  },
  computed: {
    tableColumnNameMapper() {
      const mapper = {}
      for (const column of this.tableConfig.columns) {
        mapper[column['prop']] = column['label']
      }
      return mapper
    },
    importAction() {
      switch (this.importTaskStatus) {
        case 'pending':
          return 'import'
        case 'started':
          return 'stop'
      }
      if (this.totalCount === this.successCount) {
        return 'finished'
      } else {
        return 'continue'
      }
    },
    importActionTitle() {
      return this.importActions[this.importAction]
    },
    successData() {
      return this.iTotalData.filter((item) => {
        return item['@status'] === 'ok'
      })
    },
    failedData() {
      return this.iTotalData.filter((item) => {
        return typeof item['@status'] === 'object' && item['@status'].name === 'error'
      })
    },
    pendingData() {
      return this.iTotalData.filter((item) => {
        return item['@status'] === 'pending'
      })
    },
    totalCount() {
      return this.iTotalData.length
    },
    successCount() {
      return this.successData.length
    },
    failedCount() {
      return this.failedData.length
    },
    pendingCount() {
      return this.pendingData.length
    },
    processedCount() {
      return this.totalCount - this.pendingCount
    },
    processedPercent() {
      if (this.totalCount === 0) {
        return 0
      }
      return Math.round(this.processedCount / this.totalCount * 100)
    }
  },
  watch: {
    importStatusFilter(val) {
      if (val === 'all') {
        this.tableConfig.totalData = this.iTotalData
      } else if (val === 'error') {
        this.tableConfig.totalData = this.iTotalData.filter((item) => {
          return item['@status'].name === 'error'
        })
      } else {
        this.tableConfig.totalData = this.iTotalData.filter((item) => {
          return item['@status'] === val
        })
      }
    }
  },
  mounted() {
    this.generateTable()
  },
  methods: {
    generateTableColumns(tableTitles, tableData) {
      const vm = this
      const columns = [{
        prop: '@status',
        label: vm.$t('common.Status'),
        width: '80px',
        align: 'center',
        formatter: StatusFormatter,
        formatterArgs: {
          iconChoices: {
            ok: 'fa-check text-primary',
            error: 'fa-times text-danger',
            pending: 'fa-clock-o'
          },
          getChoicesKey(val) {
            if (val === 'ok' || val === 'pending') {
              return val
            }
            return 'error'
          },
          getTip(val, col) {
            if (val === 'ok') {
              return vm.$t('common.Success')
            } else if (val === 'pending') {
              return vm.$t('common.Pending')
            } else if (val && val.name === 'error') {
              return val.error
            }
            return ''
          },
          hasTips: true
        }
      }]
      for (const item of tableTitles) {
        const dataItemLens = tableData.map(d => {
          const prop = item[1]
          const itemColData = d[prop]
          if (!d) {
            return 0
          }
          if (!itemColData || !itemColData.length) {
            return 0
          }
          return itemColData.length
        })
        let colMaxWidth = Math.max(...dataItemLens) * 10
        if (colMaxWidth === 0) {
          continue
        }
        colMaxWidth = Math.min(180, colMaxWidth)
        colMaxWidth = Math.max(colMaxWidth, 100)
        columns.push({
          prop: item[1],
          label: item[0],
          minWidth: colMaxWidth + 'px',
          showOverflowTooltip: true,
          formatter: EditableInputFormatter
        })
      }
      return columns
    },
    generateTableData(tableTitles, tableData) {
      const totalData = []
      tableData.forEach(item => {
        this.$set(item, '@status', 'pending')
        totalData.push(item)
      })
      return totalData
    },
    generateTable() {
      const tableTitles = this.jsonData['title']
      const tableData = this.jsonData['data']
      const columns = this.generateTableColumns(tableTitles, tableData)
      const totalData = this.generateTableData(tableTitles, tableData)
      this.tableConfig.columns = columns
      this.tableGenDone = true
      setTimeout(() => {
        this.iTotalData = totalData
        this.tableConfig.totalData = totalData
      }, 200)
    },
    beautifyErrorData(errorData) {
      if (typeof errorData === 'string') {
        return errorData
      } else if (Array.isArray(errorData)) {
        return errorData
      } else if (typeof errorData !== 'object') {
        return errorData
      }
      const data = []
      // eslint-disable-next-line prefer-const
      for (let [key, value] of Object.entries(errorData)) {
        if (typeof value === 'object') {
          value = this.beautifyErrorData(value)
        }
        let label = this.tableColumnNameMapper[key]
        if (!label) {
          label = key
        }
        data.push(`${label}: ${value}`)
      }
      return data
    },
    performCancel() {
      this.$emit('cancel')
    },
    performFinish() {
      this.$emit('finish')
    },
    performImportAction() {
      switch (this.importAction) {
        case 'continue':
          return this.performContinue()
        case 'import':
          return this.performUpload()
        case 'stop':
          return this.performStop()
        case 'finished':
          return this.performFinish()
      }
    },
    performContinue() {
      for (const item of this.failedData) {
        item['@status'] = 'pending'
      }
      setTimeout(() => {
        this.performUpload()
      }, 100)
    },
    performStop() {
      this.importTaskStatus = 'stopped'
    },
    async performUpload() {
      this.importTaskStatus = 'started'
      for (const item of this.pendingData) {
        if (this.importTaskStatus === 'stopped') {
          return
        }
        await this.performUploadObject(item)
        await sleep(100)
      }
      this.importTaskStatus = 'done'
      if (this.failedCount > 0) {
        this.$message.error(this.$t('common.imExport.hasImportErrorItemMsg') + '')
      }
    },
    async performUpdateObject(item) {
      const updateUrl = `${this.url}${item.id}/`
      return this.$axios.put(
        updateUrl,
        item,
        { disableFlashErrorMsg: true }
      )
    },
    async performUploadObject(item) {
      let handler = this.performCreateObject
      if (this.importOption === 'update') {
        handler = this.performUpdateObject
      }
      try {
        await handler.bind(this)(item)
        item['@status'] = 'ok'
      } catch (error) {
        const errorData = error?.response?.data
        const _error = this.beautifyErrorData(errorData)
        item['@status'] = {
          name: 'error',
          error: _error
        }
      } finally {
        const tableRef = document.getElementById('importTable')
        const pendingRef = tableRef?.getElementsByClassName('pendingStatus')[0]
        if (pendingRef) {
          const parentTdRef = pendingRef.parentElement.parentElement.parentElement.parentElement
          if (!this.isElementInViewport(parentTdRef)) {
            parentTdRef.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'start' })
          }
        }
      }
    },
    async performCreateObject(item) {
      return this.$axios.post(
        this.url,
        item,
        { disableFlashErrorMsg: true }
      )
    },
    isElementInViewport(el) {
      const rect = el.getBoundingClientRect()
      let windowInnerHeight = window.innerHeight || document.documentElement.clientHeight
      windowInnerHeight = windowInnerHeight * 0.97 - 150
      return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowInnerHeight
      )
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/element-variables.scss";
.summary-item {
  padding: 0 10px
}

.summary-success {
  color: $--color-primary;
}

.summary-failed {
  color: $--color-danger;
}

</style>
