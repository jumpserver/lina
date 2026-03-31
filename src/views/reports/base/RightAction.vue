<template>
  <div :class="['nav-bar-right', 'export-bar', { 'editor-only': editorOnly }]">
    <el-button-group>
      <template v-if="showCustomActions">
        <el-dropdown v-if="showOperationDropdown" class="export-btn" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ $t('Operation') }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="canSaveReport" command="edit">{{ $t('Edit') }}</el-dropdown-item>
            <el-dropdown-item v-if="canDeleteReport" :divided="canSaveReport" command="delete">{{ $t('Delete') }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <template v-if="!showOperationOnlyInEditor || !editorOnly">
          <el-button class="export-btn" type="text" icon="el-icon-download" @click="showExportDialog = true">
            {{ $t('Export') }}
          </el-button>
          <el-button class="export-btn" type="text" icon="el-icon-printer" @click="printReport">
            {{ $t('Print') }}
          </el-button>
        </template>
      </template>
      <template v-if="!editorOnly && (!isCustomReport || forceDefaultActions)">
        <el-button class="export-btn" type="text" :icon="isCustomReport ? 'el-icon-edit' : 'el-icon-plus'" @click="openEditor">
          {{ $t('Save') }}
        </el-button>
        <el-button
          :loading="exportLoading"
          :disabled="exportLoading"
          class="export-btn"
          type="text"
          icon="el-icon-printer"
          @click="exportPdf"
        >
          {{ $t('ExportAsPDF') }}
        </el-button>
        <el-button class="export-btn" style="display: none" type="text" icon="el-icon-message" @click="emailReport">
          {{ $t('EMailReport') }}
        </el-button>
        <el-button class="export-btn" type="text" icon="el-icon-printer" @click="printReport">
          {{ $t('Print') }}
        </el-button>
      </template>
    </el-button-group>

    <CreateReportDialog
      :chart-options="chartOptions"
      :default-days="getDaysParam()"
      :default-visible-charts="selectedChartNames"
      :default-visible-tables="selectedTableNames"
      :report="editingReport"
      :report-title="title"
      :report-type="name"
      :table-options="tableOptions"
      :visible.sync="showCreateDialog"
      @created="handleCreated"
    />
    <ReportExportDialog
      :report-id="reportId"
      :report-name="title"
      :report-query="$route.query"
      :visible.sync="showExportDialog"
    />
  </div>
</template>

<script>
import CreateReportDialog from './CreateReportDialog.vue'
import ReportExportDialog from './ReportExportDialog.vue'
import { appendQuery, pickReportQuery, buildCustomReportRouteQuery, normalizeReportDays, fetchReportDetailShared } from './reportUtils'
import { exportElementToPdf } from '@/utils/common/pdf'

const REPORT_ACTION_PERM_MAP = {
  UserLoginReport: {
    create: 'rbac.add_userloginreport',
    delete: 'rbac.delete_userloginreport'
  },
  UserChangePasswordReport: {
    create: 'rbac.add_userchangepasswordreport',
    delete: 'rbac.delete_userchangepasswordreport'
  },
  AssetStatistics: {
    create: 'rbac.add_assetstatisticsreport',
    delete: 'rbac.delete_assetstatisticsreport'
  },
  AssetReport: {
    create: 'rbac.add_assetactivityreport',
    delete: 'rbac.delete_assetactivityreport'
  },
  AccountStatistics: {
    create: 'rbac.add_accountstatisticsreport',
    delete: 'rbac.delete_accountstatisticsreport'
  },
  AccountAutomationReport: {
    create: 'rbac.add_accountautomationreport',
    delete: 'rbac.delete_accountautomationreport'
  }
}

export default {
  name: 'RightAction',
  components: {
    CreateReportDialog,
    ReportExportDialog
  },
  props: {
    name: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    editorOnly: {
      type: Boolean,
      default: false
    },
    showEditorButton: {
      type: Boolean,
      default: false
    },
    showCustomActionsInEditor: {
      type: Boolean,
      default: false
    },
    showOperationOnlyInEditor: {
      type: Boolean,
      default: false
    },
    showOperationDropdown: {
      type: Boolean,
      default: true
    },
    forceDefaultActions: {
      type: Boolean,
      default: false
    },
    chartOptions: {
      type: Array,
      default: () => []
    },
    tableOptions: {
      type: Array,
      default: () => []
    },
    selectedChartNames: {
      type: Array,
      default: () => []
    },
    selectedTableNames: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      exportLoading: false,
      reportData: null,
      showCreateDialog: false,
      showExportDialog: false
    }
  },
  computed: {
    reportId() {
      const v = this.$route.query.report_id
      if (Array.isArray(v)) return v[0]
      return v || ''
    },
    isCustomReport() {
      return !!this.reportId
    },
    reportActionPerms() {
      return REPORT_ACTION_PERM_MAP[this.name] || {}
    },
    canSaveReport() {
      const perm = this.reportActionPerms.create
      return !perm || this.$hasPerm(perm)
    },
    canDeleteReport() {
      if (!this.isCustomReport) {
        return false
      }
      const perm = this.reportActionPerms.delete
      return !perm || this.$hasPerm(perm)
    },
    showCustomActions() {
      if (this.forceDefaultActions) {
        return false
      }
      if (!this.isCustomReport) {
        return false
      }
      if (!this.editorOnly) {
        return true
      }
      return this.showCustomActionsInEditor
    },
    editingReport() {
      const query = this.$route.query || {}
      const reportDays = parseInt(normalizeReportDays(query.days || this.reportData?.days || this.getDaysParam(), '7'), 10)
      if (this.isCustomReport) {
        return {
          ...(this.reportData || {}),
          days: reportDays,
          filters: {
            ...(this.reportData?.filters || {}),
            // 使用当前页面的勾选状态，而不是已保存的状态
            visible_charts: this.selectedChartNames,
            visible_tables: this.selectedTableNames
          }
        }
      }
      return {
        days: reportDays,
        filters: {
          visible_charts: this.selectedChartNames,
          visible_tables: this.selectedTableNames
        }
      }
    }
  },
  watch: {
    reportId: {
      immediate: true,
      handler() {
        if (this.reportId) {
          this.loadReportDetail()
        } else {
          this.reportData = null
        }
      }
    }
  },
  methods: {
    getReportContainer() {
      const contentFromCurrent = this.$el.closest('.content')
      const header = this.$el.closest('.header')
      const contentFromHeaderSibling = header &&
      header.nextElementSibling &&
      header.nextElementSibling.classList &&
      header.nextElementSibling.classList.contains('content')
        ? header.nextElementSibling
        : null
      return contentFromCurrent || contentFromHeaderSibling || window.document.querySelector('.content')
    },
    async loadReportDetail() {
      this.reportData = await fetchReportDetailShared(this.$axios, this.reportId)
    },
    checkName() {
      if (!this.name) {
        this.$message.error('Please select a chart')
        return false
      }
      return true
    },
    getDaysParam() {
      return normalizeReportDays(this.$route.query.days || localStorage.getItem(this.name), '7')
    },
    async exportPdf() {
      if (!this.checkName()) {
        return
      }
      const reportContainer = this.getReportContainer()
      if (!reportContainer) {
        this.$message.error(this.$t('Failed') + ': report content not found')
        return
      }
      this.exportLoading = true
      this.$message.success(this.$t('Export') + '...')
      try {
        await this.$nextTick()
        await exportElementToPdf(reportContainer, { filename: 'report.pdf' })
      } catch (error) {
        this.$message.error(this.$t('Failed') + ': ' + (error && error.message ? error.message : String(error)))
      } finally {
        this.exportLoading = false
      }
    },
    async emailReport() {
      if (!this.checkName()) {
        return
      }
      const reportContainer = this.getReportContainer()
      if (!reportContainer) {
        this.$message.error(this.$t('Failed') + ': report content not found')
        return
      }
      const query = pickReportQuery(this.$route.query)
      const url = appendQuery('/core/reports/send-mail/', {
        chart: this.name,
        days: this.getDaysParam(),
        ...query
      })
      this.$message.success(this.$t('EMailReport') + '...')
      this.exportLoading = true
      try {
        await this.$nextTick()
        const pdfBlob = await exportElementToPdf(reportContainer, {
          filename: 'report.pdf',
          output: 'blob'
        })
        const formData = new FormData()
        formData.append('file', pdfBlob, 'report.pdf')
        const res = await this.$axios.post(url, formData)
        if (res.error) {
          this.$message.error(res.error)
        } else {
          this.$message.success(res.message)
        }
      } catch (error) {
        this.$message.error(this.$t('Failed') + ': ' + error.message)
      } finally {
        this.exportLoading = false
      }
    },
    printReport() {
      window.print()
    },
    openEditor() {
      if (!this.canSaveReport) {
        return
      }
      if (this.isCustomReport && !this.reportData) {
        this.loadReportDetail().then(() => {
          this.showCreateDialog = true
        })
        return
      }
      this.showCreateDialog = true
    },
    handleCommand(command) {
      if (command === 'edit' && this.canSaveReport) {
        this.openEditor()
        return
      }
      if (command === 'delete' && this.canDeleteReport) {
        this.handleDelete()
      }
    },
    async handleDelete() {
      if (!this.canDeleteReport) {
        return
      }
      await this.$confirm(this.$t('ConfirmDeleteReport'), this.$t('Tip'), { type: 'warning' })
      await this.$axios.delete(`/api/v1/reports/reports/${this.reportId}/`)
      this.$message.success(this.$t('DeleteSuccessMsg'))
      this.$router.replace({ path: this.$route.path, query: {} })
    },
    handleCreated(report) {
      const query = {
        ...buildCustomReportRouteQuery(report)
      }
      if (this.$route.query.chart_key) {
        query.chart_key = this.$route.query.chart_key
      }
      this.$router.push({
        path: this.$route.path,
        query
      })
    }
  }
}
</script>
<style scoped lang="scss">
.export-bar {
  padding: 0 16px;
  border-radius: 0 0 4px 4px;
  display: flex;
  align-items: center;
  height: 40px;

  .export-btn {
    background: transparent;
    color: #fff;
    border: none;
    font-weight: 500;
    font-size: 14px;
    margin: 0 2px;
    padding: 8px;

    &.el-button--text {
      color: #fff;
    }

    & + span {
      color: #fff;
      margin-left: 2px;
    }
  }

  .export-btn .el-icon-document,
  .export-btn .el-icon-printer,
  .export-btn .el-icon-message,
  .export-btn .el-icon-download,
  .export-btn .el-icon-plus,
  .export-btn .el-icon-tickets {
    margin-right: 4px;
  }

  .el-button-group {
    background: transparent;
    box-shadow: none;
  }

  .export-btn:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  &.editor-only {
    padding: 0;
    height: auto;

    .el-button-group {
      display: inline-flex;
      align-items: center;
    }

    .export-btn,
    .export-btn.el-button--text,
    .el-dropdown-link {
      color: #333;
    }

    .export-btn,
    .el-dropdown-link {
      display: inline-flex;
      align-items: center;
      height: 32px;
      line-height: 32px;
      padding-top: 0;
      padding-bottom: 0;
    }

    .export-btn:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #333;
    }
  }
}
</style>
