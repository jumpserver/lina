<template>
  <div>
    <RemoveAccount
      v-if="showDeleteAccountDialog"
      v-model:visible="showDeleteAccountDialog"
      :accounts="gatherAccounts"
    />
    <DeleteDialog
      v-if="deleteDialog.visible"
      v-model:visible="deleteDialog.visible"
      :account="deleteDialog.account"
      :closeable="false"
      @deleted="afterDeleteGatheredAccount"
    />
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :quick-filters="quickFilters"
      :quick-summary="quickSummary"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <AccountDiscoverDialog v-model:visible="discoveryDialog.visible" :asset="discoveryDialog.asset" />
  </div>
</template>

<script>
import { AssetTreeTable } from '@/components'
import DeleteDialog from '@/views/accounts/AccountDiscover/DeleteDialog.vue'
import { gatherAccountHeaderActions, gatherAccountTableConfig } from '@/views/accounts/const'
import AccountDiscoverDialog from '@/views/assets/Asset/AssetList/components/AccountDiscoverDialog.vue'
import RemoveAccount from '@/components/Apps/AccountListTable/RemoveAccount.vue'

export default {
  components: {
    AssetTreeTable,
    DeleteDialog,
    AccountDiscoverDialog,
    RemoveAccount
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
            name: this.$t('DiscoverAccounts'),
            callback: (node) => {
              this.discoveryDialog.asset = node.id
              this.discoveryDialog.visible = true
            }
          }
        ]
      },
      quickSummary: [
        {
          title: this.$t('DateLastWeek'),
          hasCount: true,
          filter: {
            'days': '7'
          }
        },
        {
          title: this.$t('DateLastMonth'),
          filter: {
            'days': '30'
          }
        },
        {
          title: this.$t('Pending'),
          filter: {
            status: '0'
          }
        }
      ],
      quickFilters: [],
      tableConfig: gatherAccountTableConfig(this),
      headerActions: gatherAccountHeaderActions(this)
    }
  },
  mounted() {
  },
  methods: {
    afterDeleteGatheredAccount() {
      this.$refs.AssetTreeTable.reloadTable()
    }
  }
}
</script>
