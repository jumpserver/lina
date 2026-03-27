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

      <el-form-item :label="$t('ReportPeriodicExecution')">
        <el-switch v-model="form.is_periodic" />
      </el-form-item>

      <template v-if="form.is_periodic">
        <el-form-item :label="$t('Interval')" prop="interval">
          <el-input-number v-model="form.interval" :min="1" :precision="0" style="width: 100%" />
        </el-form-item>

        <el-form-item :label="$t('Crontab')">
          <CronTab v-model="form.crontab" />
          <div class="form-help-text">{{ $t('ReportSchedulePriorityTip') }}</div>
        </el-form-item>

        <el-form-item :label="$t('ReportRecipientsLabel')" prop="recipients">
          <Select2 v-model="form.recipients" v-bind="recipientSelect" />
          <div class="form-help-text">{{ $t('ReportRecipientsTip') }}</div>
        </el-form-item>
      </template>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import Select2 from '@/components/Form/FormFields/Select2.vue'
import CronTab from '@/components/Form/FormFields/CronTab/index.vue'
import { REPORT_PRESET_DAYS_MAP, REPORT_RANGE_PRESET_OPTIONS } from './reportUtils'

const FILTER_FIELD_MAP = {
  UserLoginReport: 'user_id',
  UserChangePasswordReport: 'user_id',
  AssetStatistics: 'asset_id',
  AssetReport: 'asset_id',
  AccountStatistics: 'account',
  AccountAutomationReport: 'account'
}

function getDefaultName(title) {
  const now = new Date()
  const date = now.toISOString().slice(0, 10)
  return `${title}-${date}`
}

function normalizeRecipients(value) {
  if (Array.isArray(value)) {
    return value
  }
  if (value && Array.isArray(value.ids)) {
    return value.ids
  }
  return []
}

export default {
  name: 'CreateReportDialog',
  components: {
    CronTab,
    Dialog,
    Select2
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
    }
  },
  data() {
    const validateCustomRange = (rule, value, callback) => {
      if (this.form.range_preset !== 'custom') {
        callback()
        return
      }
      if (!Array.isArray(value) || value.length !== 2 || !value[0] || !value[1]) {
        callback(new Error(this.$t('SelectStartAndEndDate')))
        return
      }
      callback()
    }
    const validateRecipients = (rule, value, callback) => {
      if (!this.form.is_periodic) {
        callback()
        return
      }
      if (!Array.isArray(value) || value.length === 0) {
        callback(new Error(this.$t('PleaseSelectRecipients')))
        return
      }
      callback()
    }
    const validateSchedule = (rule, value, callback) => {
      if (!this.form.is_periodic) {
        callback()
        return
      }
      if (!this.form.interval && !this.form.crontab) {
        callback(new Error(this.$t('RequireIntervalOrCrontabSetting')))
        return
      }
      callback()
    }
    return {
      submitting: false,
      form: this.getInitialForm(),
      presetOptions: REPORT_RANGE_PRESET_OPTIONS,
      rules: {
        name: [{ required: true, message: this.$t('ThisFieldIsRequired'), trigger: 'blur' }],
        range_preset: [{ required: true, message: this.$t('PleaseSelectTimeRange'), trigger: 'change' }],
        date_range: [{ validator: validateCustomRange, trigger: 'change' }],
        interval: [{ validator: validateSchedule, trigger: 'change' }],
        recipients: [{ validator: validateRecipients, trigger: 'change' }]
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
    filterField() {
      return FILTER_FIELD_MAP[this.reportType] || ''
    },
    isEdit() {
      return !!this.report?.id
    },
    filterLabel() {
      return {
        user_id: this.$t('UserFilterLabel'),
        asset_id: this.$t('AssetFilterLabel'),
        account: this.$t('AccountFilterLabel')
      }[this.filterField] || ''
    },
    recipientSelect() {
      return {
        ajax: {
          url: '/api/v1/users/users/?fields_size=mini',
          transformOption: (item) => ({ label: `${item.name}(${item.username})`, value: item.id })
        }
      }
    },
    filterSelect() {
      if (this.filterField === 'user_id') {
        return {
          multiple: false,
          ajax: {
            url: '/api/v1/users/users/suggestions/',
            transformOption: (item) => ({ label: `${item.name}(${item.username})`, value: item.id })
          }
        }
      }
      if (this.filterField === 'asset_id') {
        return {
          multiple: false,
          ajax: {
            url: '/api/v1/assets/assets/?fields_size=mini',
            transformOption: (item) => ({
              label: item.name || item.address || item.hostname || item.id,
              value: item.id
            })
          }
        }
      }
      if (this.filterField === 'account') {
        return {
          multiple: false,
          ajax: {
            url: '/api/v1/accounts/accounts/?fields_size=mini',
            transformOption: (item) => ({
              label: item.asset ? `${item.username} @ ${item.asset.name}` : item.username,
              value: item.username
            })
          }
        }
      }
      return {}
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
    getInitialForm() {
      const report = this.report || {}
      const filters = report.filters || {}
      const preset = Object.entries(REPORT_PRESET_DAYS_MAP).find(([, days]) => String(days) === String(this.defaultDays))
      let filterValue = ''
      if (this.filterField) {
        // Only accept backend-provided user id options; ignore legacy username strings
        if (report._filter_user_options && report._filter_user_options.user_id && report._filter_user_options.user_id.length) {
          filterValue = report._filter_user_options.user_id[0].id
        } else if (filters[this.filterField]) {
          filterValue = filters[this.filterField]
        } else {
          filterValue = ''
        }
      }
      return {
        name: report.name || getDefaultName(this.reportTitle || this.reportType || 'report'),
        range_preset: filters.range_preset || (filters.start && filters.end ? 'custom' : (preset ? preset[0] : 'last_week')),
        date_range: filters.start && filters.end ? [filters.start, filters.end] : [],
        filter_value: filterValue,
        is_periodic: !!report.is_periodic,
        interval: report.interval || 24,
        crontab: report.crontab || '',
        recipients: normalizeRecipients(report.recipients)
      }
    },
    getPayload() {
      const filters = {}
      let rangeDays = REPORT_PRESET_DAYS_MAP[this.form.range_preset] || parseInt(this.defaultDays) || 7
      if (this.form.range_preset === 'custom') {
        filters.start = this.form.date_range[0]
        filters.end = this.form.date_range[1]
        filters.range_preset = ''
        const start = new Date(`${filters.start}T00:00:00`)
        const end = new Date(`${filters.end}T00:00:00`)
        rangeDays = Math.max(1, Math.round((end - start) / 86400000) + 1)
      } else {
        filters.range_preset = this.form.range_preset
      }
      if (this.filterField && this.form.filter_value) {
        filters[this.filterField] = this.form.filter_value
      }
      return {
        name: this.form.name,
        tp: this.reportType,
        is_active: true,
        range_days: rangeDays,
        filters,
        is_periodic: this.form.is_periodic,
        interval: this.form.is_periodic ? this.form.interval : null,
        crontab: this.form.is_periodic ? (this.form.crontab || '') : '',
        recipients: this.form.recipients.length > 0 ? { type: 'ids', ids: this.form.recipients } : {}
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
