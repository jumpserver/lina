<template>
  <GenericDetailPage
    ref="detailPage"
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="object"
  >
    <template
      v-if="config.activeMenu === 'ClientAccessPrototype' && clientActions.length"
      #headingRightSide
    >
      <ActionsGroup :actions="clientActions" class="client-header-actions" />
    </template>
    <keep-alive>
      <component
        :is="config.activeMenu"
        :object="object"
        @detail-actions-change="clientActions = $event"
        @edit-application="editApplication"
      />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ActionsGroup from '@/components/Common/ActionsGroup'
import IntegrationApplicationAccount from '../components/AccountList.vue'
import ClientAccessPrototype from './ClientAccessPrototype.vue'
import IntegrationApplicationInfo from './ServiceInfo.vue'

export default {
  components: {
    ActionsGroup,
    GenericDetailPage,
    ClientAccessPrototype,
    IntegrationApplicationInfo,
    IntegrationApplicationAccount
  },
  data() {
    return {
      object: {},
      clientActions: [],
      config: {
        titlePrefix: this.$t('ApplicationDetail'),
        activeMenu: this.$route.query.configuration
          ? 'ClientAccessPrototype'
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
            title: this.$t('ClientAccess'),
            name: 'ClientAccessPrototype',
            hidden: () => !this.$hasPerm('accounts.view_clientaccessconfiguration')
          }
        ]
      }
    }
  },
  methods: {
    editApplication() {
      this.$refs.detailPage.defaultUpdate()
    }
  }
}
</script>

<style scoped>
.client-header-actions {
  margin-right: 20px;
}
</style>
