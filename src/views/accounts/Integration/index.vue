<template>
  <TabPage v-model:active-menu="activeMenu" :submenu="tab.submenu" />
</template>

<script>
import { TabPage } from '@/layout/components'

export default {
  name: 'Integration',
  components: {
    TabPage
  },
  data() {
    return {
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
            name: 'records',
            title: this.$t('AppAuditLogs'),
            hidden: !this.$hasPerm('audits.view_integrationapplicationlog'),
            component: () => import('@/views/accounts/Integration/components/ApplicationAudit.vue')
          },
          {
            name: 'rotations',
            title: this.$t('CredentialPolicies'),
            hidden: !this.$hasPerm('accounts.view_applicationcredential'),
            component: () => import('@/views/accounts/Integration/AccountRotationPrototype.vue')
          },
          {
            name: 'notifications',
            title: this.$t('EventNotifications'),
            hidden: !this.$hasPerm('accounts.view_applicationwebhook'),
            component: () => import('@/views/accounts/Integration/ApplicationWebhookRules.vue')
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
  }
}
</script>
