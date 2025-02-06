<template>
  <TabPage :active-menu.sync="activeMenu" :submenu="tab.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'
// import TabPage from '@/layout/components/TabPage/index.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'IntegrationnList',
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
            component: () => import('@/views/pam/Integration/ApplicationList.vue')
          },
          {
            name: 'records',
            title: this.$t('Records'),
            hidden: !this.$hasPerm('audits.view_integrationapplicationlog'),
            component: () => import('@/views/pam/Integration/components/CallRecords.vue')
          },
          {
            name: 'docs',
            title: this.$t('Documentation'),
            hidden: !this.$hasPerm('accounts.view_integrationapplication'),
            component: () => import('@/views/pam/Integration/SDKList.vue')
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
