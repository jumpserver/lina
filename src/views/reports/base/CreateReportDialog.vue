<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :disabled-status="submitting"
    :confirm-title="isEdit ? $t('Update') : $t('Confirm')"
    :title="isEdit ? `${$t('Update')} ${$t('Report')}` : `${$t('Create')} ${$t('Report')}`"
    :visible.sync="iVisible"
    top="8vh"
    width="760px"
    @cancel="handleClose"
    @confirm="handleSubmit"
  >
    <el-form ref="form" :model="form" :rules="rules" label-width="110px">
      <el-form-item :label="$t('Name')" prop="name">
        <el-input v-model="form.name" />
      </el-form-item>

      <el-form-item :label="$t('TimeRange')" prop="days">
        <el-select v-model="form.days" style="width: 100%">
          <el-option
            v-for="option in presetOptions"
            :key="option.value"
            :label="option.label"
            :value="option.value"
          />
        </el-select>
      </el-form-item>

      <el-form-item :label="$t('ChartReport')" prop="visibleCharts">
        <el-checkbox-group v-model="form.visibleCharts">
          <el-checkbox
            v-for="item in normalizedChartOptions"
            :key="item.name"
            :label="item.name"
          >
            {{ item.title }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>

      <el-form-item :label="$t('TableDetails')" prop="visibleTables">
        <el-checkbox-group v-model="form.visibleTables">
          <el-checkbox
            v-for="item in normalizedTableOptions"
            :key="item.name"
            :label="item.name"
          >
            {{ item.title }}
          </el-checkbox>
        </el-checkbox-group>
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { REPORT_RANGE_PRESET_OPTIONS, normalizeReportDays } from './reportUtils'

function getDefaultName(title) {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  return `${title}-${date}`
}

export default {
  name: 'CreateReportDialog',
  components: {
    Dialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    reportType: {
      type: String,
      default: ''
    },
    reportTitle: {
      type: String,
      default: ''
    },
    report: {
      type: Object,
      default: () => null
    },
    defaultDays: {
      type: [String, Number],
      default: '7'
    },
    chartOptions: {
      type: Array,
      default: () => []
    },
    tableOptions: {
      type: Array,
      default: () => []
    },
    defaultVisibleCharts: {
      type: Array,
      default: () => []
    },
    defaultVisibleTables: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      submitting: false,
      form: this.getInitialForm(),
      presetOptions: REPORT_RANGE_PRESET_OPTIONS,
      rules: {
        name: [{ required: true, message: this.$t('ThisFieldIsRequired'), trigger: 'blur' }],
        visibleCharts: [{ validator: this.validateVisibleReports, trigger: 'change' }],
        visibleTables: [{ validator: this.validateVisibleReports, trigger: 'change' }]
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
    },
    isEdit() {
      return !!this.report?.id
    },
    normalizedChartOptions() {
      return this.normalizeOptions(this.chartOptions)
    },
    normalizedTableOptions() {
      return this.normalizeOptions(this.tableOptions)
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.form = this.getInitialForm()
      }
    }
  },
  methods: {
    normalizeDays(days) {
      return normalizeReportDays(days, '7')
    },
    normalizeOptions(items = []) {
      if (!Array.isArray(items)) {
        return []
      }
      return items
        .filter(item => item && item.name)
        .map(item => ({
          name: String(item.name),
          title: String(item.title || item.name)
        }))
    },
    normalizeSelection(raw, options = []) {
      const safeOptions = Array.isArray(options) ? options : []
      const optionNames = safeOptions.map(item => item.name)
      const selected = Array.isArray(raw)
        ? raw.map(item => String(item).trim()).filter(Boolean)
        : []
      const filtered = selected.filter(name => optionNames.includes(name))
      return filtered.length ? filtered : optionNames
    },
    validateVisibleReports(rule, value, callback) {
      const total = (this.form.visibleCharts || []).length + (this.form.visibleTables || []).length
      if (total <= 0) {
        callback(new Error(this.$t('PleaseSelectAtLeastOneReportSection')))
        return
      }
      callback()
    },
    getInitialForm() {
      const report = this.report || {}
      const reportDays = this.normalizeDays(report.days || this.defaultDays || '7')
      const filters = report.filters || {}
      const chartOptions = this.normalizedChartOptions
      const tableOptions = this.normalizedTableOptions
      return {
        name: report.name || getDefaultName(this.reportTitle || this.reportType || 'report'),
        days: reportDays,
        visibleCharts: this.normalizeSelection(filters.visible_charts || this.defaultVisibleCharts, chartOptions),
        visibleTables: this.normalizeSelection(filters.visible_tables || this.defaultVisibleTables, tableOptions)
      }
    },
    getPayload() {
      const rangeDays = parseInt(this.normalizeDays(this.form.days), 10)
      return {
        name: this.form.name,
        tp: this.reportType,
        is_active: true,
        days: rangeDays,
        filters: {
          visible_charts: this.form.visibleCharts,
          visible_tables: this.form.visibleTables
        }
      }
    },
    handleClose() {
      this.iVisible = false
    },
    handleSubmit() {
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.submitting = true
        try {
          const url = this.isEdit ? `/api/v1/reports/reports/${this.report.id}/` : '/api/v1/reports/reports/'
          const method = this.isEdit ? 'put' : 'post'
          const res = await this.$axios[method](url, this.getPayload())
          this.$message.success(this.isEdit ? this.$t('UpdateSuccessMsg') : this.$t('CreateSuccessMsg'))
          this.$emit('created', res)
          this.handleClose()
        } finally {
          this.submitting = false
        }
      })
    }
  }
}
</script>

<style scoped>
.form-help-text {
  margin-top: 6px;
  color: #909399;
  font-size: 12px;
  line-height: 1.4;
}
</style>
