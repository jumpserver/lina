<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="taskDetail"
    :title="getTitle"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="taskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import CeleryTaskLog from '../CeleryTaskLog.vue'
import TaskDetail from './TaskDetail.vue'
import TaskHistory from './TaskHistory.vue'

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
            title: this.$t('Basic'),
            name: 'TaskDetail'
          },
          {
            title: this.$t('ExecutionHistory'),
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
      return this.taskDetail.meta && this.taskDetail.meta.comment
        ? this.taskDetail.meta.comment
        : this.taskDetail.name
    }
  }
}
</script>
