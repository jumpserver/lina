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
            title: this.$t('Account'),
            icon: 'fa-key',
            component: () => import('@/views/pam/Account/AccountList.vue')
          },
          {
            name: 'asset',
            title: this.$t('Asset'),
            icon: 'fa-inbox',
            component: () => import('@/views/pam/Account/AssetList.vue')
          },
          {
            name: 'AccountTemplateList',
            title: this.$t('AccountTemplate'),
            icon: 'fa-copy',
            component: () => import('@/views/pam/Account/AccountTemplate.vue')
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
