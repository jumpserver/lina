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
        <el-input v-model="form.name" :maxlength="32" show-word-limit />
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

      <template v-if="showVisibilityOptions">
        <el-form-item v-if="chartOptions.length" :label="$t('ChartReport')">
          <el-checkbox-group v-model="form.visibleCharts">
            <el-checkbox v-for="item in chartOptions" :key="item.name" :label="item.name">
              {{ item.title }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item v-if="tableOptions.length" :label="$t('TableDetails')">
          <el-checkbox-group v-model="form.visibleTables">
            <el-checkbox v-for="item in tableOptions" :key="item.name" :label="item.name">
              {{ item.title }}
            </el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </template>
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
    showVisibilityOptions: {
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
      presetOptions: REPORT_RANGE_PRESET_OPTIONS
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
    rules() {
      return {
        name: [
          { required: true, message: this.$t('ThisFieldIsRequired'), trigger: 'blur' },
          { max: 32, message: this.$t('NameTooLong32'), trigger: 'blur' },
          { validator: this.validateNameNotDuplicate, trigger: 'blur' }
        ]
      }
    }
  },

  watch: {
    visible(val) {
      if (val) {
        this.form = this.getInitialForm()
        this.$nextTick(() => {
          this.$refs.form && this.$refs.form.clearValidate()
        })
      }
    },
    'form.name'() {
      this.$nextTick(() => {
        this.$refs.form && this.$refs.form.clearValidate('name')
      })
    }
  },
  methods: {
    normalizeDays(days) {
      return normalizeReportDays(days, '7')
    },
    getInitialForm() {
      const report = this.report || {}
      const reportDays = this.normalizeDays(report.days || this.defaultDays || '7')
      const filters = report.filters || {}
      const visibleCharts = Array.isArray(filters.visible_charts)
        ? filters.visible_charts
        : [...this.defaultVisibleCharts]
      const visibleTables = Array.isArray(filters.visible_tables)
        ? filters.visible_tables
        : [...this.defaultVisibleTables]
      return {
        name: report.name || getDefaultName(this.reportTitle || this.reportType || 'report'),
        days: reportDays,
        visibleCharts,
        visibleTables
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
    validateNameNotDuplicate(rule, value, callback) {
      const name = (value || '').trim()
      if (!name) return callback()
      this.$axios.get('/api/v1/reports/reports/', { params: { name } })
        .then(res => {
          const list = Array.isArray(res) ? res : (res.results || [])
          const conflicting = list.filter(item => !this.isEdit || String(item.id) !== String(this.report?.id))
          if (conflicting.length > 0) {
            callback(new Error(this.$t('ReportNameAlreadyExists')))
          } else {
            callback()
          }
        })
        .catch(() => callback())
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

