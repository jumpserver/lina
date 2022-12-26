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
        activeMenu: 'GatheredUserList',
        submenu: [
          {
            title: this.$t('xpack.GatherUser.GatherUserList'),
            name: 'GatheredUserList',
            hidden: !this.$hasPerm('assets.view_gathereduser'),
            component: () => import('@/views/accounts/AccountGather/GatheredUserList.vue')
          },
          {
            title: this.$t('xpack.GatherUser.GatherUserTaskList'),
            name: 'TaskList',
            hidden: !this.$hasPerm('assets.view_gatheraccountsautomation'),
            component: () => import('@/views/accounts/AccountGather/TaskList.vue')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
