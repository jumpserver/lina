<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="tab.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  name: 'Integration',
  components: {
    TabPage
  },
  data() {
    return {
      loading: true,
      activeMenu: 'application',
      tab: {
        submenu: [
          {
            name: 'application',
            title: this.$t('Applications'),
            hidden: !this.$hasPerm('accounts.view_integrationapplication'),
            component: () => import('@/views/accounts/Integration/ApplicationList.vue')
          },
          {
            name: 'switches',
            title: this.$t('AccountSwitchTasks'),
            hidden: !this.$hasPerm('accounts.view_integrationapplication'),
            component: () => import('@/views/accounts/Integration/components/AccountSwitchList.vue')
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
