<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-confirm="exportType !== 'table'"
    :title="$t('Export')"
    :visible.sync="iVisible"
    top="8vh"
    width="900px"
    @cancel="handleClose"
    @confirm="handleConfirm"
  >
    <div class="export-dialog">
      <el-radio-group v-model="exportType" size="small" @change="handleTypeChange">
        <el-radio-button label="table">Table</el-radio-button>
        <el-radio-button label="xlsx">Excel</el-radio-button>
      </el-radio-group>

      <div v-if="exportType === 'table'" v-loading="loading" class="table-preview">
        <div v-if="Array.isArray(tableData)">
          <div v-for="(t, idx) in tableData" :key="t.name || idx" style="margin-bottom: 12px">
            <div class="chart-container-title" v-if="t.name">
              <div class="chart-container-title-text">{{ t.name }}</div>
            </div>
            <el-table :data="t.rows" border height="240">
              <el-table-column
                v-for="column in t.columns"
                :key="column.key"
                :label="column.label"
                :prop="column.key"
                min-width="140"
              />
            </el-table>
          </div>
        </div>
        <div v-else>
          <el-empty v-if="!tableData.rows || !tableData.rows.length" description="No data" />
          <el-table v-else :data="tableData.rows" border height="420">
            <el-table-column
              v-for="column in tableData.columns"
              :key="column.key"
              :label="column.label"
              :prop="column.key"
              min-width="140"
            />
          </el-table>
        </div>
      </div>

      <div v-else class="excel-preview">
        <p>{{ reportName || $t('Report') }}</p>
        <p>将下载当前报告的 Excel 文件。</p>
      </div>
    </div>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { download } from '@/utils/common'
import { appendQuery, pickReportQuery } from './reportUtils'

export default {
  name: 'ReportExportDialog',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    reportId: {
      type: String,
      default: ''
    },
    reportName: {
      type: String,
      default: ''
    },
    reportQuery: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      exportType: 'table',
      loading: false,
      tableData: {
        columns: [],
        rows: []
      }
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.exportType = 'table'
        this.loadTableData()
      }
    }
  },
  methods: {
    async loadTableData() {
      if (!this.reportId) {
        return
      }
      this.loading = true
      try {
        const data = await this.$axios.get(
          appendQuery(`/api/v1/reports/reports/${this.reportId}/data/`, {
            ...pickReportQuery(this.reportQuery),
            export: 'table'
          })
        )
        this.tableData = {
          columns: data.columns || [],
          rows: data.rows || []
        }
      } finally {
        this.loading = false
      }
    },
    handleTypeChange(val) {
      if (val === 'table') {
        this.loadTableData()
      }
    },
    handleConfirm() {
      if (!this.reportId) {
        return
      }
      download(
        appendQuery(`/api/v1/reports/reports/${this.reportId}/data/`, {
          ...pickReportQuery(this.reportQuery),
          export: this.exportType
        })
      )
      this.handleClose()
    },
    handleClose() {
      this.iVisible = false
    }
  }
}
</script>

<style lang="scss" scoped>
.export-dialog {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.excel-preview {
  min-height: 160px;
  color: var(--color-text-primary);
}
</style>
