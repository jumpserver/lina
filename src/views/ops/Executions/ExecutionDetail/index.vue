<template>
  <GenericDetailPage
    :object.sync="JobExecutionDetail"
    :active-menu.sync="config.activeMenu"
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
import JobExecutionDetail from '@/views/ops/Executions/ExecutionDetail/JobExecutionDetail'
import ScriptDetail from '@/views/ops/Executions/ExecutionDetail/ScriptDetail'
import AssetResultDetail from '@/views/ops/Executions/ExecutionDetail/AssetResultDetail'

export default {
  components: {
    GenericDetailPage,
    JobExecutionDetail,
    ScriptDetail,
    AssetResultDetail
  },
  data() {
    return {
      JobExecutionDetail: {},
      config: {
        getTitle(row) {
          return row['name']
        },
        url: '/api/v1/ops/job-executions/',
        activeMenu: 'JobExecutionDetail',
        submenu: [
          {
            title: this.$t('ops.ExecutionDetail'),
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
