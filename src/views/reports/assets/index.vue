<template>
  <Page>
    <el-row :gutter="10">
      <el-col :span="4" style="padding: 10px;">
        <div class="tag-container">
          <h5>报表类型</h5>
          <ul class="folder-list m-b-md" style="padding: 0">
            <li v-for="chart in charts" :key="chart.name">
              <a @click="handleChangeChart(chart)">
                <i :class="chart.icon" /> {{ chart.title }}
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
import AssetStatistics from './AssetStatistics.vue'
import Page from '@/layout/components/Page'
import { resolveRoute } from '@/utils/vue/index'

export default {
  name: 'Assets',
  components: {
    AssetStatistics,
    Page
  },
  data() {
    return {
      url: '',
      component: '',
      charts: [
        {
          title: this.$t('AssetStatisticsReport'),
          name: 'AssetStatistics',
          icon: 'fa fa-user-o'
        },
        {
          title: this.$t('AssetActivityReport'),
          name: 'AssetReport',
          icon: 'fa fa-envelope-o'
        }
      ]
    }
  },
  created() {
    this.handleChangeChart(this.charts[0])
  },
  methods: {
    handleChangeChart(chart) {
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
</style>
