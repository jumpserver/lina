<template>
  <GenericDetailPage :active-menu.sync="config.activeMenu" :object.sync="plan" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AccountChangeSecretInfo from './AccountChangeSecretInfo.vue'
import AccountChangeSecretAsset from './AccountChangeSecretAsset/index.vue'
import AccountChangeSecretExecutionList
  from '@/views/accounts/AccountChangeSecret/Executions/AccountChangeSecretExecutionList.vue'

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
        titlePrefix: this.$t('AccountChangeSecretDetail'),
        activeMenu: 'AccountChangeSecretInfo',
        url: '/api/v1/accounts/change-secret-automations',
        actions: {
          canDelete: this.$hasPerm('accounts.delete_changesecretautomation'),
          canUpdate: this.$hasPerm('accounts.change_changesecretautomation')
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountChangeSecretInfo',
            hidden: () => !this.$hasPerm('accounts.view_changesecretautomation')
          },
          {
            title: this.$t('AssetAndNode'),
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
