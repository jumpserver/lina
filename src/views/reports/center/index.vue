<template>
  <Page :title="pageTitle" class="audit-report-center">
    <div class="report-workspace" v-loading="loading">
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon>
        <el-button text type="primary" @click="load">{{ $t('AuditReportRetry') }}</el-button>
      </el-alert>
      <el-empty
        v-if="!loading && !error && !themes.length"
        :description="$t('AuditReportNoPermission')"
      />
      <template v-if="themes.length">
        <IBox>
          <div class="report-theme-header">
            <div class="report-theme-toolbar">
              <el-tabs :model-value="selectedTheme" class="theme-tabs" @tab-change="chooseTheme">
                <el-tab-pane v-for="theme in themes" :key="theme.key" :name="theme.key">
                  <template #label
                    ><span class="theme-tab-label"
                      ><el-icon><component :is="themeIcons[theme.key] || 'Document'" /></el-icon
                      >{{ theme.title }}</span
                    ></template
                  >
                </el-tab-pane>
              </el-tabs>
              <el-button
                class="report-create-button"
                type="primary"
                icon="Plus"
                :disabled="loading || !currentTheme?.can_generate"
                @click="openEditor(selectedTheme)"
                >{{ $t('AuditReportCreate') }}</el-button
              >
            </div>
            <p v-if="currentTheme?.description" class="theme-description">
              {{ currentTheme.description }}
            </p>
          </div>
          <PeriodPicker
            v-if="selectedTheme !== 'inventory'"
            v-model="range"
            :disabled="dataLoading"
            @change="loadPreview"
          />
          <div class="data-area" v-loading="dataLoading">
            <el-alert v-if="dataError" :title="dataError" type="error" :closable="false" show-icon>
              <el-button text type="primary" @click="loadPreview">{{
                $t('AuditReportRetry')
              }}</el-button>
            </el-alert>
            <template v-else-if="snapshot">
              <el-tabs v-if="visibleSections.length" v-model="selectedSection" class="section-tabs">
                <el-tab-pane
                  v-for="section in visibleSections"
                  :key="section.key"
                  :label="section.title"
                  :name="section.key"
                >
                  <div v-if="section.metrics?.length" class="metric-grid">
                    <div v-for="metric in section.metrics" :key="metric.key" class="metric-card">
                      <div class="metric-label">
                        <span>{{ metric.label }}</span>
                      </div>
                      <div
                        class="metric-value"
                        :class="{ 'metric-value-status': metric.value == null }"
                      >
                        <span>{{ metricValue(metric) }}</span>
                        <small v-if="metric.unit && metric.value != null">{{ metric.unit }}</small>
                      </div>
                    </div>
                  </div>
                  <div
                    v-if="
                      section.key === selectedSection && (trendTable || distributionTables.length)
                    "
                    class="chart-grid"
                    :class="{ 'single-chart': !trendTable || !distributionTables.length }"
                  >
                    <div v-if="trendTable" class="report-chart">
                      <div class="chart-heading">
                        <h3>{{ trendTable.title }}</h3>
                      </div>
                      <div class="trend-summary">
                        <div>
                          <span>{{ $t('AuditReportTrendTotal') }}</span
                          ><strong>{{ formatValue(trendSummary.total) }}</strong>
                        </div>
                        <div>
                          <span>{{ $t('AuditReportTrendActivePeriods') }}</span
                          ><strong>{{ trendSummary.active }} / {{ trendSummary.periods }}</strong>
                        </div>
                        <div>
                          <span>{{ $t('AuditReportTrendPeak') }}</span
                          ><strong>{{ formatValue(trendSummary.peak) }}</strong
                          ><small v-if="trendSummary.peakDates">{{ trendSummary.peakDates }}</small>
                        </div>
                      </div>
                      <Echart :options="trendOptions" :autoresize="true" />
                    </div>
                    <div v-if="distributionTables.length" class="report-chart">
                      <div class="chart-heading jms-form-controls">
                        <h3>{{ distributionTable?.title }}</h3>
                        <el-select
                          v-model="distributionKey"
                          :aria-label="$t('AuditReportAnalysisDimension')"
                          ><el-option
                            v-for="table in distributionTables"
                            :key="table.key"
                            :label="table.title"
                            :value="table.key"
                        /></el-select>
                      </div>
                      <Echart :options="distributionOptions" :autoresize="true" />
                    </div>
                  </div>
                  <div
                    v-for="table in detailTables(section)"
                    :key="table.key"
                    class="table-section el-data-table"
                  >
                    <h3>{{ table.title }}</h3>
                    <el-table :data="table.rows || []" border>
                      <el-table-column
                        v-for="column in table.columns"
                        :key="column.key"
                        :prop="column.key"
                        :label="column.label"
                        :min-width="columnWidth(column.key)"
                        :align="isCountColumn(column.key) ? 'right' : 'left'"
                        :show-overflow-tooltip="!wrapColumn(column.key)"
                      >
                        <template #default="{ row }">
                          <el-link
                            v-if="evidenceLink(row[column.key])"
                            :href="evidenceLink(row[column.key])"
                            :class="{ 'action-guidance': wrapColumn(column.key) }"
                            type="primary"
                            underline="hover"
                            target="_blank"
                            rel="noopener noreferrer"
                            >{{ cellValue(row[column.key]) }}</el-link
                          >
                          <span v-else :class="{ 'action-guidance': wrapColumn(column.key) }">{{
                            cellValue(row[column.key])
                          }}</span>
                        </template>
                      </el-table-column>
                    </el-table>
                    <p v-if="table.truncated" class="table-note">
                      {{
                        $t('AuditReportSampleHint', {
                          shown: table.rows?.length || 0,
                          total: formatValue(table.total)
                        })
                      }}
                    </p>
                  </div>
                  <p v-if="emptySectionKey(section)" class="empty-result">
                    {{ $t(emptySectionKey(section)) }}
                  </p>
                </el-tab-pane>
              </el-tabs>
              <el-empty v-else :description="$t('AuditReportDataUnavailable')" />
              <IBox
                v-if="snapshot.conclusions?.length"
                :title="$t('AuditReportSuggestedConclusion')"
                class="conclusion-box"
              >
                <p v-for="(line, index) in snapshot.conclusions" :key="index">{{ line }}</p>
              </IBox>
              <div class="data-footer">
                <span
                  >{{ $t('AuditReportCollectedAt') }} {{ dateTime(snapshot.generated_at) }}</span
                >
                <el-button v-if="sourceRoute" text type="primary" @click="$router.push(sourceRoute)"
                  >{{ $t('AuditReportOpenAuditLogs') }}<el-icon><ArrowRight /></el-icon
                ></el-button>
              </div>
            </template>
          </div>
        </IBox>
      </template>
    </div>
  </Page>
