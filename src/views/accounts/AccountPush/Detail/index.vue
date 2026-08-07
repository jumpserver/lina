<template>
  <GenericDetailPage v-bind="config" v-model:active-menu="config.activeMenu" v-model:object="plan">
    <keep-alive>
      <component
        :is="config.activeMenu"
        :object="plan"
        @reload-table="$emit('reload-table')"
        v-bind="config.activeMenu === 'AutomationAssetNode' ? config.assetNodeProps : {}"
      />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage } from '@/layout/components'
import AutomationAssetNode from '@/views/accounts/components/AutomationAssetNode.vue'
import AccountPushInfo from './AccountPushInfo.vue'

export default {
  emits: ['reload-table'],
  components: {
    GenericDetailPage,
    AccountPushInfo,
    AutomationAssetNode
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        titlePrefix: this.$t('AccountPushDetail'),
        activeMenu: 'AccountPushInfo',
        url: '/api/v1/accounts/push-account-automations',
        assetNodeProps: {
          relationUrl: '/api/v1/accounts/push-account'
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountPushInfo',
            hidden: () => !this.$hasPerm('accounts.view_pushaccountautomation')
          },
          {
            title: this.$t('AssetAndNode'),
            name: 'AutomationAssetNode',
            hidden: () => !this.$hasPerm('accounts.change_pushaccountautomation')
          }
        ]
      }
    }
  }
}
</script>

<style scoped></style>
