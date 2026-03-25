import { appendQuery, pickReportQuery } from './reportUtils'

const FILTER_FIELD_MAP = {
  UserLoginReport: 'user_id',
  UserChangePasswordReport: 'user_id',
  AssetReport: 'asset_id',
  AssetStatistics: 'asset_id',
  AccountStatistics: 'account',
  AccountAutomationReport: 'account'
}

const TABLE_LABEL_KEY_MAP = {
  user_stats: 'Overview',
  user_by_source: 'LoginSource',
  user_login_log_metrics: 'UserLoginTrends',
  user_login_failed_metrics: 'UserLoginTrends',
  user_login_method_metrics: 'LoginMethodStatistics',
  user_login_time_metrics: 'VisitTimeDistribution',
  session_stats: 'Overview',
  asset_login_log_metrics: 'AssetLoginTrends',
  user_asset_activity_metrics: 'UserAssetActivity',
  asset_stats: 'Overview',
  assets_by_type_category: 'AssetTypeDistribution',
  added_asset_metrics: 'WeeklyGrowthTrend',
  execution_metrics: 'TaskExecutionTrends',
  account_result_metrics: 'AccountResult',
  account_stats: 'Overview',
  automation_stats: 'Overview',
  source_pie: 'AccountCreationSourceDistribution',
  by_connectivity: 'AccountConnectivityStatusDistribution',
  change_secret_account_metrics: 'AccountPasswordChangeTrends',
  top_assets: 'RankByNumberOfAssetAccounts',
  top_version_accounts: 'AccountAndPasswordChangeRank',
  total_count_change_password: 'Overview',
  change_password_top10_users: 'PasswordChangeUserRank',
  change_password_top10_change_bys: 'PasswordChangeOperatorRank',
  user_change_password_metrics: 'PasswordChangeLog'
}

const COLUMN_LABEL_KEY_MAP = {
  date: 'Date',
  name: 'Name',
  metric: 'Metric',
  value: 'Value',
  count: 'Count',
  total: 'Total',
  active: 'Active',
  connected: 'Connectable',
  zone: 'LinkedDomains',
  directory_services: 'ConnectedDirectoryServices',
  platform_count: 'Platform',
  asset_count: 'Asset',
  user_count: 'User',
  not_enabled_mfa: 'NotEnableMfa',
  first_login: 'FirstLogin',
  valid: 'Valid',
  face_vector: 'FaceVector',
  need_update_password: 'NeedUpdatePassword',
  user_total: 'TargetUser',
  change_by_total: 'Operator',
  su_from: 'SuFrom',
  date_change_secret: 'ResetSecret',
  template_total: 'BaseAccountTemplate',
  account_count: 'AccountTotal',
  version: 'Version',
  user: 'Username',
  change_by: 'Username'
}

