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
        title: this.$t('ops.executionDetail'),
        submenu: [
          {
            title: this.$t('ops.executionDetail'),
            name: 'HistoryExecutionDetail'
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
