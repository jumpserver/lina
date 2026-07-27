<template>
  <Page>
    <el-row :gutter="10">
      <el-col :span="4" style="padding: 10px">
        <div class="tag-container">
          <h5>{{ title }}</h5>
          <ul class="folder-list m-b-md" style="padding: 0">
            <li v-for="chart in chartItems" :key="chart.key" :class="{ active: isActive(chart) }">
              <a class="menu-link" @click="handleChangeChart(chart)">
                <i :class="chart.icon" style="margin-right: 6px" />
                {{ chart.title }}
              </a>
              <ul v-if="chart.children && chart.children.length" class="report-children">
                <li
                  v-for="child in chart.children"
                  :key="child.key"
                  :class="{ active: isActive(child) }"
                >
                  <a class="menu-link child-link" @click="handleChangeChart(child)">
                    {{ child.title }}
                  </a>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :span="20" style="background-color: #fff" class="chart">
        <component :is="component" :key="componentKey" :nav="false" :url="url" />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import AccountStatistics from '@/views/reports/accounts/AccountStatistics.vue'
import AccountAutomation from '@/views/reports/accounts/AccountAutomation.vue'
import {
  appendQuery,
  buildCustomReportRouteQuery,
  reportDebugLog
} from '@/views/reports/base/reportUtils'

const MENU_ITEMS = [
  {
    key: 'AccountStatistics',
    titleKey: 'AccountStatisticsReport',
    component: AccountStatistics,
    path: '/reports/accounts/account-statistics',
    icon: 'fa fa-users',
    perm: 'rbac.view_accountstatisticsreport',
    reportType: 'AccountStatistics'
  },
  {
    key: 'AccountAutomationReport',
    titleKey: 'AccountAutomationReport',
    component: AccountAutomation,
    path: '/reports/accounts/account-automation',
    icon: 'fa fa-cogs',
    perm: 'rbac.view_accountautomationreport',
    reportType: 'AccountAutomationReport'
  }
]

