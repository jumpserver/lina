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
import CeleryTaskLog from '../CeleryTaskLog'
export default {
  components: {
    GenericDetailPage,
    CeleryTaskLog,
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
            title: this.$t('ops.taskDetail'),
            name: 'TaskDetail'
          },
          {
            title: this.$t('ops.taskVersions'),
            name: 'TaskAdhoc',
            hidden: () => !this.$hasPerm('ops.view_adhoc')
          },
          {
            title: this.$t('ops.execution'),
            name: 'TaskHistory',
            hidden: () => !this.$hasPerm('ops.view_adhocexecution')
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
