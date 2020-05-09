<template>
  <GenericDetailPage :object.sync="HistoryExecutionDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="HistoryExecutionDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import HistoryExecutionDetail from './HistoryExecutionDetail'

export default {
  components: {
    HistoryExecutionDetail,
    GenericDetailPage,
    TabPage
  },
  data() {
    return {
      HistoryExecutionDetail: {},
      config: {
        activeMenu: 'HistoryExecutionDetail',
        title: this.$t('jobcenter.ExecutionDetail'),
        submenu: [
          {
            title: this.$t('jobcenter.ExecutionDetail'),
            name: 'HistoryExecutionDetail'
          },
          {
            title: this.$t('jobcenter.Output'),
            name: 'OutPut'
          }
        ],
        hasRightSide: false,
        actions: {
          detailApiUrl: `/api/v1/ops/adhoc-executions/${this.$route.params.id}/`
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
