<template>
  <GenericDetailPage
    v-bind="config"
    v-model:active-menu="config.activeMenu"
    v-model:object="TaskDetail"
  >
    <keep-alive>
      <component
        :is="config.activeMenu"
        :object="TaskDetail"
        @reload-table="$emit('reload-table')"
        v-bind="config.activeMenu === 'AutomationAssetNode' ? config.assetNodeProps : {}"
      />
    </keep-alive>
  </GenericDetailPage>
</template>

<script>
import { GenericDetailPage, TabPage } from '@/layout/components'
import AutomationAssetNode from '@/views/accounts/components/AutomationAssetNode.vue'
import TaskExecutionList from '../AccountDiscoverExecutionList.vue'
import Detail from './Detail.vue'

export default {
  name: 'AccountDiscoverTaskDetail',
  emits: ['reload-table'],
  components: {
    GenericDetailPage,
    TabPage,
    Detail,
    TaskExecutionList,
    AutomationAssetNode
  },
  data() {
    return {
      TaskDetail: {},
      config: {
        url: '/api/v1/accounts/gather-account-automations',
        activeMenu: 'Detail',
        titlePrefix: this.$t('AccountDiscoverDetail'),
        assetNodeProps: {
          relationUrl: '/api/v1/accounts/gather-account'
        },
        actions: {
          deleteSuccessRoute: 'AccountDiscoverList',
          canUpdate: this.$hasPerm('accounts.change_gatheraccountsautomation'),
          canDelete: this.$hasPerm('accounts.delete_gatheraccountsautomation')
        },
        submenu: [
          {
            title: this.$t('Basic'),
            name: 'Detail'
          },
          {
            title: this.$t('AssetAndNode'),
            name: 'AutomationAssetNode',
            hidden: () => !this.$hasPerm('accounts.change_gatheraccountsautomation')
          }
        ],
        hasRightSide: true
      }
    }
  }
}
</script>

<style scoped></style>
