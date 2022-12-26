<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeSecretAutomationInfo from './ChangeSecretAutomationInfo'
import ChangeSecretAutomationAsset from './ChangeSecretAutomationAsset/index'
import ChangeSecretAutomationExecutionList from './ChangeSecretAutomationExecution/ChangeSecretAutomationExecutionList'

export default {
  components: {
    GenericDetailPage,
    ChangeSecretAutomationInfo,
    ChangeSecretAutomationAsset,
    ChangeSecretAutomationExecutionList
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        activeMenu: 'ChangeSecretAutomationInfo',
        url: '/api/v1/assets/change-secret-automations',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeSecretAutomationInfo',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetAndNode'),
            name: 'ChangeSecretAutomationAsset',
            hidden: () => !this.$hasPerm('assets.change_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'ChangeSecretAutomationExecutionList',
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
