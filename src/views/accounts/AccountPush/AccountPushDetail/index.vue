<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="plan" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountPushInfo from './AccountPushInfo.vue'

export default {
  components: {
    GenericDetailPage,
    AccountPushInfo
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        titlePrefix: this.$t('AccountPushDetail'),
        activeMenu: 'AccountPushInfo',
        url: '/api/v1/accounts/push-account-automations',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountPushInfo',
            hidden: () => !this.$hasPerm('accounts.view_changesecretautomation')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
