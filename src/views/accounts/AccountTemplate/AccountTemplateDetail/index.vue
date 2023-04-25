<template>
  <GenericDetailPage
    :object.sync="object"
    :active-menu.sync="config.activeMenu"
    v-bind="config"
    v-on="$listeners"
  >
    <keep-alive>
      <component :is="config.activeMenu" :object="object" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import Detail from './Detail.vue'
import Account from './Account'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    Account
  },
  data() {
    return {
      object: {},
      config: {
        url: '/api/v1/accounts/account-templates',
        activeMenu: 'Detail',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'Detail'
          },
          {
            title: this.$t('assets.Accounts'),
            name: 'Account',
            hidden: () => !this.$hasPerm('accounts.change_accounttemplate')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
