<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="JobExecutionDetail"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="JobExecutionDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import JobExecutionDetail from '@/views/ops/Execution/ExecutionDetail/JobExecutionDetail'

export default {
  components: {
    GenericDetailPage,
    JobExecutionDetail
  },
  data() {
    return {
      JobExecutionDetail: {},
      config: {
        getTitle(row) {
          return row['name']
        },
        url: '/api/v1/ops/job-executions',
        activeMenu: 'JobExecutionDetail',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'JobExecutionDetail'
          }
        ],
        hasRightSide: false
      }
    }
  }
}
</script>

<style scoped>

</style>
