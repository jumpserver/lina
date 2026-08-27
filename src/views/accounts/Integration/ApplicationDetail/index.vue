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
import CredentialActivities from './CredentialActivities.vue'
import CredentialPolicies from './CredentialPolicies.vue'
import IntegrationApplicationInfo from './ServiceInfo.vue'

export default {
  components: {
    GenericDetailPage,
    CredentialActivities,
    CredentialPolicies,
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
            name: 'CredentialPolicies',
            title: this.$t('CredentialPolicies'),
            hidden: () => !this.$hasPerm('accounts.view_credentialpolicy')
          },
          {
            name: 'CredentialActivities',
            title: this.$t('CredentialActivities'),
            hidden: () =>
              !this.$hasPerm('accounts.view_credentialpolicy') ||
              ![
                'accounts.view_credentialpolicyversion',
                'accounts.view_credentialissuerequest',
                'accounts.view_credentiallease'
              ].some((permission) => this.$hasPerm(permission))
          }
        ]
      }
    }
  }
}
</script>
