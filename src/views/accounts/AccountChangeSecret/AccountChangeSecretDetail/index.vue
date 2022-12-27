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
        url: '/api/v1/assets/change-secret-automations',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'AccountChangeSecretInfo',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetAndNode'),
            name: 'AccountChangeSecretAsset',
            hidden: () => !this.$hasPerm('assets.change_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'AccountChangeSecretExecutionList',
            hidden: () => !this.$hasPerm('assets.view_changesecretexecution')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