</template>
<script>
import { Page } from '@/layout/components'
import IBox from '@/components/Common/IBox/index.vue'
import PeriodPicker from './PeriodPicker.vue'
import Echart from '@/components/Dashboard/Echart.vue'
import defaultTheme from '@/styles/default-theme'
import { reportApi, reportError, defaultRange, makeConfig, reportEvidenceLink } from './api'
import {
  isEmptyReportTable,
  reportEmptySectionKey,
  reportTrend,
  isReportCountColumn
} from './reportContent'

export default {
  name: 'AuditReportCenter',
  components: { Page, IBox, PeriodPicker, Echart },
  data() {
    return {
      active: true,
      catalog: null,
      loading: false,
      dataLoading: false,
      error: '',
      dataError: '',
      selectedTheme: 'audit',
      selectedSection: '',
      distributionKey: '',
      range: defaultRange(),
      snapshot: null,
      requestId: 0,
      previewId: 0,
      themeIcons: {
        audit: 'DocumentChecked',
        activity: 'Monitor',
        security: 'Lock',
        inventory: 'Collection',
        account: 'User'
      }
    }
  },
  computed: {
    organizationId() {
      return this.$store.getters.currentOrg?.id
    },
    themes() {
      return (this.catalog?.themes || []).filter((theme) => theme.can_generate)
    },
    firstTheme() {
      return this.themes[0]
    },
    currentTheme() {
      return this.themes.find((theme) => theme.key === this.selectedTheme)
    },
    pageTitle() {
      return this.$t('AuditReportOverview')
    },
    visibleSections() {
      const sections = this.snapshot?.sections || []
      const overviewHasCharts = sections.some((section) =>
        (section.tables || []).some(this.hasChartData)
      )
      return sections.filter((section) => {
        if (['scope', 'conclusion', 'assessment'].includes(section.key)) return false
        return (
          section.metrics?.length ||
          this.detailTables(section).length ||
          this.emptySectionKey(section) ||
          (section.key === 'overview'
            ? overviewHasCharts
            : (section.tables || []).some(this.hasChartData))
        )
      })
    },
    allTables() {
      const sections = (this.snapshot?.sections || []).filter(
        (section) => this.selectedSection === 'overview' || section.key === this.selectedSection
      )
      const tables = sections.flatMap((section) => section.tables || [])
      return Array.from(new Map(tables.map((table) => [table.key, table])).values())
    },
    trendTable() {
      return this.allTables.find((table) => reportTrend(table)?.total > 0)
    },
    trendSummary() {
      return this.trendTable ? reportTrend(this.trendTable) : null
    },
    distributionTables() {
      return this.allTables.filter(
        (table) =>
          table.rows?.length &&
          table.columns?.some((column) => column.key === 'name') &&
          table.columns?.some((column) => column.key === 'count')
      )
    },
    distributionTable() {
      return (
        this.distributionTables.find((table) => table.key === this.distributionKey) ||
        this.distributionTables[0]
      )
    },
    distributionRows() {
      const table = this.distributionTable
      const hasStatus = table?.columns?.some((column) => column.key === 'status')
      return (table?.rows || [])
        .map((row) => ({
          ...row,
          label: [row.name || '—', hasStatus ? row.status : null]
            .filter((value) => value != null && value !== '')
            .map(this.cellValue)
            .join(' · ')
        }))
        .sort((a, b) => Number(b.count) - Number(a.count))
        .slice(0, 10)
        .reverse()
    },
    chartTheme() {
      const theme = this.$store.state.settings.themeColors || {}
      const style = window.getComputedStyle(document.documentElement)
      const value = (key) => theme[key] || style.getPropertyValue(key).trim() || defaultTheme[key]
      return {
        primary: value('--color-primary'),
        text: value('--color-text-primary'),
        secondary: value('--color-text-secondary'),
        border: value('--color-border'),
        fontFamily: window.getComputedStyle(document.body).fontFamily
      }
    },
    trendOptions() {
      const rows = this.trendTable?.rows || []
      return {
        color: [this.chartTheme.primary],
        textStyle: {
          color: this.chartTheme.text,
          fontSize: 12,
          fontFamily: this.chartTheme.fontFamily
        },
        tooltip: { trigger: 'axis' },
        grid: { left: 45, right: 18, top: 20, bottom: 30 },
        xAxis: {
          type: 'category',
          data: rows.map((row) => row.date),
          boundaryGap: false,
          axisLabel: { color: this.chartTheme.secondary },
          axisLine: { lineStyle: { color: this.chartTheme.border } }
        },
        yAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: { color: this.chartTheme.secondary },
          splitLine: { lineStyle: { color: this.chartTheme.border } }
        },
        series: [
          {
            type: 'line',
            name: this.trendTable?.title,
            data: rows.map((row) => row.count),
            smooth: false,
            showSymbol: rows.length < 40,
            areaStyle: { opacity: 0.1 }
          }
        ]
      }
    },
    distributionOptions() {
      const rows = this.distributionRows
      const multiDimension = this.distributionTable?.columns?.some(
        (column) => column.key === 'status'
      )
      const axisWidth = multiDimension ? 150 : 95
      const labelSpace = Math.max(
        36,
        ...rows.map((row) => this.formatValue(row.count).length * 8 + 12)
      )
      return {
        color: [this.chartTheme.primary],
        textStyle: {
          color: this.chartTheme.text,
          fontSize: 12,
          fontFamily: this.chartTheme.fontFamily
        },
        tooltip: { trigger: 'axis', confine: true, axisPointer: { type: 'shadow' } },
        grid: { left: axisWidth + 15, right: labelSpace, top: 15, bottom: 25 },
        xAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: { color: this.chartTheme.secondary },
          splitLine: { lineStyle: { color: this.chartTheme.border } }
        },
        yAxis: {
          type: 'category',
          data: rows.map((row) => row.label),
          tooltip: {
            show: true,
            confine: true,
            extraCssText: 'max-width: 320px; white-space: normal; overflow-wrap: anywhere;'
          },
          axisLabel: { width: axisWidth, overflow: 'truncate', color: this.chartTheme.secondary },
          axisLine: { lineStyle: { color: this.chartTheme.border } }
        },
        series: [
          {
            type: 'bar',
            name: this.distributionTable?.title,
            data: rows.map((row) => row.count),
            barMaxWidth: 22,
            label: {
              show: true,
              position: 'right',
              color: this.chartTheme.secondary,
              formatter: ({ value }) => this.formatValue(value)
            }
          }
        ]
      }
    },
    sourceRoute() {
      if (this.selectedTheme === 'activity' && this.$hasPerm('terminal.view_session')) {
        return { name: 'SessionList' }
      }
      if (this.selectedTheme === 'security' && this.$hasPerm('terminal.view_command')) {
        return { name: 'CommandList' }
      }
      return null
    }
  },
  watch: {
    selectedSection() {
      if (
        this.snapshot &&
        !this.distributionTables.some((table) => table.key === this.distributionKey)
      ) {
        this.distributionKey = this.distributionTables[0]?.key || ''
      }
    },
    organizationId() {
      if (!this.active) return
      this.catalog = null
      this.snapshot = null
      this.load()
    }
  },
  mounted() {
    this.load()
  },
  activated() {
    if (!this.active) {
      this.active = true
      this.load()
    }
  },
  deactivated() {
    this.active = false
    this.requestId++
    this.previewId++
  },
  beforeUnmount() {
    this.requestId++
    this.previewId++
  },
  methods: {
    async load() {
      const id = ++this.requestId
      this.previewId++
      this.error = ''
      this.dataError = ''
      this.loading = true
      this.snapshot = null
      try {
        const catalog = await reportApi.catalog()
        if (id !== this.requestId) return
        this.catalog = catalog
        if (!this.themes.some((theme) => theme.key === this.selectedTheme)) {
          this.selectedTheme = this.firstTheme?.key || ''
        }
        if (this.currentTheme) await this.loadPreview()
      } catch (error) {
        if (id === this.requestId) this.error = reportError(error, this.$t('AuditReportLoadFailed'))
      } finally {
        if (id === this.requestId) this.loading = false
      }
    },
    async chooseTheme(key) {
      if (key === this.selectedTheme) return
      this.selectedTheme = key
      await this.loadPreview()
    },
    async loadPreview() {
      if (!this.currentTheme) return
      const id = ++this.previewId
      this.dataLoading = true
      this.dataError = ''
      this.snapshot = null
      try {
        const data = await reportApi.preview(
          makeConfig(this.selectedTheme, this.currentTheme.chapters || [], this.range)
        )
        if (id !== this.previewId) return
        this.snapshot = data
        this.selectedSection = this.visibleSections.some(
          (section) => section.key === this.selectedSection
        )
          ? this.selectedSection
          : this.visibleSections[0]?.key || ''
        this.distributionKey = this.distributionTables.some(
          (table) => table.key === this.distributionKey
        )
          ? this.distributionKey
          : this.distributionTables[0]?.key || ''
      } catch (error) {
        if (id === this.previewId) {
          this.dataError = reportError(error, this.$t('AuditReportLoadFailed'))
        }
      } finally {
        if (id === this.previewId) this.dataLoading = false
      }
    },
    openEditor(theme) {
      this.$router.push({ path: '/audit/reports/editor', query: { theme, ...this.range } })
    },
    metricValue(metric) {
      if (metric.state === 'not_applicable') return this.$t('AuditReportNotApplicable')
      return metric.value == null
        ? this.$t('AuditReportDataUnavailable')
        : this.formatValue(metric.value)
    },
    emptySectionKey: reportEmptySectionKey,
    hasChartData(table) {
      return (
        reportTrend(table)?.total > 0 ||
        (table.rows?.length &&
          table.columns?.some((column) => column.key === 'name') &&
          table.columns?.some((column) => column.key === 'count'))
      )
    },
    detailTables(section) {
      return (section.tables || []).filter(
        (table) => table.rows?.length && !isEmptyReportTable(table, section) && !reportTrend(table)
      )
    },
    isCountColumn: isReportCountColumn,
    formatValue(value) {
      return value == null
        ? '—'
        : typeof value === 'number'
          ? value.toLocaleString()
          : String(value)
    },
    evidenceLink: reportEvidenceLink,
    columnWidth(key) {
      return (
        {
          next_step: 260,
          issue: 200,
          risk: 180,
          record_count: 100,
          account_count: 120,
          asset_count: 120,
          time: 160,
          updated: 160,
          evidence: 105,
          status: 140
        }[key] || 130
      )
    },
    wrapColumn(key) {
      return ['next_step', 'issue', 'risk', 'status'].includes(key)
    },
    cellValue(value) {
      if (value == null || value === '') return '—'
      if (typeof value === 'boolean') return this.$t(value ? 'Yes' : 'No')
      if (Array.isArray(value)) return value.map(this.cellValue).join(', ')
      if (typeof value === 'object') return value.label || value.name || JSON.stringify(value)
      return String(value)
    },
    dateTime(value) {
      if (!value) return '—'
      const date = new Date(value)
      return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
    }
  }
}
</script>
<style scoped lang="scss">
.report-workspace {
  display: flex;
  flex-direction: column;
  gap: var(--page-section-gap, 8px);
  width: 100%;
  min-width: 0;
  color: var(--color-text-primary);
}
.report-theme-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 8px 20px;
  min-width: 0;
  margin-bottom: 12px;
}
.report-theme-toolbar {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  gap: 20px;
  min-width: 0;
  box-shadow: inset 0 -2px 0 var(--el-border-color-light);
}
.theme-tabs {
  flex: 1 1 0;
  min-width: 0;
}
.theme-tabs :deep(.el-tabs__header) {
  margin-bottom: 0;
}
.theme-tabs :deep(.el-tabs__nav-wrap) {
  margin-bottom: 0;
}
.theme-tabs :deep(.el-tabs__content) {
  display: none;
}
.report-create-button.el-button {
  flex: 0 0 auto;
  height: 30px;
  min-height: 30px;
  margin: 0;
  padding: 0 12px;
  font-size: 13px;
}
.report-create-button :deep(.el-icon) {
  font-size: 14px;
}
.theme-tab-label {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}
.theme-tab-label .el-icon {
  font-size: 14px;
}
h2,
h3 {
  color: var(--color-text-primary);
  margin: 0;
  font-size: 13px;
  font-weight: 600;
}
.theme-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: 12px;
}
.theme-description {
  grid-column: 1 / -1;
  margin: 0;
}
.data-area {
  min-height: 160px;
  padding-top: 8px;
}
.section-tabs {
  margin-top: 0;
}
.section-tabs :deep(.el-tabs__item) {
  font-size: 13px;
}
.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
  gap: 16px;
  margin: 0 0 24px;
}
.metric-card {
  min-width: 0;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--el-border-radius-base, 4px);
}
.metric-label {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: 20px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 20px;
}
.metric-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
  font-size: 24px;
  font-weight: 500;
  line-height: 32px;
  font-variant-numeric: tabular-nums;
}
.metric-value small {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-weight: 400;
}
.metric-value-status {
  font-size: 14px;
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}
.trend-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0 0 8px;
}
.trend-summary > div {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.trend-summary span,
.trend-summary small {
  font-size: 12px;
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}
.trend-summary strong {
  font-size: 16px;
  font-weight: 500;
  line-height: 24px;
}
.empty-result {
  margin: 16px 0;
  padding: 12px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--el-border-radius-base, 4px);
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}
.chart-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  margin: 0 0 24px;
}
.chart-grid.single-chart {
  grid-template-columns: 1fr;
}
.report-chart {
  min-width: 0;
}
.report-chart :deep(.echarts),
.report-chart :deep(.echart) {
  height: 260px;
}
.chart-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 32px;
  margin-bottom: 12px;
}
.chart-heading .el-select {
  flex: 0 1 180px;
  width: 180px;
  max-width: 60%;
}
.table-section {
  margin: 20px 0;
}
.table-section h3 {
  margin-bottom: 12px;
}
.table-section :deep(.el-table .cell .action-guidance) {
  display: block;
  overflow: visible;
  white-space: pre-line;
  overflow-wrap: anywhere;
  line-height: 1.5;
}
.table-note {
  font-size: 12px;
  color: var(--color-help-text);
  line-height: 1.5;
}
.data-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  color: var(--color-help-text);
  font-size: 12px;
}
.conclusion-box {
  margin-top: 16px;
}
.conclusion-box p {
  margin: 0 0 8px;
  line-height: 1.5;
  font-size: 13px;
}
@media (max-width: 1000px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 700px) {
  .report-theme-toolbar {
    display: contents;
  }
  .report-theme-header {
    gap: 8px;
  }
  .theme-tabs {
    grid-column: 1 / -1;
  }
  .report-theme-header .report-create-button {
    grid-column: 2;
    grid-row: 2;
  }
  .theme-description {
    grid-column: 1;
    grid-row: 2;
  }
}
@media (max-width: 600px) {
  .metric-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
  .metric-card {
    padding: 12px;
  }
  .data-footer {
    flex-wrap: wrap;
  }
  .chart-heading {
    flex-wrap: wrap;
  }
  .chart-heading .el-select {
    min-width: 140px;
    max-width: 100%;
  }
}
</style>
