import {
  appendQuery,
  normalizeReportDays,
  normalizeVisibleFilterList,
  pickReportQuery,
  reportDebugLog,
  fetchReportDetailShared,
  invalidateReportDetailCache
} from './reportUtils'

const TABLE_LABEL_KEY_MAP = {
  user_stats: 'Overview',
  user_by_source: 'LoginSource',
  user_login_log_metrics: 'UserLoginTrends',
  user_login_failed_metrics: 'UserLoginTrends',
  user_login_method_metrics: 'LoginMethodStatistics',
  user_login_time_metrics: 'VisitTimeDistribution',
  session_stats: 'Overview',
  asset_login_log_metrics: 'AssetLoginTrends',
  asset_login_by_type: 'OperatingSystemDistributionOfLoginAssets',
  asset_login_by_from: 'DistributionOfAssetLoginMethods',
  asset_login_by_protocol: 'RemoteLoginProtocolUsageDistribution',
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
  change_password_top10_users: 'ModifyTheTargetUserTopTank',
  change_password_top10_change_bys: 'TopRankOfOperateUsers',
  user_change_password_metrics: 'UserModificationTrends'
}

const COLUMN_LABEL_KEY_MAP = {
  date: 'Date',
  type: 'Type',
  name: 'Name',
  metric: 'Metric',
  value: 'Value',
  push: 'AccountPushList',
  check: 'RiskDetection',
  backup: 'BaseAccountBackup',
  collect: 'DiscoverAccounts',
  change_secret: 'MenuChangeSecret',
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
  change_by: 'Username',
  asset__name: 'Asset',
  display_key: 'Account',
  label: 'Name'
}

