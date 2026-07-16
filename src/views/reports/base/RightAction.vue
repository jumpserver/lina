<template>
  <div :class="['nav-bar-right', 'export-bar', { 'editor-only': editorOnly }]">
    <el-button
      v-if="deleteOnly && isCustomReport && canDeleteReport"
      class="export-btn delete-btn"
      type="text"
      icon="el-icon-delete"
      style="color: #f56c6c"
      @click="handleDelete"
    >
      {{ $t('Delete') }}
    </el-button>
    <el-button-group v-if="!deleteOnly">
      <template v-if="showCustomActions">
        <el-dropdown v-if="showOperationDropdown" class="export-btn" @command="handleCommand">
          <span class="el-dropdown-link">
            {{ $t('Operation') }}
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item v-if="canSaveReport" command="edit">{{
              $t('Edit')
            }}</el-dropdown-item>
            <el-dropdown-item v-if="canDeleteReport" :divided="canSaveReport" command="delete">{{
              $t('Delete')
            }}</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
        <template v-if="!showOperationOnlyInEditor || !editorOnly">
          <el-button
            class="export-btn"
            type="text"
            icon="el-icon-download"
            @click="showExportDialog = true"
          >
            {{ $t('Export') }}
          </el-button>
          <el-button class="export-btn" type="text" icon="el-icon-printer" @click="printReport">
            {{ $t('Print') }}
          </el-button>
        </template>
      </template>
      <template v-if="!editorOnly && (!isCustomReport || forceDefaultActions)">
        <el-button class="export-btn" type="text" :icon="saveActionIcon" @click="openEditor">
          {{ saveActionLabel }}
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
        <el-button class="export-btn" type="text" icon="el-icon-printer" @click="printReport">
          {{ $t('Print') }}
        </el-button>
      </template>
    </el-button-group>

    <CreateReportDialog
      v-if="!deleteOnly"
      :chart-options="chartOptions"
      :default-days="currentDays || getDaysParam()"
      :default-visible-charts="selectedChartNames"
      :default-visible-tables="selectedTableNames"
      :report="editingReport"
      :report-title="title"
      :report-type="name"
      :show-visibility-options="!navMode && !isCustomizeMode"
      :table-options="tableOptions"
      :visible.sync="showCreateDialog"
      @created="handleCreated"
    />
    <ReportExportDialog
      v-if="!deleteOnly"
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
import {
  buildCustomReportRouteQuery,
  normalizeReportDays,
  fetchReportDetailShared,
  invalidateReportDetailCache
} from './reportUtils'
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
    deleteOnly: {
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
    navMode: {
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
    },
    currentDays: {
      type: [String, Number],
      default: ''
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
    saveActionIcon() {
      return this.isCustomReport ? 'el-icon-edit' : 'el-icon-plus'
    },
    saveActionLabel() {
      return this.isCustomReport ? this.$t('Update') : this.$t('Save')
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
      const reportDays = parseInt(
        normalizeReportDays(query.days || this.reportData?.days || this.getDaysParam(), '7'),
        10
      )
      if (this.isCustomReport) {
        const savedFilters =
          this.reportData && this.reportData.filters ? { ...this.reportData.filters } : {}
        return {
          ...(this.reportData || {}),
          days: reportDays,
          filters: savedFilters
        }
      }
      return {
        days: reportDays,
        filters: {
          visible_charts: this.selectedChartNames,
          visible_tables: this.selectedTableNames
        }
      }
    },
    isCustomizeMode() {
      const query = (this.$route && this.$route.query) || {}
      const raw = query.customize
      return String(Array.isArray(raw) ? raw[0] : raw) === '1'
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
      const contentFromHeaderSibling =
        header &&
        header.nextElementSibling &&
        header.nextElementSibling.classList &&
        header.nextElementSibling.classList.contains('content')
          ? header.nextElementSibling
          : null
      return (
        contentFromCurrent || contentFromHeaderSibling || window.document.querySelector('.content')
      )
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
    toggleReportOutputMode(enabled) {
      const reportContainer = this.getReportContainer()
      if (!reportContainer) {
        return () => {}
      }
      reportContainer.classList.toggle('report-output-mode', enabled)
      return () => {
        reportContainer.classList.remove('report-output-mode')
      }
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
        await exportElementToPdf(reportContainer, {
          filename: `${this.title}.pdf`,
          ignoreElements: function (el) {
            if (!el || !el.classList) return false
            return (
              el.classList.contains('report-visibility-panel') ||
              el.classList.contains('report-item-hidden')
            )
          }
        })
      } catch (error) {
        this.$message.error(
          this.$t('Failed') + ': ' + (error && error.message ? error.message : String(error))
        )
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
      this.$eventBus.$emit('reportCatalogChanged')
      this.$router.replace({ path: this.$route.path, query: {} }).catch(() => {})
    },
    handleCreated(report) {
      invalidateReportDetailCache(report.id)
      this.reportData = null
      const reportQuery = buildCustomReportRouteQuery(report)
      const rq = this.$route.query || {}
      const query = { report_id: reportQuery.report_id }
      if (rq.chart_key) query.chart_key = rq.chart_key
      if (rq.customize) query.customize = rq.customize
      this.$router.push({ path: this.$route.path, query }).catch(() => {
        this.$eventBus.$emit('reportForceRefresh', String(report.id))
      })
      this.$eventBus.$emit('reportCatalogChanged')
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

    &.delete-btn,
    &.delete-btn.el-button--text {
      color: #f56c6c;
      &:hover {
        color: #f78989;
      }
    }

    & + span {
      color: #fff;
      margin-left: 2px;
    }
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
