<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="object" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="object" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ServiceIntegrationInfo from './ServiceIntegrationInfo.vue'
import ServiceCallRecords from '../components/CallRecords.vue'

export default {
  components: {
    GenericDetailPage,
    ServiceCallRecords,
    ServiceIntegrationInfo
  },
  data() {
    return {
      object: {},
      config: {
        titlePrefix: this.$t('ServiceIntegrationDetail'),
        activeMenu: 'ServiceIntegrationInfo',
        url: '/api/v1/accounts/service-integrations',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'ServiceIntegrationInfo',
            hidden: () => !this.$hasPerm('accounts.view_serviceintegration')
          },
          {
            name: 'ServiceCallRecords',
            title: this.$t('CallRecords'),
            hidden: () => !this.$hasPerm('audits.view_serviceaccesslog')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
