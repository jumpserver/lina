<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountChangeSecretInfo from './AccountChangeSecretInfo'
import AccountChangeSecretAsset from './AccountChangeSecretAsset/index'
import AccountChangeSecretExecutionList from './AccountChangeSecretExecution/AccountChangeSecretExecutionList'

export default {
  components: {
    GenericDetailPage,
    AccountChangeSecretInfo,
    AccountChangeSecretAsset,
    AccountChangeSecretExecutionList
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        activeMenu: 'AccountChangeSecretInfo',
        url: '/api/v1/accounts/change-secret-automations',
        actions: {
          canDelete: this.$hasPerm('accounts.delete_changesecretautomation'),
          canUpdate: this.$hasPerm('accounts.change_changesecretautomation')
        },
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AccountChangeSecretInfo',
            hidden: () => !this.$hasPerm('accounts.view_changesecretautomation')
          },
          {
            title: this.$t('accounts.AccountChangeSecret.AssetAndNode'),
            name: 'AccountChangeSecretAsset',
            hidden: () => !this.$hasPerm('accounts.change_changesecretautomation')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
