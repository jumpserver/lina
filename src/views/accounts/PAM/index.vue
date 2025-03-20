<template>
  <TabPage
    :active-menu.sync="activeMenu"
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
            component: () => import('@/views/accounts/PAM/AccountList.vue')
          },
          {
            name: 'asset',
            title: this.$t('Assets'),
            icon: 'fa-inbox',
            component: () => import('@/views/accounts/PAM/AssetList.vue')
          },
          {
            name: 'AccountTemplateList',
            title: this.$t('AccountTemplate'),
            icon: 'template',
            component: () => import('@/views/accounts/PAM/AccountTemplate.vue')
          }
        ]
      }
    }
  }
}
</script>
