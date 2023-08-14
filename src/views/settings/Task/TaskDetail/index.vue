<template>
  <GenericDetailPage
    :active-menu.sync="config.activeMenu"
    :object.sync="taskDetail"
    :title="getTitle"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="taskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import TaskDetail from './TaskDetail.vue'
import TaskHistory from './TaskHistory.vue'
import CeleryTaskLog from '../CeleryTaskLog.vue'

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
      taskDetail: {},
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
            name: 'TaskHistory',
            hidden: () => !this.$hasPerm('ops.view_celerytaskexecution')
          }
        ],
        hasRightSide: false,
        hasActivity: false
      }
    }
  },
  computed: {
    getTitle() {
      return this.taskDetail.meta && this.taskDetail.meta.comment ? this.taskDetail.meta.comment : this.taskDetail.name
    }
  }
}
</script>

<style scoped>

</style>