export default {
  name: 'Accounts',
  components: {
    Page
  },
  data() {
    return {
      url: '',
      title: this.$t('ReportType'),
      component: '',
      componentKey: '',
      selectedChartKey: '',
      chartItems: [],
      catalogLoaded: false,
      lastSyncQueryKey: '',
      isPageActive: true,
      syncRetryPending: false
    }
  },
  watch: {
    '$route.fullPath'() {
      if (!this.isPageActive) return
      const routeKey = this.buildRouteSyncKey(this.$route.query)
      if (routeKey === this.lastSyncQueryKey) return
      this.lastSyncQueryKey = routeKey
      reportDebugLog('accounts.index.route.fullPath', {
        routePath: this.$route.path,
        query: this.$route.query,
        selectedChartKey: this.selectedChartKey
      })
      this.syncSelectedFromRoute()
    }
  },
  async created() {
    await this.loadCatalog()
    this.$eventBus.$on('reportCatalogChanged', this.handleCatalogChanged)
  },
  beforeUnmount() {
    this.$eventBus.$off('reportCatalogChanged', this.handleCatalogChanged)
  },
  activated() {
    this.isPageActive = true
    this.syncSelectedFromRoute()
  },
  deactivated() {
    this.isPageActive = false
  },
  methods: {
    getBaseItems() {
      return MENU_ITEMS.filter((item) => this.$hasPerm(item.perm)).map((item) => ({
        key: item.key,
        title: this.$t(item.titleKey),
        component: item.component,
        path: item.path,
        icon: item.icon,
        isCustom: false,
        reportType: item.reportType,
        query: {
          chart_key: item.key
        },
        children: []
      }))
    },
    async loadCatalog() {
      reportDebugLog('accounts.index.loadCatalog.start', {
        routePath: this.$route.path,
        query: this.$route.query
      })
      this.catalogLoaded = false
      const items = this.getBaseItems()
      const itemMap = items.reduce((acc, item) => {
        if (item.reportType) {
          acc[item.reportType] = item
        }
        return acc
      }, {})
      try {
        const data = await this.$axios.get('/api/v1/reports/reports/catalog/')
        data.forEach((group) => {
          const target = itemMap[group.tp]
          if (!target) {
            return
          }
          target.children = (group.children || []).map((child) => ({
            key: `report-${child.id}`,
            title: child.name,
            component: target.component,
            path: target.path,
            reportId: String(child.id),
            isCustom: true,
            query: {
              ...buildCustomReportRouteQuery(child),
              chart_key: target.key
            }
          }))
        })
      } catch (error) {
        console.error('load report catalog failed', error)
      }
      this.chartItems = items
      this.catalogLoaded = true
      reportDebugLog('accounts.index.loadCatalog.done', {
        items: items.map((item) => ({ key: item.key, childCount: (item.children || []).length }))
      })
      this.syncSelectedFromRoute()
    },
    syncSelectedFromRoute() {
      const normalizeRouteValue = (v) => (Array.isArray(v) ? v[0] : v || '')
      const raw = this.$route.query.report_id
      const reportId = Array.isArray(raw) ? raw[0] : raw
      let target = null
      if (reportId) {
        target = this.chartItems
          .flatMap((item) => item.children || [])
          .find((item) => String(item.reportId) === String(reportId))
        if (!target) {
          if (!this.catalogLoaded) {
            return
          }
          if (!this.syncRetryPending) {
            this.syncRetryPending = true
            this.loadCatalog()
            return
          }
          this.syncRetryPending = false
          const nextQuery = { ...(this.$route.query || {}) }
          delete nextQuery.report_id
          this.$router.replace({ path: this.$route.path, query: nextQuery })
          return
        }
        this.syncRetryPending = false
      }
      if (!target) {
        const chartKey = this.$route.query.chart_key
        target =
          this.chartItems.find((item) => item.key === chartKey) ||
          this.chartItems.find((item) => item.key === this.selectedChartKey) ||
          this.chartItems[0]
      }
      if (target?.isCustom) {
        const rq = this.$route.query || {}
        const desiredBase = {
          chart_key: target.query?.chart_key || target.key,
          report_id: String(target.reportId || target.query?.report_id || '')
        }
        const currentBase = {
          chart_key: normalizeRouteValue(rq.chart_key),
          report_id: normalizeRouteValue(rq.report_id)
        }
        const baseNeedsCorrection = JSON.stringify(currentBase) !== JSON.stringify(desiredBase)
        const hasStaleVisibleParams =
          rq.visible_charts !== undefined || rq.visible_tables !== undefined
        if (baseNeedsCorrection || hasStaleVisibleParams) {
          const correctedQuery = { ...desiredBase }
          if (rq.days) correctedQuery.days = rq.days
          if (rq.customize) correctedQuery.customize = rq.customize
          this.$router.replace({ path: this.$route.path, query: correctedQuery })
          return
        }
      }
      if (target && (this.selectedChartKey !== target.key || !this.component)) {
        this.applyChart(target)
      }
      reportDebugLog('accounts.index.syncSelectedFromRoute', {
        reportId,
        selectedChartKey: this.selectedChartKey,
        targetKey: target?.key || ''
      })
    },
    buildRouteSyncKey(query = {}) {
      return JSON.stringify({
        report_id: query.report_id || '',
        chart_key: query.chart_key || '',
        days: query.days || ''
      })
    },
    handleCatalogChanged() {
      this.loadCatalog()
    },
    isActive(item) {
      return this.selectedChartKey === item.key
    },
    applyChart(chart) {
      this.selectedChartKey = chart.key
      if (!chart.component || !chart.path) {
        return
      }
      this.component = chart.component
      this.componentKey = chart.key
      this.url = appendQuery('/ui/#' + chart.path, chart.query || {})
      reportDebugLog('accounts.index.applyChart', {
        chartKey: chart.key,
        reportId: chart.reportId || '',
        url: this.url,
        routePath: this.$route.path,
        query: this.$route.query
      })
    },
    handleChangeChart(chart) {
      const nextQuery = {
        ...(this.$route.query.days && !chart.isCustom ? { days: this.$route.query.days } : {}),
        ...(chart.query || {})
      }
      reportDebugLog('accounts.index.handleChangeChart', {
        reportId: chart.reportId || '',
        nextQuery,
        currentQuery: this.$route.query
      })
      const normalize = (query = {}) => ({
        days: query.days || '',
        report_id: query.report_id || '',
        chart_key: query.chart_key || ''
      })
      if (JSON.stringify(normalize(this.$route.query)) === JSON.stringify(normalize(nextQuery))) {
        this.applyChart(chart)
        return
      }
      this.$router.replace({
        path: this.$route.path,
        query: nextQuery
      })
    }
  }
}
</script>

<style scoped lang="scss">
.page {
  :deep(.page-content) {
    padding-right: 20px;
    padding-top: 10px;
  }
}

h5 {
  font-size: 13px;
}

.folder-list li {
  border-bottom: 1px solid #e7eaec;
  display: block;
  font-size: 13px;
  padding: 5px 0;

  .report-children {
    li {
      border-bottom: none;
    }
  }

  .fa {
    margin-right: 10px;
  }
}

.menu-link {
  display: flex;
  align-items: center;
}

.report-children {
  margin: 6px 0 0 18px;
  padding: 0;
}

.child-link {
  color: #606266;
  font-size: 12px;
}

.tag-container {
  border-radius: 5px;
}

.chart {
  padding: 10px;

  :deep(.content) {
    background-color: #fff;
    overflow: hidden;
    height: 100%;
  }
}

.folder-list li.active > .menu-link {
  color: var(--color-primary);
  border-radius: 4px;
}
</style>
