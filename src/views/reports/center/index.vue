<template>
  <Page :title="pageTitle" class="audit-report-center">
    <div class="report-workspace" v-loading="loading">
      <p v-if="mode !== 'overview'" class="page-intro">{{ pageDescription }}</p>
      <el-alert
        v-if="catalog && !catalog.can_save_template"
        :title="$t('AuditReportChooseOrg')"
        type="info"
        :closable="false"
        show-icon
      />
      <el-alert v-if="error" :title="error" type="error" :closable="false" show-icon>
        <el-button text type="primary" @click="load">{{ $t('AuditReportRetry') }}</el-button>
      </el-alert>
      <el-empty
        v-if="!loading && !error && !themes.length"
        :description="$t('AuditReportNoPermission')"
      />
      <template v-if="mode === 'overview' && themes.length">
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
              <el-alert
                v-if="snapshot.coverage?.status === 'partial'"
                :title="$t('AuditReportPartialCoverage')"
                type="warning"
                :closable="false"
                show-icon
                class="coverage-warning"
              />
              <el-tabs v-model="selectedSection" class="section-tabs">
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
                      <div class="metric-value">
                        <span>{{ formatValue(metric.value) }}</span>
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
                      <p class="table-note">
                        {{
                          $t('AuditReportTopGroups', {
                            count: Math.min(distributionTable?.rows?.length || 0, 10)
                          })
                        }}
                      </p>
                    </div>
                  </div>
                  <div
                    v-for="table in section.tables || []"
                    :key="table.key"
                    class="table-section el-data-table"
                  >
                    <h3>{{ table.title }}</h3>
                    <el-table
                      :data="table.rows || []"
                      border
                      :empty-text="
                        section.status === 'unavailable'
                          ? $t('AuditReportDataUnavailable')
                          : $t('AuditReportNoRecords')
                      "
                    >
                      <el-table-column
                        v-for="column in table.columns"
                        :key="column.key"
                        :prop="column.key"
                        :label="column.label"
                        min-width="130"
                        show-overflow-tooltip
                      >
                        <template #default="{ row }">{{ cellValue(row[column.key]) }}</template>
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
                  <ul v-if="section.notes?.length" class="section-notes">
                    <li v-for="(note, index) in section.notes" :key="index">{{ note }}</li>
                  </ul>
                  <p
                    v-if="
                      !section.metrics?.length && !section.tables?.length && !section.notes?.length
                    "
                    class="section-description"
                  >
                    {{ $t('AuditReportNoSectionData') }}
                  </p>
                </el-tab-pane>
              </el-tabs>
              <IBox
                v-if="snapshot.conclusions?.length"
                :title="$t('AuditReportSuggestedConclusion')"
                class="conclusion-box"
              >
                <p v-for="(line, index) in snapshot.conclusions" :key="index">{{ line }}</p>
                <small>{{ $t('AuditReportConclusionHelp') }}</small>
              </IBox>
              <el-collapse
                v-if="snapshot.coverage?.sources?.length"
                class="source-coverage el-data-table"
              >
                <el-collapse-item :title="$t('AuditReportDataSources')" name="sources">
                  <el-table :data="snapshot.coverage.sources" border>
                    <el-table-column
                      prop="label"
                      :label="$t('AuditReportSource')"
                      min-width="120"
                    />
                    <el-table-column :label="$t('AuditReportSourceStatus')" width="150"
                      ><template #default="{ row }"
                        ><el-tag
                          :type="row.status === 'available' ? 'success' : 'warning'"
                          size="small"
                          >{{ sourceStatus(row.status) }}</el-tag
                        ></template
                      ></el-table-column
                    >
                    <el-table-column :label="$t('AuditReportSourceNotes')" min-width="300"
                      ><template #default="{ row }"
                        ><span>{{
                          (row.notes || []).join('；') || $t('AuditReportNoSourceNote')
                        }}</span
                        ><span v-if="row.retention_days">
                          {{ $t('AuditReportRetentionDays', { days: row.retention_days }) }}</span
                        ></template
                      ></el-table-column
                    >
                  </el-table>
                </el-collapse-item>
              </el-collapse>
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
      <template v-if="mode === 'templates' && themes.length">
        <h2 class="group-title">{{ $t('AuditReportBuiltInTemplates') }}</h2>
        <div class="template-grid">
          <IBox v-for="theme in themes" :key="theme.key" class="template-card">
            <div class="template-title">
              <el-icon><component :is="themeIcons[theme.key] || 'Document'" /></el-icon>
              <h3>{{ theme.title }}</h3>
              <el-tag type="info" size="small">{{ $t('AuditReportBuiltIn') }}</el-tag>
            </div>
            <p v-if="theme.description" class="template-description">{{ theme.description }}</p>
            <el-button :disabled="!theme.can_generate" @click="openEditor(theme.key)">{{
              $t('AuditReportUseTemplate')
            }}</el-button>
          </IBox>
        </div>

        <h2 class="group-title">{{ $t('AuditReportSavedTemplates') }}</h2>
        <IBox class="el-data-table">
          <el-table border :data="items" :empty-text="$t('AuditReportNoTemplates')">
            <el-table-column
              prop="name"
              :label="$t('AuditReportTemplateName')"
              min-width="180"
              show-overflow-tooltip
            />
            <el-table-column :label="$t('AuditReportTheme')" min-width="140"
              ><template #default="{ row }">{{ themeTitle(row.theme) }}</template></el-table-column
            >
            <el-table-column :label="$t('AuditReportUpdatedAt')" min-width="160"
              ><template #default="{ row }">{{
                dateTime(row.date_updated || row.date_created)
              }}</template></el-table-column
            >
            <el-table-column :label="$t('Actions')" width="210"
              ><template #default="{ row }">
                <el-button text type="primary" @click="useTemplate(row)">{{
                  $t('AuditReportUseTemplate')
                }}</el-button>
                <el-button
                  v-if="canDeleteTemplate(row)"
                  text
                  type="danger"
                  @click="deleteTemplate(row)"
                  >{{ $t('Delete') }}</el-button
                >
              </template></el-table-column
            >
          </el-table>
          <el-pagination
            background
            v-if="total > pageSize"
            v-model:current-page="page"
            :page-size="pageSize"
            :total="total"
            layout="total, prev, pager, next"
            @current-change="loadList"
          />
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
import { reportApi, listData, reportError, defaultRange, makeConfig } from './api'

