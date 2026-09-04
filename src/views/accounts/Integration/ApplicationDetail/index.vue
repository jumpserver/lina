<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="object"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="object" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import IntegrationApplicationAccount from '../components/AccountList.vue'
import IntegrationApplicationCallRecords from '../components/CallRecords.vue'
import ClientAccessPrototype from './ClientAccessPrototype.vue'
import IntegrationApplicationInfo from './ServiceInfo.vue'

export default {
  components: {
    GenericDetailPage,
    ClientAccessPrototype,
    IntegrationApplicationCallRecords,
    IntegrationApplicationInfo,
    IntegrationApplicationAccount
  },
  data() {
    return {
      object: {},
      config: {
        titlePrefix: this.$t('ApplicationDetail'),
        activeMenu: 'IntegrationApplicationInfo',
        url: '/api/v1/accounts/integration-applications',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'IntegrationApplicationInfo',
            hidden: () => !this.$hasPerm('accounts.view_integrationapplication')
          },
          {
            title: this.$t('Accounts'),
            name: 'IntegrationApplicationAccount',
            hidden: () => !this.$hasPerm('accounts.view_integrationapplication')
          },
          {
            title: this.$t('ClientAccess'),
            name: 'ClientAccessPrototype',
            hidden: () => !this.$hasPerm('accounts.view_clientaccessconfiguration')
          },
          {
            title: this.$t('CallRecords'),
            name: 'IntegrationApplicationCallRecords',
            hidden: () => !this.$hasPerm('audits.view_integrationapplicationlog')
          }
        ]
      }
    }
  }
}
</script>
