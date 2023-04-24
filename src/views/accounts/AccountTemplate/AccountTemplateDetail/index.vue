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
import AccountTemplateChangeSecret from './AccountTemplateChangeSecret/index'

export default {
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    AccountTemplateChangeSecret
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
            name: 'AccountTemplateChangeSecret',
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
