<template>
  <GenericDetailPage :object.sync="plan" :active-menu.sync="config.activeMenu" v-bind="config">
    <keep-alive>
      <component :is="config.activeMenu" :object="plan" />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import ChangeSecreAtutomationInfo from './ChangeSecreAtutomationInfo'
import ChangeSecreAtutomationAsset from './ChangeSecreAtutomationAsset/index'
import ChangeSecreAtutomationExecutionList from './ChangeSecreAtutomationExecution/ChangeSecreAtutomationExecutionList'

export default {
  components: {
    GenericDetailPage,
    ChangeSecreAtutomationInfo,
    ChangeSecreAtutomationAsset,
    ChangeSecreAtutomationExecutionList
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        activeMenu: 'ChangeSecreAtutomationInfo',
        url: '/api/v1/assets/change-secret-automations',
        submenu: [
          {
            title: this.$t('common.BasicInfo'),
            name: 'ChangeSecreAtutomationInfo',
            hidden: () => !this.$hasPerm('assets.view_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.AssetAndNode'),
            name: 'ChangeSecreAtutomationAsset',
            hidden: () => !this.$hasPerm('assets.change_changesecretautomation')
          },
          {
            title: this.$t('xpack.ChangeAuthPlan.ExecutionList'),
            name: 'ChangeSecreAtutomationExecutionList',
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
