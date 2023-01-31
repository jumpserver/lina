<template>
  <GenericDetailPage :object.sync="JobDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="JobDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import JobDetail from '@/views/ops/Job/JobDetail/JobDetail'
import JobHistory from '@/views/ops/Job/JobDetail/JobHistory'

export default {
  components: {
    GenericDetailPage,
    JobDetail,
    JobHistory
  },
  data() {
    return {
      JobDetail: {},
      config: {
        getTitle(row) {
          return row['name']
        },
        url: '/api/v1/ops/jobs',
        activeMenu: 'JobDetail',
        submenu: [
          {
            title: this.$t('ops.AdhocDetail'),
            name: 'JobDetail'
          },
          {
            title: this.$t('ops.History'),
            name: 'JobHistory'
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
