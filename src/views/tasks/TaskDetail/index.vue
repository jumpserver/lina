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
import CeleryTaskLog from '../CeleryTaskLog'

export default {
  components: {
    GenericDetailPage,
    CeleryTaskLog,
    TaskHistory,
    TaskDetail,
    TabPage
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        url: '/api/v1/ops/tasks',
        activeMenu: 'TaskDetail',
        submenu: [
          {
            title: this.$t('ops.taskDetail'),
            name: 'TaskDetail'
          },
          {
            title: this.$t('ops.execution'),
            name: 'TaskHistory'
          }
        ],
        hasRightSide: false,
        hasActivity: false
      }
    }
  }
}
</script>

<style scoped>

</style>
