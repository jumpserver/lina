<template>
  <TabPage :active-menu.sync="config.activeMenu" :submenu="config.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
export default {
  name: 'Index',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        activeMenu: 'AccountGatherTaskList',
        submenu: [
          {
            title: this.$t('xpack.GatherUser.GatherUserTaskList'),
            name: 'AccountGatherTaskList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsautomation'),
            component: () => import('@/views/accounts/AccountGather/AccountGatherTaskList.vue')
          },
          {
            title: this.$t('xpack.GatherUser.ExecutionList'),
            name: 'AccountGatherTaskExecutionList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsexecution'),
            component: () => import('@/views/accounts/AccountGather/TaskDetail/TaskExecutionList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>
</style>
