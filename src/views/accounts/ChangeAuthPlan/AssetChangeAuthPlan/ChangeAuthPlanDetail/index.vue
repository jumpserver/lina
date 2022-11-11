<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeAuthPlanInfo from './ChangeAuthPlanInfo'
import ChangeAuthPlanAsset from './ChangeAuthPlanAsset/index'
import ChangeAuthPlanExecutionList from './ChangeAuthPlanExecution/ChangeAuthPlanExecutionList'

export default {
  components: {
    GenericDetailPage,
    ChangeAuthPlanInfo,
    ChangeAuthPlanAsset,
    ChangeAuthPlanExecutionList
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        activeMenu: 'ChangeAuthPlanInfo',
        url: '/api/v1/assets/change-secret-automations/',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeAuthPlanInfo',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetAndNode'),
            name: 'ChangeAuthPlanAsset',
            hidden: () => !this.$hasPerm('assets.change_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'ChangeAuthPlanExecutionList',
            hidden: () => !this.$hasPerm('assets.view_automationexecution')
          }
        ]
      }
    }
  }
}
</script>

<style scoped>

</style>