export default {
  data() {
    return {
      reportDetail: null,
      displayMode: 'chart',
      // now supports multiple tables: array of { name, columns, rows }
      tableData: []
    }
  },
  watch: {
    '$route.fullPath'() {
      this.reportDetail = null
      if (typeof this.getData === 'function') {
        this.getData()
      }
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
    reportTitle() {
      return this.reportDetail?.name || this.title
    },
    filterField() {
      return FILTER_FIELD_MAP[this.name] || ''
    },
    filterLabel() {
      return {
        user_id: this.$t('UserFilterLabel'),
        asset_id: this.$t('AssetFilterLabel'),
        account: this.$t('AccountFilterLabel')
      }[this.filterField] || ''
    },
    currentFilters() {
      const reportFilters = this.reportDetail?.filters || {}
      return {
        range_preset: this.$route.query.range_preset || reportFilters.range_preset || '',
        start: this.$route.query.start || reportFilters.start || '',
        end: this.$route.query.end || reportFilters.end || '',
        filter_value: this.filterField ? (this.$route.query[this.filterField] || reportFilters[this.filterField] || '') : ''
      }
    }
  },
  methods: {
    async ensureReportDetail(reportId = this.reportId) {
      if (!reportId) {
        return null
      }
      if (this.reportDetail?.id === reportId) {
        return this.reportDetail
      }
      const data = await this.$axios.get(`/api/v1/reports/reports/${reportId}/`)
      if (this.reportId !== reportId) {
        return data
      }
      this.reportDetail = data
      if (data?.name) {
        this.title = data.name
      }
      return data
    },
    buildTemplateUrl(baseUrl) {
      const query = pickReportQuery(this.$route.query)
      if (!query.start && !query.end && !query.range_preset && this.days) {
        query.days = this.days
      }
      return appendQuery(baseUrl, query)
    },
    async fetchReportData(baseUrl) {
      const reportId = this.reportId
      const query = pickReportQuery(this.$route.query)
      if (reportId) {
        await this.ensureReportDetail(reportId)
        if (this.reportId !== reportId) {
          return this.fetchReportData(baseUrl)
        }
        return this.$axios.get(appendQuery(`/api/v1/reports/reports/${reportId}/data/`, query))
      }
      return this.$axios.get(this.buildTemplateUrl(baseUrl))
    },
    async loadTableData(baseUrl) {
      const buildLabel = (k) => {
        if (!k) return ''
        const labelKey = TABLE_LABEL_KEY_MAP[k]
        if (labelKey) return this.$t(labelKey)
        return k.replace(/_/g, ' ').replace(/metrics/gi, '').trim()
      }

      const translateColumnLabel = (label) => {
        if (!label) return ''
        const l = String(label).toLowerCase()
        const labelKey = COLUMN_LABEL_KEY_MAP[l]
        if (labelKey) return this.$t(labelKey)
        // specific patterns first to avoid generic 'total' overriding them
        if (l.includes('active_users') || l.includes('total_count_active_users')) return this.$t('ActiveUsers')
        if (l.includes('active_assets') || l.includes('total_count_active_assets')) return this.$t('ActiveAssets')
        if (l.includes('success') || l === 'dates_metrics_total_count_success') return this.$t('Success')
        if (l.includes('failure') || l.includes('failed') || l === 'dates_metrics_total_count_failed') return this.$t('Failed')
        if (l.includes('count')) return this.$t('Count')
        if (l.includes('total')) return this.$t('Total')
        return String(label).replace(/_/g, ' ')
      }

      // Fetch report payload (works for saved reports and templates)
      let obj = null
      try {
        const payload = await this.fetchReportData(baseUrl)
        obj = payload
      } catch (e) {
        obj = null
      }

      if (obj) {
        try {
          const tables = []

          // Helper to build date-based table from a metric object
          const buildDateTable = (groupKey, groupVal) => {
            const dates = groupVal.dates_metrics_date || []
            const rows = dates.map(d => ({ date: d }))
            const columns = [{ key: 'date', label: this.$t('Date') }]

            Object.entries(groupVal).forEach(([k, v]) => {
              if (k === 'dates_metrics_date') return
              // arrays like dates_metrics_success_total
              if (Array.isArray(v)) {
                const colKey = `${groupKey}.${k}`
                const raw = k.replace(/^dates_metrics_?/, '')
                const label = translateColumnLabel(raw)
                columns.push({ key: colKey, label })
                rows.forEach((row, idx) => {
                  row[colKey] = (v && v[idx] !== undefined) ? v[idx] : ''
                })
                return
              }
              // nested objects like dates_metrics_total: { "密码": [..] }
              if (v && typeof v === 'object') {
                Object.entries(v).forEach(([innerKey, innerArr]) => {
                  if (!Array.isArray(innerArr)) return
                  const colKey = `${groupKey}.${innerKey}`
                  const label = translateColumnLabel(innerKey)
                  columns.push({ key: colKey, label })
                  rows.forEach((row, idx) => {
                    row[colKey] = (innerArr && innerArr[idx] !== undefined) ? innerArr[idx] : ''
                  })
                })
              }
            })

            return { name: buildLabel(groupKey), columns, rows }
          }

          // Iterate every top-level key in payload and build appropriate table
          for (const [k, v] of Object.entries(obj)) {
            // skip null/undefined
            if (v === null || v === undefined) continue

            // 1) date-series metric objects
            if (typeof v === 'object' && Array.isArray(v.dates_metrics_date)) {
              tables.push(buildDateTable(k, v))
              continue
            }

            // 2) arrays of {name,value} (e.g., user_by_source)
            if (Array.isArray(v) && v.length && typeof v[0] === 'object' && ('name' in v[0] || 'label' in v[0])) {
              const columns = [{ key: 'name', label: this.$t('Name') }, { key: 'value', label: this.$t('Value') }]
              const rows = v.map(item => ({ name: item.name || item.label || '', value: item.value || item.count || 0 }))
              tables.push({ name: buildLabel(k) || k, columns, rows })
              continue
            }

            // 3) plain object of metric buckets (e.g., user_login_time_metrics, user_stats)
            if (typeof v === 'object') {
              // if its values are primitives (numbers/strings), render key-value table
              const entries = Object.entries(v)
              const primitive = entries.every(([, val]) => (typeof val !== 'object'))
              if (primitive) {
                const columns = [{ key: 'metric', label: this.$t('Metric') }, { key: 'value', label: this.$t('Value') }]
                const rows = entries.map(([kk, vv]) => ({ metric: translateColumnLabel(kk) || kk, value: vv }))
                tables.push({ name: buildLabel(k) || k, columns, rows })
                continue
              }
              // otherwise, attempt to detect nested arrays/object and fallback to date table if matches
              if (entries.some(([, val]) => Array.isArray(val))) {
                tables.push(buildDateTable(k, v))
                continue
              }
            }
          }

          if (tables.length) {
            this.tableData = tables
            return
          }
        } catch (e) {
          // ignore and fallback
          console.error('build table from payload failed', e)
        }
      }

      // fallback: request export=table
      try {
        const fallback = await this.$axios.get(appendQuery(this.buildTemplateUrl(baseUrl), { export: 'table' }))
        this.tableData = fallback
        return
      } catch (e) {
        this.tableData = []
        return
      }
    },
    handleToolbarFilterChange({ range_preset, start, end, filter_value }) {
      const query = {}
      if (this.reportId) {
        query.report_id = this.reportId
      }
      if (range_preset && range_preset !== 'custom') {
        query.range_preset = range_preset
      }
      if (range_preset === 'custom') {
        query.start = start
        query.end = end
      }
      if (this.filterField && filter_value) {
        query[this.filterField] = filter_value
      }
      this.$router.replace({ path: this.$route.path, query })
    },
    getFilterSelect() {
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
            transformOption: (item) => ({ label: item.name || item.address || item.hostname || item.id, value: item.id })
          }
        }
      }
      if (this.filterField === 'account') {
        return {
          multiple: false,
          ajax: {
            url: '/api/v1/accounts/accounts/?fields_size=mini',
            transformOption: (item) => ({ label: item.asset ? `${item.username} @ ${item.asset.name}` : item.username, value: item.username })
          }
        }
      }
      return {}
    },
    async handleDeleteReport() {
      if (!this.reportId) {
        return
      }
      await this.$confirm(this.$t('ConfirmDeleteReport'), this.$t('Tip'), { type: 'warning' })
      await this.$axios.delete(`/api/v1/reports/reports/${this.reportId}/`)
      this.$message.success(this.$t('DeleteSuccessMsg'))
      this.$router.replace({ path: this.$route.path, query: {} })
    }
  }
}