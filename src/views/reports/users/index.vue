<template>
  <Page>
    <el-row :gutter="10">
      <el-col :span="4" style="padding: 10px;">
        <div class="tag-container">
          <h5>{{ title }}</h5>
          <ul class="folder-list m-b-md" style="padding: 0">
            <li
              v-for="chart in chartItems"
              :key="chart.name"
              :class="{ active: selectedChart && selectedChart.name === chart.name }"
            >
              <a style="display: flex; align-items: center;" @click="handleChangeChart(chart)">
                <i :class="chart.icon" style="margin-right: 6px;" />
                {{ chart.title }}
              </a>
            </li>
          </ul>
        </div>
      </el-col>
      <el-col :span="20" style="background-color: #fff" class="chart">
        <component :is="component" :nav="false" :url="url" />
      </el-col>
    </el-row>
  </Page>
</template>

<script>
import UserReport from './UserActivity.vue'
import Page from '@/layout/components/Page'
import { resolveRoute } from '@/utils/vue/index'

export default {
  name: 'Users',
  components: {
    UserReport,
    Page
  },
  data() {
    return {
      url: '',
      title: this.$t('ReportType'),
      component: '',
      selectedChart: null,
      charts: [
        {
          title: this.$t('UserLoginReport'),
          name: 'UserReport',
          icon: 'fa fa-sign-in',
          hidden: this.$hasPerm('rbac.view_userloginreport')
        },
        {
          title: this.$t('UserChangePasswordReport'),
          name: 'ChangePassword',
          icon: 'fa fa-key',
          hidden: this.$hasPerm('rbac.view_userchangepasswordreport')
        }
      ]
    }
  },
  computed: {
    chartItems() {
      return this.charts.filter(chart => chart.hidden)
    }
  },
  created() {
    if (this.chartItems.length > 0) {
      this.handleChangeChart(this.chartItems[0])
    }
  },
  methods: {
    handleChangeChart(chart) {
      this.selectedChart = chart
      const route = resolveRoute({ name: chart.name }, this.$router)
      this.component = route.components.default
      const routePath = route.path
      this.url = '/ui/#' + routePath
      this.name = chart.name
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

  .fa {
    margin-right: 10px;
  }
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
.folder-list li.active {
  color: var(--color-primary);
  background-color: var(--menu-hover);
  border-radius: 4px;
}
</style>
