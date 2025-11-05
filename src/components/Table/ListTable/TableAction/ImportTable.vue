<template>
  <div>
    <div class="tableFilter">
      <el-radio-group v-model="importStatusFilter" size="mini">
        <el-radio-button label="all">{{ $t('Total') }}: {{ totalCount }}</el-radio-button>
        <el-radio-button label="ok">{{ $t('Success') }}: {{ successCount }}</el-radio-button>
        <el-radio-button label="error">{{ $t('Failed') }}: {{ failedCount }}</el-radio-button>
        <el-radio-button label="pending">{{ $t('Pending') }}: {{ pendingCount }}</el-radio-button>
      </el-radio-group>
    </div>
    <div class="row">
      <el-progress :percentage="processedPercent" />
    </div>
    <DataTable v-if="tableGenDone" id="importTable" ref="dataTable" :config="tableConfig" class="importTable" />
    <div class="row" style="padding-top: 20px">
      <div class="btn-groups">
        <el-button v-if="showCancel" size="small" @click="performCancel">{{ $t('Cancel') }}</el-button>
        <el-button
          v-show="!disableImportBtn"
          size="small"
          type="primary"
          @click="performImportAction"
        >
          {{ importActionTitle }}
        </el-button>
        <el-button
          v-for="button in moreButtons"
          v-show="!button.hidden"
          :key="button.title"
          :disabled="disableImportBtn"
          :loading="button.loading"
          size="small"
          v-bind="button"
          @click="handleClick(button)"
        >
          {{ button.title }}
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import DataTable from '@/components/Table/DataTable/index.vue'
import { getUpdateObjURL } from '@/utils/common/index'
import { sleep } from '@/utils/common/time'
import { EditableInputFormatter } from '@/components/Table/TableFormatters'
import { encryptPassword } from '@/utils/secure'
import getStatusColumnMeta from '@/components/Table/ListTable/TableAction/const'

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
      default: () => ''
    },
    importOption: {
      type: String,
      required: true
    },
    showButtons: {
      type: Boolean,
      default: () => true
    },
    config: {
      type: Object,
      default: () => ({})
    },
    performUploadObject: {
      type: Function,
      default: null
    },
    canEdit: {
      type: Boolean,
      default: () => true
    },
    showCancel: {
      type: Boolean,
      default: () => true
    },
    moreButtons: {
      type: Array,
      default: () => []
    },
    disableImportBtn: {
      type: Boolean,
      default: false
    },
    origin: {
      type: String,
      default: ''
    },
    encryptFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      columns: [],
      importStatusFilter: 'all',
      iTotalData: [],
      defaultTableConfig: {
        url: '',
        hasSelection: false,
        // hasPagination: false,
        columns: [],
        totalData: [],
        paginationSize: 10,
        paginationSizes: [10],
        tableAttrs: {
          stripe: true, // 斑马纹表格
          border: true, // 表格边框
          fit: true, // 宽度自适应,
          tooltipEffect: 'dark',
          maxHeight: this.tableHeight
        }
      },
      tableGenDone: false,
      importTaskStatus: 'pending', // pending, started, stopped, done
      importTaskResult: '', // success, hasError
      hasImport: false,
      hasContinueButton: false,
      importActions: {
        import: this.$t('Import'),
        continue: this.$t('Continue'),
        stop: this.$t('Stop'),
        finished: this.$t('Finished')
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
    },
    elDataTable() {
      return this.$refs['dataTable'].dataTable
    },
    tableConfig() {
      const tableDefaultConfig = this.defaultTableConfig
      let tableAttrs = tableDefaultConfig.tableAttrs
      if (this.config.tableAttrs) {
        tableAttrs = Object.assign(tableAttrs, this.config.tableAttrs)
      }
      const config = Object.assign(tableDefaultConfig, this.config)
      config.tableAttrs = tableAttrs
      return config
    }
  },
  watch: {
    importStatusFilter(val) {
      if (val === 'all') {
        this.tableConfig.totalData = this.iTotalData
      } else if (val === 'error') {
        this.tableConfig.totalData = this.failedData
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
      const columns = [{ ...getStatusColumnMeta.bind(this)().status }]
      for (const item of tableTitles) {
        const dataItemLens = tableData.map(d => {
          if (!d) {
            return 0
          }
          const prop = item[1]
          const itemColData = d[prop]
          if (typeof itemColData === 'boolean') {
            return 5 // boolean is 5 characters long 并且 boolean.length 是 undefined
          } else if (typeof itemColData === 'number') {
            return itemColData.toString().length
          } else if (typeof itemColData === 'string') {
            return itemColData.length
          } else if (typeof itemColData === 'object') {
            if (!itemColData || itemColData.length === 0) {
              return 0
            } else {
              return JSON.stringify(itemColData).length
            }
          }
          return 0
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
          formatter: EditableInputFormatter,
          showOverflowTooltip: true,
          formatterArgs: {
            canEdit: this.canEdit,
            onEnter: ({ row, col, oldValue, newValue }) => {
              const prop = col.prop
              row['@status'] = 'pending'
              this.$log.debug(`Set value ${oldValue} => ${newValue}`)
              this.$set(row, prop, newValue)
            }
          }
        })
      }
      return columns
    },
    getEncryptFields() {
      const fromProp = Array.isArray(this.encryptFields) && this.encryptFields.length ? this.encryptFields : null
      return fromProp || ['password', 'secret', 'private_key']
    },
    generateTableData(tableTitles, tableData) {
      const totalData = []
      tableData.forEach(item => {
        this.$set(item, '@status', 'pending')
        const encryptFields = this.getEncryptFields()
        for (const field of encryptFields) {
          if (item[field]) {
            item[field] = encryptPassword(item[field])
          }
        }
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
        if (Array.isArray(value)) {
          value = JSON.stringify(value)
        } else if (typeof value === 'object') {
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
      this.performStop()
      this.$emit('cancel')
    },
    performFinish() {
      this.performStop()
      this.$emit('finish')
    },
    taskIsStopped() {
      return this.importTaskStatus === 'stopped'
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
      if (this.importTaskStatus === 'done') {
        for (const item of this.failedData) {
          item['@status'] = 'pending'
        }
        this.tableConfig.totalData = this.pendingData
      }
      this.importTaskStatus = 'started'
      setTimeout(() => {
        this.performUpload()
      }, 100)
    },
    performStop() {
      this.importTaskStatus = 'stopped'
    },
    async performUploadCurrentPageData() {
      let currentData
      if (this.tableConfig.hasSelection) {
        currentData = this.elDataTable.selected
      } else {
        currentData = this.elDataTable.getPageData()
      }
      for (const item of currentData) {
        if (item['@status'] !== 'pending') {
          continue
        }
        if (this.taskIsStopped()) {
          return
        }
        const handler = this.performUploadObject || this.defaultPerformUploadObject
        await handler(item)
        await sleep(100)
      }
    },
    async performUpload() {
      this.importTaskStatus = 'started'
      this.importStatusFilter = 'pending'
      while (!this.taskIsStopped()) {
        await this.performUploadCurrentPageData()
        const hasNextPage = this.elDataTable.hasNextPage()
        if (hasNextPage && !this.taskIsStopped()) {
          await this.elDataTable.gotoNextPage()
          await sleep(100)
        } else {
          break
        }
      }
      this.importTaskStatus = 'done'

      // 在不影响其他组件使用本组件的基础上，对云同步中导入按钮的变化
      if (this.origin === 'cloudSync') {
        this.tableConfig.totalData = this.pendingData
        this.importTaskStatus = 'pending'
      }

      if (this.failedCount > 0) {
        this.$message.error(this.$tc('HasImportErrorItemMsg') + '')
      }
    },
    async performUpdateObject(item) {
      const updateUrl = getUpdateObjURL(this.url, item.id)
      return this.$axios.patch(
        updateUrl,
        item,
        { disableFlashErrorMsg: true }
      )
    },
    async defaultPerformUploadObject(item) {
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
      }
    },
    async performCreateObject(item) {
      return this.$axios.post(
        this.url,
        item,
        { disableFlashErrorMsg: true }
      )
    },
    keepElementInViewport() {
      const tableRef = document.getElementById('importTable')
      const pendingRef = tableRef?.getElementsByClassName('pendingStatus')[0]
      if (!pendingRef) {
        return
      }
      const parentTdRef = pendingRef.parentElement.parentElement.parentElement.parentElement
      const rect = parentTdRef.getBoundingClientRect()
      let windowInnerHeight = window.innerHeight || document.documentElement.clientHeight
      windowInnerHeight = windowInnerHeight * 0.97 - 150
      const inViewport = (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= windowInnerHeight
      )
      if (!inViewport) {
        parentTdRef.scrollIntoView({ behavior: 'auto', block: 'start', inline: 'start' })
      }
    },
    addTableItem(item) {
      this.tableConfig.totalData.push(item)
    },
    handleClick(btn) {
      const callback = btn.callback || function() {
      }
      callback(btn)
    }
  }
}
</script>

<style lang="scss" scoped>
@import "~@/styles/variables";

.summary-item {
  padding: 0 10px
}

.summary-success {
  color: $--color-primary;
}

.summary-failed {
  color: $--color-danger;
}

.importTable ::v-deep .cell {
  min-height: 20px;
  height: 100%;
  max-height: 160px;
}

.btn-groups {
  display: flex;
  justify-content: flex-end;

  ::v-deep .el-button.is-disabled {
    cursor: not-allowed;
  }
}
</style>
