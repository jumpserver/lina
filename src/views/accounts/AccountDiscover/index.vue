<template>
  <TabPage
    :active-menu.sync="config.activeMenu"
    :submenu="config.submenu"
  />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  name: 'Index',
  components: {
    TabPage
  },
  data() {
    return {
      config: {
        activeMenu: 'AccountDiscoverList',
        submenu: [
          {
            title: this.$t('DiscoveredAccountList'),
            name: 'AccountDiscoverList',
            hidden: !this.$hasPerm('accounts.view_gatheredaccount'),
            component: () => import('@/views/accounts/AccountDiscover/AccountDiscoverList.vue')
          },
          {
            title: this.$t('DiscoverAccountTask', 2),
            name: 'AccountDiscoverTaskList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsautomation'),
            component: () => import('@/views/accounts/AccountDiscover/AccountDiscoverTaskList.vue')
          },
          {
            title: this.$t('ExecutionHistory'),
            name: 'AccountDiscoverTaskExecutionList',
            hidden: !this.$hasPerm('accounts.view_gatheraccountsexecution'),
            component: () => import('@/views/accounts/AccountDiscover/TaskExecutionList.vue')
          }
        ]
      }
    }
  },
  computed: {
    ...mapGetters(['hasValidLicense'])
  }
}
</script>

<style scoped>
</style>
