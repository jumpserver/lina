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
import AccountCheckDetail from './Detail.vue'

export default {
  emits: ['reload-table'],
  components: {
    GenericDetailPage,
    AccountCheckDetail,
    AutomationAssetNode
  },
  data() {
    return {
      plan: { name: '', username: '', comment: '' },
      config: {
        titlePrefix: this.$t('AccountCheckDetail'),
        url: '/api/v1/accounts/check-account-automations',
        assetNodeProps: {
          relationUrl: '/api/v1/accounts/check-account'
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'AccountCheckDetail',
            hidden: () => !this.$hasPerm('accounts.view_checkaccountautomation')
          },
          {
            title: this.$t('AssetAndNode'),
            name: 'AutomationAssetNode',
            hidden: () => !this.$hasPerm('accounts.change_checkaccountautomation')
          }
        ]
      }
    }
  }
}
</script>

<style scoped></style>
