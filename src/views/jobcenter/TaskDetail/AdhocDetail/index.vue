<template>
  <GenericDetailPage :object.sync="AdhocDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="AdhocDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import AdhocExecutionHistory from './AdhocExecutionHistory'
import AdhocDetail from './AdhocDetail'

export default {
  components: {
    GenericDetailPage,
    AdhocExecutionHistory,
    AdhocDetail,
    TabPage
  },
  data() {
    return {
      AdhocDetail: {},
      config: {
        activeMenu: 'AdhocDetail',
        title: this.$t('jobcenter.TaskDetail'),
        submenu: [
          {
            title: this.$t('jobcenter.versionDetail'),
            name: 'AdhocDetail'
          },
          {
            title: this.$t('jobcenter.VersionRunExecution'),
            name: 'AdhocExecutionHistory'
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
