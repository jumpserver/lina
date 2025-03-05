<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="tab.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
import { mapGetters } from 'vuex'

export default {
  name: 'Integrationn',
  components: {
    TabPage
  },
  data() {
    return {
      loading: true,
      activeMenu: 'service',
      tab: {
        submenu: [
          {
            name: 'application',
            title: this.$t('Applications'),
            hidden: !this.$hasPerm('accounts.view_integrationapplication'),
            component: () => import('@/views/accounts/Integration/ApplicationList.vue')
          },
          {
            name: 'records',
            title: this.$t('CallRecords'),
            hidden: !this.$hasPerm('audits.view_integrationapplicationlog'),
            component: () => import('@/views/accounts/Integration/components/CallRecords.vue')
          },
          {
            name: 'docs',
            title: this.$t('Documentation'),
            hidden: !this.$hasPerm('accounts.view_integrationapplication'),
            component: () => import('@/views/accounts/Integration/SDKList.vue')
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
