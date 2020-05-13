<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TaskDetail from './TaskDetail'
import TaskHistory from './TaskHistory'
import TaskAdhoc from './TaskAdhoc'
export default {
  components: {
    GenericDetailPage,
    TaskHistory,
    TaskDetail,
    TaskAdhoc,
    TabPage
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        activeMenu: 'TaskDetail',
        submenu: [
          {
            title: this.$t('jobcenter.taskDetail'),
            name: 'TaskDetail'
          },
          {
            title: this.$t('jobcenter.taskVersions'),
            name: 'TaskAdhoc'
          },
          {
            title: this.$t('jobcenter.execution'),
            name: 'TaskHistory'
          },
          {
            title: this.$t('jobcenter.laskExecutionOutput'),
            name: 'laskExecutionOutput'
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
