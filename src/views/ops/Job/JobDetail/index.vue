<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="JobDetail" v-bind="config" v-on="$listeners">
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
            title: this.$t('AdhocDetail'),
            name: 'JobDetail'
          },
          {
            title: this.$t('History'),
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
