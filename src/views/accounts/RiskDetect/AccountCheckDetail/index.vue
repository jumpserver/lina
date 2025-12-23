<template>
  <GenericDetailPage v-model:active-menu="config.activeMenu" v-model:object="plan" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountCheckDetail from './Detail.vue'

export default {
  components: {
    GenericDetailPage,
    AccountCheckDetail
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        titlePrefix: this.$t('AccountCheckDetail'),
        url: '/api/v1/accounts/check-account-automations',
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountCheckDetail',
            hidden: () => !this.$hasPerm('accounts.view_checkaccountautomation')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
