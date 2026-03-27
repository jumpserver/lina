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
            <el-dropdown-item command="history">{{ $t('ExecutionHistory') }}</el-dropdown-item>
            <el-dropdown-item v-if="canDeleteReport" command="delete" divided>{{ $t('Delete') }}</el-dropdown-item>
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
        <el-button class="export-btn" type="text" icon="el-icon-message" @click="emailReport">
          {{ $t('EMailReport') }}
        </el-button>
        <el-button class="export-btn" type="text" icon="el-icon-printer" @click="printReport">
          {{ $t('Print') }}
        </el-button>
      </template>
    </el-button-group>

    <CreateReportDialog
      :default-days="getDaysParam()"
      :report="editingReport"
      :report-title="title"
      :report-type="name"
      :visible.sync="showCreateDialog"
      @created="handleCreated"
    />
    <ReportExportDialog
      :report-id="reportId"
      :report-name="title"
      :report-query="$route.query"
      :visible.sync="showExportDialog"
    />
    <ReportExecutionDrawer
      :report-id="reportId"
      :report-name="title"
      :visible.sync="showExecutionDrawer"
    />
  </div>
</template>

<script>
import { download } from '@/utils/common'
import CreateReportDialog from './CreateReportDialog.vue'
import ReportExecutionDrawer from './ReportExecutionDrawer.vue'
import ReportExportDialog from './ReportExportDialog.vue'
import { appendQuery, pickReportQuery } from './reportUtils'

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
    ReportExecutionDrawer,
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
    }
  },
  data() {
    return {
      exportLoading: false,
      reportData: null,
      showCreateDialog: false,
      showExecutionDrawer: false,
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
      const filters = {}
      if (query.range_preset) {
        filters.range_preset = query.range_preset
      }
      if (query.start) {
        filters.start = query.start
      }
      if (query.end) {
        filters.end = query.end
      }
      const key = this.filterField
      const filterValue = key ? query[key] : ''
      if (key && filterValue) {
        filters[key] = filterValue
      }
      if (this.isCustomReport) {
        return {
          ...(this.reportData || {}),
          filters: {
            ...(this.reportData?.filters || {}),
            ...filters
          }
        }
      }
      return {
        filters
      }
    },
    filterField() {
      return {
        UserLoginReport: 'user_id',
        UserChangePasswordReport: 'user_id',
        AssetStatistics: 'asset_id',
        AssetReport: 'asset_id',
        AccountStatistics: 'account',
        AccountAutomationReport: 'account'
      }[this.name] || ''
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
    async loadReportDetail() {
      this.reportData = await this.$axios.get(`/api/v1/reports/reports/${this.reportId}/`)
    },
    checkName() {
      if (!this.name) {
        this.$message.error('Please select a chart')
        return false
      }
      return true
    },
    getDaysParam() {
      return this.$route.query.days || localStorage.getItem(this.name) || '7'
    },
    exportPdf() {
      if (!this.checkName()) {
        return
      }
      const query = pickReportQuery(this.$route.query)
      const exportUrl = appendQuery('/core/reports/export-pdf/', {
        chart: this.name,
        days: this.getDaysParam(),
        ...query
      })
      this.$message.success(this.$t('Export') + '...')
      download(exportUrl)
    },
    emailReport() {
      if (!this.checkName()) {
        return
      }
      const query = pickReportQuery(this.$route.query)
      const url = appendQuery('/core/reports/send-mail/', {
        chart: this.name,
        days: this.getDaysParam(),
        ...query
      })
      this.$message.success(this.$t('EMailReport') + '...')
      this.$axios.post(url).then((res) => {
        if (res.error) {
          this.$message.error(res.error)
        } else {
          this.$message.success(res.message)
        }
      }).catch(error => {
        this.$message.error(this.$t('Failed') + ': ' + error.message)
      })
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
      if (command === 'history') {
        this.showExecutionDrawer = true
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
      this.$router.push({
        path: this.$route.path,
        query: {
          report_id: report.id
        }
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
