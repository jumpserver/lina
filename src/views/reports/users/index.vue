<template>
  <Page>
    <el-row :gutter="10">
      <el-col :span="4" style="padding: 10px;">
        <div class="tag-container">
          <h5>{{ title }}</h5>
          <ul class="folder-list m-b-md" style="padding: 0">
            <li
              v-for="chart in chartItems"
              :key="chart.key"
              :class="{ active: isActive(chart) }"
            >
              <a class="menu-link" @click="handleChangeChart(chart)">
                <i :class="chart.icon" style="margin-right: 6px;" />
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
import { resolveRoute } from '@/utils/vue/index'
import { appendQuery, isSameReportQuery } from '@/views/reports/base/reportUtils'

const TEMPLATE_ROUTE_MAP = {
  UserLoginReport: {
    name: 'UserReport',
    titleKey: 'UserLoginReport',
    icon: 'fa fa-sign-in',
    perm: 'rbac.view_userloginreport'
  },
  UserChangePasswordReport: {
    name: 'ChangePassword',
    titleKey: 'UserChangePasswordReport',
    icon: 'fa fa-key',
    perm: 'rbac.view_userchangepasswordreport'
  }
}

export default {
  name: 'Users',
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
      chartItems: []
    }
  },
  watch: {
    '$route.fullPath'() {
      this.syncSelectedFromRoute()
    }
  },
  async created() {
    await this.loadCatalog()
  },
  methods: {
    getBuiltInTemplates() {
      return Object.entries(TEMPLATE_ROUTE_MAP)
        .filter(([, item]) => this.$hasPerm(item.perm))
        .map(([reportType, item]) => ({
          key: reportType,
          reportType,
          title: this.$t(item.titleKey),
          routeName: item.name,
          icon: item.icon,
          isCustom: false,
          query: {},
          children: []
        }))
    },
    async loadCatalog() {
      const templates = this.getBuiltInTemplates()
      const chartMap = templates.reduce((acc, item) => {
        acc[item.reportType] = item
        return acc
      }, {})
      try {
        const data = await this.$axios.get('/api/v1/reports/reports/catalog/')
        data.forEach((group) => {
          const target = chartMap[group.tp]
          if (!target) {
            return
          }
          target.children = (group.children || []).map(child => ({
            key: `report-${child.id}`,
            title: child.name,
            routeName: target.routeName,
            reportId: child.id,
            isCustom: true,
            query: { report_id: child.id }
          }))
        })
      } catch (error) {
        console.error('load report catalog failed', error)
      }
      this.chartItems = templates
      this.syncSelectedFromRoute()
    },
    syncSelectedFromRoute() {
      const raw = this.$route.query.report_id
      const reportId = Array.isArray(raw) ? raw[0] : raw
      let target = null
      if (reportId) {
        target = this.chartItems
          .flatMap(item => item.children || [])
          .find(item => item.reportId === reportId)
        if (!target) {
          this.loadCatalog()
          return
        }
      }
      if (!target) {
        target = this.chartItems[0]
      }
      if (target) {
        this.applyChart(target)
      }
    },
    isActive(item) {
      return this.selectedChartKey === item.key
    },
    applyChart(chart) {
      this.selectedChartKey = chart.key
      const route = resolveRoute({ name: chart.routeName }, this.$router)
      this.component = route.components.default
      this.componentKey = `${chart.key}-${this.$route.fullPath}`
      this.url = appendQuery('/ui/#' + route.path, chart.query || {})
    },
    handleChangeChart(chart) {
      const nextQuery = chart.query || {}
      if (isSameReportQuery(this.$route.query, nextQuery)) {
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
  ::v-deep .page-content {
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

  ::v-deep .content {
    background-color: #fff;
    overflow: hidden;
    height: 100%;
  }
}

.folder-list li.active {
  color: var(--color-primary);
  background-color: var(--menu-hover);
  border-radius: 4px;
}
</style>