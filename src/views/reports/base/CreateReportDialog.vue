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
import { normalizeReportDays } from './reportUtils'

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
      form: this.getInitialForm()
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
    normalizeSelection(raw, options = [], fallback = []) {
      if (Array.isArray(raw) && raw.length === 0) return []
      const safeOptions = Array.isArray(options) ? options : []
      const optionNames = safeOptions
        .map((item) => String(item && item.name ? item.name : '').trim())
        .filter(Boolean)
      const optionNameSet = new Set(optionNames)
      const titleToName = safeOptions.reduce((acc, item) => {
        const title = String(item && item.title ? item.title : '').trim()
        if (title && item && item.name) acc[title] = String(item.name).trim()
        return acc
      }, {})
      const toName = (v) => {
        const s = String(v).trim()
        if (optionNameSet.has(s)) return s
        return titleToName[s] || ''
      }
      const picked = (Array.isArray(raw) ? raw : []).map(toName).filter(Boolean)
      if (picked.length) {
        return Array.from(new Set(picked))
      }
      const fallbackPicked = (Array.isArray(fallback) ? fallback : []).map(toName).filter(Boolean)
      return fallbackPicked.length ? Array.from(new Set(fallbackPicked)) : optionNames
    },
    getInitialForm() {
      const report = this.report || {}
      const filters = report.filters || {}
      const visibleCharts = this.normalizeSelection(
        this.defaultVisibleCharts,
        this.chartOptions,
        filters.visible_charts
      )
      const visibleTables = this.normalizeSelection(
        this.defaultVisibleTables,
        this.tableOptions,
        filters.visible_tables
      )
      return {
        name: report.name || getDefaultName(this.reportTitle || this.reportType || 'report'),
        visibleCharts,
        visibleTables
      }
    },
    getPayload() {
      const rangeDays = parseInt(this.normalizeDays(this.defaultDays), 10)
      const visibleCharts = this.normalizeSelection(
        this.form.visibleCharts,
        this.chartOptions,
        this.defaultVisibleCharts
      )
      const visibleTables = this.normalizeSelection(
        this.form.visibleTables,
        this.tableOptions,
        this.defaultVisibleTables
      )
      return {
        name: this.form.name,
        tp: this.reportType,
        is_active: true,
        days: rangeDays,
        filters: {
          visible_charts: visibleCharts,
          visible_tables: visibleTables
        }
      }
    },
    handleClose() {
      this.iVisible = false
    },
    validateNameNotDuplicate(rule, value, callback) {
      const name = (value || '').trim()
      if (!name) return callback()
      if (this.isEdit && name === (this.report?.name || '').trim()) {
        return callback()
      }
      this.$axios
        .get('/api/v1/reports/reports/', { params: { name } })
        .then((res) => {
          const list = Array.isArray(res) ? res : res.results || []
          const conflicting = list.filter(
            (item) => !this.isEdit || String(item.id) !== String(this.report?.id)
          )
          if (conflicting.length > 0) {
            callback(new Error(this.$t('ReportNameAlreadyExists')))
          } else {
            callback()
          }
        })
        .catch(() => callback())
    },
    handleSubmit() {
      const payload = this.getPayload()
      this.$refs.form.validate(async (valid) => {
        if (!valid) {
          return
        }
        this.submitting = true
        try {
          const url = this.isEdit
            ? `/api/v1/reports/reports/${this.report.id}/`
            : '/api/v1/reports/reports/'
          const method = this.isEdit ? 'put' : 'post'
          const res = await this.$axios[method](url, payload)
          this.$message.success(
            this.isEdit ? this.$t('UpdateSuccessMsg') : this.$t('CreateSuccessMsg')
          )
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

:deep(.el-input__count) {
  color: #909399;
}
</style>
