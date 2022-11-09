<template>
  <GenericDetailPage :object.sync="TaskDetail" :active-menu.sync="config.activeMenu" v-bind="config" v-on="$listeners">
    <keep-alive>
      <component :is="config.activeMenu" :object="TaskDetail" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail'
import TaskExecutionList from './TaskExecutionList'
export default {
  name: 'SyncInstanceTaskDetail',
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    TaskExecutionList
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        url: '/api/v1/assets/gather-account-automations/',
        activeMenu: 'Detail',
        actions: {
          canUpdate: this.$hasPerm('assets.change_automationexecution'),
          canDelete: this.$hasPerm('assets.delete_automationexecution')
        },
        submenu: [
          {
            title: this.$t('xpack.GatherUser.GatherUserTaskDetail'),
            name: 'Detail'
          },
          {
            title: this.$t('xpack.GatherUser.GatherUserTaskExecutionList'),
            name: 'TaskExecutionList',
            hidden: !this.$hasPerm('assets.view_automationexecution')
          }
        ],
        hasRightSide: true
      }
    }
  }
}
</script>

<style scoped>

</style>