export default {
  name: 'AuditReportCenter',
  components: { Page, IBox, PeriodPicker, Echart },
  props: { mode: { type: String, default: 'overview' } },
  data() {
    return {
      active: true,
      listId: 0,
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
      items: [],
      total: 0,
      page: 1,
      pageSize: 20,
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
      return this.$t(
        {
          overview: 'AuditReportOverview',
          templates: 'AuditReportTemplates'
        }[this.mode]
      )
    },
    pageDescription() {
      return this.$t(
        {
          overview: 'AuditReportOverviewHelp',
          templates: 'AuditReportTemplatesHelp'
        }[this.mode]
      )
    },
    visibleSections() {
      return (this.snapshot?.sections || []).filter(
        (section) => !['scope', 'conclusion'].includes(section.key)
      )
    },
    allTables() {
      const sections = (this.snapshot?.sections || []).filter(
        (section) => this.selectedSection === 'overview' || section.key === this.selectedSection
      )
      const tables = sections.flatMap((section) => section.tables || [])
      return Array.from(new Map(tables.map((table) => [table.key, table])).values())
    },
    trendTable() {
      return this.allTables.find((table) => table.key === 'session_trend' && table.rows?.length)
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
      const rows = (this.distributionTable?.rows || []).slice(0, 10).reverse()
      return {
        color: [this.chartTheme.primary],
        textStyle: {
          color: this.chartTheme.text,
          fontSize: 12,
          fontFamily: this.chartTheme.fontFamily
        },
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        grid: { left: 110, right: 36, top: 15, bottom: 25 },
        xAxis: {
          type: 'value',
          minInterval: 1,
          axisLabel: { color: this.chartTheme.secondary },
          splitLine: { lineStyle: { color: this.chartTheme.border } }
        },
        yAxis: {
          type: 'category',
          data: rows.map((row) => String(row.name || '—')),
          axisLabel: { width: 95, overflow: 'truncate', color: this.chartTheme.secondary },
          axisLine: { lineStyle: { color: this.chartTheme.border } }
        },
        series: [
          {
            type: 'bar',
            name: this.distributionTable?.title,
            data: rows.map((row) => row.count),
            barMaxWidth: 22
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
    mode() {
      if (this.active) {
        this.page = 1
        this.load()
      }
    },
    organizationId() {
      if (!this.active) return
      this.catalog = null
      this.snapshot = null
      this.items = []
      this.page = 1
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
    this.listId++
  },
  beforeUnmount() {
    this.requestId++
    this.previewId++
    this.listId++
  },
  methods: {
    async load() {
      const id = ++this.requestId
      this.previewId++
      this.error = ''
      this.dataError = ''
      this.loading = true
      this.snapshot = null
      this.items = []
      try {
        const catalog = await reportApi.catalog()
        if (id !== this.requestId) return
        this.catalog = catalog
        if (!this.themes.some((theme) => theme.key === this.selectedTheme)) {
          this.selectedTheme = this.firstTheme?.key || ''
        }
        if (this.mode === 'overview' && this.currentTheme) await this.loadPreview()
        else if (this.mode === 'templates') await this.loadList()
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
    async loadList() {
      if (this.mode !== 'templates') return
      const listId = ++this.listId
      const organizationId = this.organizationId
      const mode = this.mode
      this.loading = true
      this.error = ''
      try {
        const params = {
          limit: this.pageSize,
          offset: (this.page - 1) * this.pageSize
        }
        const response = await reportApi.templates(params)
        if (
          listId !== this.listId ||
          organizationId !== this.organizationId ||
          mode !== this.mode
        ) {
          return
        }
        const data = listData(response)
        this.items = data.results
        this.total = data.count
      } catch (error) {
        if (
          listId === this.listId &&
          organizationId === this.organizationId &&
          mode === this.mode
        ) {
          this.error = reportError(error, this.$t('AuditReportLoadFailed'))
        }
      } finally {
        if (
          listId === this.listId &&
          organizationId === this.organizationId &&
          mode === this.mode
        ) {
          this.loading = false
        }
      }
    },
    openEditor(theme) {
      this.$router.push({ path: '/audit/reports/editor', query: { theme, ...this.range } })
    },
    useTemplate(template) {
      this.$router.push({ path: '/audit/reports/editor', query: { template_id: template.id } })
    },
    themeTitle(key) {
      return this.themes.find((theme) => theme.key === key)?.title || key
    },
    canDeleteTemplate(template) {
      return (
        template.can_delete === true ||
        (Array.isArray(template.actions) && template.actions.includes('delete'))
      )
    },
    async deleteTemplate(template) {
      try {
        await this.$confirm(
          this.$t('AuditReportDeleteTemplateConfirm', { name: template.name }),
          this.$t('Tip'),
          { type: 'warning' }
        )
      } catch {
        return
      }
      try {
        await reportApi.deleteTemplate(template.id)
        this.$message.success(this.$t('DeleteSuccessMsg'))
        await this.loadList()
      } catch (error) {
        this.error = reportError(error, this.$t('AuditReportActionFailed'))
      }
    },
    sourceStatus(status) {
      return this.$t(
        {
          available: 'AuditReportSourceAvailable',
          partial: 'AuditReportSourcePartial',
          permission_denied: 'AuditReportSourceDenied',
          unavailable: 'AuditReportSourceUnavailable'
        }[status] || 'AuditReportSourceUnavailable'
      )
    },
    formatValue(value) {
      return value == null
        ? '—'
        : typeof value === 'number'
          ? value.toLocaleString()
          : String(value)
    },
    cellValue(value) {
      if (value == null || value === '') return '—'
      if (typeof value === 'boolean') return this.$t(value ? 'Yes' : 'No')
      if (typeof value === 'object') return JSON.stringify(value)
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
.page-intro {
  margin: 0;
  color: var(--color-help-text);
  font-size: 12px;
  line-height: 1.5;
}
.report-theme-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px 20px;
  min-width: 0;
  margin-bottom: 16px;
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
.theme-description,
.section-description {
  color: var(--color-text-secondary);
  line-height: 1.6;
  font-size: 12px;
}
.theme-description {
  grid-column: 1 / -1;
  margin: 0;
}
.section-description {
  margin: 0 0 16px;
}
.coverage-warning {
  margin-bottom: 16px;
}
.data-area {
  min-height: 160px;
  padding-top: 16px;
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
.source-coverage {
  margin-top: 20px;
}
.table-section {
  margin: 20px 0;
}
.table-section h3 {
  margin-bottom: 12px;
}
.table-note,
.section-notes,
.conclusion-box small {
  font-size: 12px;
  color: var(--color-help-text);
  line-height: 1.5;
}
.section-notes {
  padding-left: 18px;
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
.template-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
}
.template-card :deep(.el-card__body) {
  height: 100%;
  box-sizing: border-box;
}
.template-card .el-button {
  align-self: flex-start;
  margin-top: auto;
}
.template-title {
  display: flex;
  gap: 8px;
  align-items: center;
}
.template-title h3 {
  flex: 1;
}
.template-title .el-icon {
  color: var(--color-icon-primary);
  font-size: 16px;
}
.template-description {
  flex: 1;
  min-height: 38px;
  margin: 12px 0 20px;
  line-height: 1.6;
  color: var(--color-text-secondary);
  font-size: 12px;
}
.group-title {
  margin: 8px 0 4px;
}
.el-data-table :deep(.el-table__empty-block) {
  min-height: 100px;
}
.el-data-table :deep(.el-table__empty-text) {
  width: 100%;
  max-width: 440px;
  padding: 24px 16px;
  box-sizing: border-box;
  line-height: 20px;
  font-size: 12px;
  color: var(--color-help-text);
}
.el-pagination {
  margin-top: 16px;
  justify-content: flex-end;
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
    gap: 12px;
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
  .template-grid {
    grid-template-columns: 1fr;
  }
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
