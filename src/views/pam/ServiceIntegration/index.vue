<template>
  <TabPage
    :active-menu.sync="activeMenu"
    :submenu="tab.submenu"
  />
</template>

<script>
import { TabPage } from '@/layout/components'

export default {
  name: 'ServiceIntegrationList',
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
            name: 'service',
            title: this.$t('RelevantApp'),
            hidden: !this.$hasPerm('accounts.view_serviceintegration'),
            component: () => import('@/views/pam/ServiceIntegration/ServiceIntegrationList.vue')
          },
          {
            name: 'call-records',
            title: this.$t('CallRecords'),
            hidden: !this.$hasPerm('audits.view_serviceaccesslog'),
            component: () => import('@/views/pam/ServiceIntegration/components/CallRecords.vue')
          },
          {
            name: 'sdk-doc',
            title: this.$t('SDK'),
            hidden: !this.$hasPerm('accounts.view_serviceintegration'),
            component: () => import('@/views/pam/ServiceIntegration/SDKList.vue')
          }
        ]
      }
    }
  },
  watch: {},
  async mounted() {
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
</style>
