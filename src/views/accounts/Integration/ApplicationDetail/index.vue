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
import IntegrationApplicationInfo from './ServiceInfo.vue'
import ApplicationAudit from '../components/ApplicationAudit.vue'
import ApplicationConnections from './ApplicationConnections.vue'
import ApplicationEventProcessing from './ApplicationEventProcessing.vue'

export default {
  components: {
    GenericDetailPage,
    IntegrationApplicationInfo,
    IntegrationApplicationAccount,
    ApplicationAudit,
    ApplicationConnections,
    ApplicationEventProcessing
  },
  data() {
    return {
      object: {},
      config: {
        titlePrefix: this.$t('ApplicationDetail'),
        activeMenu:
          this.$route.query.access === '1'
            ? 'ApplicationConnections'
            : 'IntegrationApplicationInfo',
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
            title: this.$t('AccessAndConnections'),
            name: 'ApplicationConnections',
            hidden: () => !this.$hasPerm('accounts.view_credentialclientinstance')
          },
          {
            title: this.$t('ApplicationEventProcessing'),
            name: 'ApplicationEventProcessing',
            hidden: () => !this.$hasPerm('accounts.view_integrationapplication')
          },
          {
            title: this.$t('AppAuditLogs'),
            name: 'ApplicationAudit',
            hidden: () => !this.$hasPerm('audits.view_integrationapplicationlog')
          }
        ]
      }
    }
  },
  watch: {
    '$route.query.access'(value) {
      if (value === '1') this.config.activeMenu = 'ApplicationConnections'
    }
  }
}
</script>