export default {
  data() {
    return {
      reportDetail: null,
      sessionDays: '',
      displayMode: ['chart', 'table'],
      // now supports multiple tables: array of { name, columns, rows }
      tableData: [],
      reportFetchInFlight: Object.create(null),
      reportFetchCache: Object.create(null),
      lastGetDataRouteKey: '',
      lastFetchedReportId: ''
    }
  },
  watch: {
    reportId(newId, oldId) {
      if (newId !== oldId) {
        this.sessionDays = ''
      }
    },
    '$route.fullPath'() {
      const routeKey = this.buildGetDataRouteKey(this.$route.query)
      if (routeKey === this.lastGetDataRouteKey) {
        return
      }
      this.lastGetDataRouteKey = routeKey
      this.lastFetchedReportId = this.reportId
      reportDebugLog('mixin.route.fullPath', {
        name: this.name,
        routePath: this.$route.path,
        query: this.$route.query
      })
      this.reportDetail = null
      if (typeof this.getData === 'function') {
        this.getData()
      }
    }
  },
  created() {
    this.lastGetDataRouteKey = this.buildGetDataRouteKey(this.$route.query)
    this.lastFetchedReportId = this.reportId
    this.$eventBus.$on('reportForceRefresh', this._handleReportForceRefresh)
  },
  beforeUnmount() {
    this.$eventBus.$off('reportForceRefresh', this._handleReportForceRefresh)
  },
  computed: {
    displayModes() {
      const modes = Array.isArray(this.displayMode) ? this.displayMode : [this.displayMode]
      const normalized = modes.filter((mode) => mode === 'chart' || mode === 'table')
      return normalized.length ? normalized : ['chart', 'table']
    },
    showChart() {
      return this.displayModes.includes('chart')
    },
    showTable() {
      return this.displayModes.includes('table')
    },
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
    currentFilters() {
      const fallbackDays = this.isCustomReport ? this.reportDetail?.days || 7 : this.days || 7
      const activeDays = this.isCustomReport
        ? this.sessionDays || fallbackDays
        : this.$route.query.days || fallbackDays
      return {
        days: normalizeReportDays(activeDays, '7')
      }
    }
  },
  methods: {
    _handleReportForceRefresh(reportId) {
      if (!reportId || String(this.reportId) !== String(reportId)) return
      this.reportDetail = null
      this.reportFetchCache = Object.create(null)
      invalidateReportDetailCache(reportId)
      if (typeof this.getData === 'function') {
        this.getData()
      }
    },
    buildGetDataRouteKey(query = {}) {
      return JSON.stringify({
        path: this.$route.path,
        report_id: query.report_id || '',
        days: query.days || '',
        chart_key: query.chart_key || ''
      })
    },
    async fetchWithDedupe(url) {
      const now = Date.now()
      const cached = this.reportFetchCache[url]
      // Reuse recent same-url result to absorb rapid duplicate triggers.
      if (cached && now - cached.ts < 600) {
        reportDebugLog('mixin.fetch.cacheHit', { name: this.name, requestUrl: url })
        return cached.data
      }
      if (this.reportFetchInFlight[url]) {
        reportDebugLog('mixin.fetch.inFlightJoin', { name: this.name, requestUrl: url })
        return this.reportFetchInFlight[url]
      }
      const request = this.$axios
        .get(url)
        .then((res) => {
          this.reportFetchCache[url] = { ts: Date.now(), data: res }
          return res
        })
        .finally(() => {
          delete this.reportFetchInFlight[url]
        })
      this.reportFetchInFlight[url] = request
      return request
    },
    async ensureReportDetail(reportId = this.reportId) {
      if (!reportId) {
        return null
      }
      if (this.reportDetail?.id === reportId) {
        return this.reportDetail
      }
      const data = await fetchReportDetailShared(this.$axios, reportId)
      if (this.reportId !== reportId) {
        return data
      }
      this.reportDetail = data
      this.sessionDays = ''
      if (data?.name) {
        this.title = data.name
      }
      return data
    },
    buildTemplateUrl(baseUrl) {
      const query = pickReportQuery(this.$route.query)
      if (!query.days && this.days) {
        query.days = this.days
      }
      return appendQuery(baseUrl, query)
    },
    async fetchReportData(baseUrl) {
      const reportId = this.reportId
      if (reportId) {
        await this.ensureReportDetail(reportId)
        if (this.reportId !== reportId) {
          reportDebugLog('mixin.fetch.retry', {
            name: this.name,
            fromReportId: reportId,
            toReportId: this.reportId,
            routePath: this.$route.path,
            query: this.$route.query
          })
          return this.fetchReportData(baseUrl)
        }
        const effectiveDays = normalizeReportDays(
          this.sessionDays || (this.reportDetail && this.reportDetail.days) || '7',
          '7'
        )
        const requestUrl = appendQuery(`/api/v1/reports/reports/${reportId}/data/`, {
          days: effectiveDays
        })
        reportDebugLog('mixin.fetch.custom', {
          name: this.name,
          requestUrl,
          routePath: this.$route.path,
          query: this.$route.query
        })
        return this.fetchWithDedupe(requestUrl)
      }
      const requestUrl = this.buildTemplateUrl(baseUrl)
      reportDebugLog('mixin.fetch.template', {
        name: this.name,
        requestUrl,
        routePath: this.$route.path,
        query: this.$route.query
      })
      return this.fetchWithDedupe(requestUrl)
    },
    async loadTableData(baseUrl) {
      const buildLabel = (k) => {
        if (!k) return ''
        const labelKey = TABLE_LABEL_KEY_MAP[k]
        if (labelKey) return this.$t(labelKey)
        return k
          .replace(/_/g, ' ')
          .replace(/metrics/gi, '')
          .trim()
      }

      const translateColumnLabel = (label) => {
        if (!label) return ''
        const l = String(label).toLowerCase()
        const labelKey = COLUMN_LABEL_KEY_MAP[l]
        if (labelKey) return this.$t(labelKey)
        // specific patterns first to avoid generic 'total' overriding them
        if (l.includes('active_users') || l.includes('total_count_active_users')) {
          return this.$t('ActiveUsers')
        }
        if (l.includes('active_assets') || l.includes('total_count_active_assets')) {
          return this.$t('ActiveAssets')
        }
        if (l.includes('success') || l === 'dates_metrics_total_count_success') {
          return this.$t('Success')
        }
        if (
          l.includes('failure') ||
          l.includes('failed') ||
          l === 'dates_metrics_total_count_failed'
        ) {
          return this.$t('Failed')
        }
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
            const rows = dates.map((d) => ({ date: d }))
            const columns = [{ key: 'date', label: this.$t('Date') }]

            Object.entries(groupVal).forEach(([k, v]) => {
              if (k === 'dates_metrics_date') return
              // arrays like dates_metrics_success_total
              if (Array.isArray(v)) {
                const colKey = k
                const raw = k.replace(/^dates_metrics_?/, '')
                const label = translateColumnLabel(raw)
                columns.push({ key: colKey, label })
                rows.forEach((row, idx) => {
                  row[colKey] = v && v[idx] !== undefined && v[idx] !== null ? v[idx] : 0
                })
                return
              }
              // nested objects like dates_metrics_total: { "密码": [..] }
              if (v && typeof v === 'object') {
                Object.entries(v).forEach(([innerKey, innerArr]) => {
                  if (!Array.isArray(innerArr)) return
                  const colKey = innerKey
                  const label = translateColumnLabel(innerKey)
                  columns.push({ key: colKey, label })
                  rows.forEach((row, idx) => {
                    row[colKey] =
                      innerArr && innerArr[idx] !== undefined && innerArr[idx] !== null
                        ? innerArr[idx]
                        : 0
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

            if (typeof v === 'object' && Array.isArray(v.dates_metrics_date)) {
              tables.push(buildDateTable(k, v))
              continue
            }

            if (
              Array.isArray(v) &&
              v.length &&
              typeof v[0] === 'object' &&
              ('name' in v[0] || 'label' in v[0])
            ) {
              const columns = [
                { key: 'name', label: this.$t('Name') },
                { key: 'value', label: this.$t('Value') }
              ]
              const rows = v.map((item) => ({
                name: item.name || item.label || '',
                value:
                  item.value !== undefined && item.value !== null
                    ? item.value
                    : item.count !== undefined && item.count !== null
                      ? item.count
                      : item.total !== undefined && item.total !== null
                        ? item.total
                        : 0
              }))
              tables.push({ name: buildLabel(k) || k, columns, rows })
              continue
            }

            if (Array.isArray(v) && v.length && typeof v[0] === 'object') {
              const firstItem = v[0]
              const itemKeys = Object.keys(firstItem)
              const columns = itemKeys.map((ik) => ({ key: ik, label: translateColumnLabel(ik) }))
              const rows = v.map((item) => {
                const row = {}
                itemKeys.forEach((ik) => {
                  row[ik] = item[ik] !== undefined && item[ik] !== null ? item[ik] : 0
                })
                return row
              })
              tables.push({ name: buildLabel(k) || k, columns, rows })
              continue
            }

            if (typeof v === 'object') {
              const entries = Object.entries(v)
              const primitive = entries.every(([, val]) => typeof val !== 'object')
              if (primitive) {
                const columns = [
                  { key: 'metric', label: this.$t('Metric') },
                  { key: 'value', label: this.$t('Value') }
                ]
                const rows = entries
                  .filter(
                    ([kk, vv]) => !(k === 'user_stats' && kk === 'face_vector' && Number(vv) === 0)
                  )
                  .map(([kk, vv]) => ({ metric: translateColumnLabel(kk) || kk, value: vv }))
                tables.push({ name: buildLabel(k) || k, columns, rows })
                continue
              }
              const hasArrayVals = entries.some(([, val]) => Array.isArray(val))
              if (hasArrayVals) {
                const arraysArePrimitive = entries
                  .filter(([, val]) => Array.isArray(val))
                  .every(([, arr]) => arr.length === 0 || typeof arr[0] !== 'object')
                if (arraysArePrimitive) {
                  tables.push(buildDateTable(k, v))
                  continue
                }
                const firstNonEmpty = entries.find(
                  ([, val]) => Array.isArray(val) && val.length > 0
                )
                const subKeys = firstNonEmpty ? Object.keys(firstNonEmpty[1][0]) : []
                const nestedCols = [{ key: '__category', label: this.$t('Category') }].concat(
                  subKeys.map((sk) => ({ key: sk, label: translateColumnLabel(sk) }))
                )
                const flatRows = []
                for (const [catKey, catList] of entries) {
                  if (Array.isArray(catList)) {
                    catList.forEach((item) => {
                      const row = { __category: catKey }
                      subKeys.forEach((sk) => {
                        row[sk] = item[sk] !== undefined && item[sk] !== null ? item[sk] : 0
                      })
                      flatRows.push(row)
                    })
                  }
                }
                tables.push({ name: buildLabel(k) || k, columns: nestedCols, rows: flatRows })
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
        const fallback = await this.$axios.get(
          appendQuery(this.buildTemplateUrl(baseUrl), { export: 'table' })
        )
        this.tableData = fallback
        return
      } catch (e) {
        this.tableData = []
        return
      }
    },
    handleToolbarFilterChange({ days }) {
      if (this.isCustomReport) {
        if (days) {
          this.sessionDays = normalizeReportDays(days, '7')
        }
        this.reportFetchCache = Object.create(null)
        if (typeof this.getData === 'function') {
          this.getData()
        }
        return
      }
      const query = {}
      if (this.$route.query.chart_key) {
        query.chart_key = this.$route.query.chart_key
      }
      if (this.reportId) {
        query.report_id = this.reportId
      }
      if (this.$route.query.customize) {
        query.customize = this.$route.query.customize
      }
      if (days) {
        query.days = normalizeReportDays(days, '7')
      }
      if (!this.isCustomReport) {
        const routeVC = this.$route.query.visible_charts
        const routeVT = this.$route.query.visible_tables
        const chartsSource =
          routeVC !== undefined && routeVC !== null
            ? routeVC
            : this.reportDetail?.filters?.visible_charts
        const tablesSource =
          routeVT !== undefined && routeVT !== null
            ? routeVT
            : this.reportDetail?.filters?.visible_tables
        if (chartsSource !== undefined && chartsSource !== null) {
          const list = normalizeVisibleFilterList(chartsSource)
          query.visible_charts = list.length ? list.join(',') : ''
        }
        if (tablesSource !== undefined && tablesSource !== null) {
          const list = normalizeVisibleFilterList(tablesSource)
          query.visible_tables = list.length ? list.join(',') : ''
        }
      }
      if (this.days !== undefined && days) {
        this.days = normalizeReportDays(days, '7')
      }
      if (this.buildGetDataRouteKey(this.$route.query) === this.buildGetDataRouteKey(query)) {
        return
      }
      this.$router.replace({ path: this.$route.path, query })
    }
  }
}
