<template>
  <GenericDetailPage :object.sync="HistoryExecutionDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners" @tab-click="TabClick">
    <keep-alive>
      <component :is="config.activeMenu" :object="HistoryExecutionDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import HistoryExecutionDetail from './HistoryExecutionDetail'
import CeleryTaskLog from '../../CeleryTaskLog'

export default {
  components: {
    HistoryExecutionDetail,
    GenericDetailPage,
    CeleryTaskLog,
    TabPage
  },
  data() {
    return {
      HistoryExecutionDetail: {},
      config: {
        activeMenu: 'HistoryExecutionDetail',
        title: this.$t('jobcenter.executionDetail'),
        submenu: [
          {
            title: this.$t('jobcenter.executionDetail'),
            name: 'HistoryExecutionDetail'
          },
          {
            title: this.$t('jobcenter.output'),
            name: 'CeleryTaskLog'
          }
        ],
        hasRightSide: false,
        actions: {
          detailApiUrl: `/api/v1/ops/adhoc-executions/${this.$route.params.id}/`
        }
      }
    }
  },
  methods: {
    TabClick(currentTab, previousTab) {
      if (currentTab.name === 'CeleryTaskLog') {
        this.$set(this.config, 'activeMenu', previousTab)
        const taskId = this.HistoryExecutionDetail.id
        window.open(`/ops/celery/task/${taskId}/log/`, '', 'width=900,height=600')
      }
    }
  }
}
</script>

<style scoped>

</style>
