<template>
  <TabPage
    v-model:active-menu="activeMenu"
    :submenu="tab.submenu"
  />
</template>

<script>
import { TabPage } from '@/layout/components'

export default {
  name: 'AssetAccountList',
  components: {
    TabPage
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      loading: true,
      activeMenu: 'host',
      tab: {
        submenu: [
          {
            name: 'account',
            title: this.$t('Accounts'),
            icon: 'fa-key',
            hidden: !this.$hasPerm('accounts.view_account'),
            component: () => import('@/views/accounts/PAM/AccountList.vue')
          },
          {
            name: 'asset',
            title: this.$t('Assets'),
            icon: 'fa-inbox',
            hidden: !this.$hasPerm('assets.view_asset'),
            component: () => import('@/views/accounts/PAM/AssetList.vue')
          },
          {
            name: 'AccountTemplateList',
            title: this.$t('AccountTemplate'),
            icon: 'template',
            hidden: !this.$hasPerm('accounts.view_accounttemplate'),
            component: () => import('@/views/accounts/PAM/AccountTemplate.vue')
          }
        ]
      }
    }
  }
}
</script>
