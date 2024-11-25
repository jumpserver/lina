<template>
  <div>
    <DeleteDialog
      v-if="deleteDialog.visible"
      :account="deleteDialog.account"
      :visible.sync="deleteDialog.visible"
    />
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :quick-filters="quickFilters"
      :quick-summary="quickSummary"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <AccountDiscoverDialog :asset="discoveryDialog.asset" :visible.sync="discoveryDialog.visible" />
  </div>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable/index.vue'
import DeleteDialog from '@/views/accounts/AccountDiscover/DeleteDialog.vue'
import { gatherAccountHeaderActions, gatherAccountTableConfig } from '@/views/accounts/const'
import AccountDiscoverDialog from '@/views/assets/Asset/AssetList/components/AccountDiscoverDialog.vue'

export default {
  components: {
    AssetTreeTable,
    DeleteDialog,
    AccountDiscoverDialog
  },
  data() {
    return {
      showDeleteAccountDialog: false,
      deleteDialog: {
        visible: false,
        account: {}
      },
      discoveryDialog: {
        asset: '',
        visible: false
      },
      gatherAccounts: [],
      treeSetting: {
        showDefaultMenu: false,
        showMenu: (node) => {
          return node.meta.type === 'asset'
        },
        showRefresh: true,
        showSearch: true,
        showAssets: true,
        notShowBuiltinTree: true,
        url: '/api/v1/accounts/gathered-accounts/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1&asset_amount=0',
        menu: [
          {
            id: 'discover',
            icon: 'discovery',
            name: '发现账号',
            callback: (node) => {
              console.log('Discovery it: ', node)
              this.discoveryDialog.asset = node.id
              this.discoveryDialog.visible = true
              // this.discoveryDialog.asset = node.data
            }
          }
        ]
      },
      quickSummary: [
        {
          title: '最近一周发现',
          count: 10,
          filter: {
            name: 'admin'
          }
        },
        {
          title: '最近一月发现',
          count: 321,
          filter: {
            username: 'admin'
          }
        },
        {
          title: '待确认',
          count: 544,
          filter: {
            username: 'admin'
          }
        }
      ],
      quickFilters: [
        {
          label: '快速过滤',
          options: [
            {
              label: '未同步到资产',
              value: ''
            },
            {
              label: this.$t('最近一个月'),
              value: ''
            }
          ]
        },
        {
          label: this.$t('最近发现'),
          options: [
            {
              label: '最近一天 (20)',
              value: ''
            },
            {
              label: '最近一周 (300)',
              value: ''
            },
            {
              label: '最近一个月 (600)',
              value: ''
            }
          ]
        }
      ],
      tableConfig: gatherAccountTableConfig(this),
      headerActions: gatherAccountHeaderActions(this)
    }
  },
  activated() {
    setTimeout(() => {
      this.$refs.AssetTreeTable.$refs.TreeList.reloadTable()
    }, 300)
  },
  mounted() {
  }
}
</script>
<style lang='scss' scoped>

</style>
