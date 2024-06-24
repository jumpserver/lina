<template>
  <div>
    <RemoveAccount
      v-if="showDeleteAccountDialog"
      :accounts="gatherAccounts"
      :visible.sync="showDeleteAccountDialog"
    />
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
  </div>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import { toSafeLocalDateStr } from '@/utils/time'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import RemoveAccount from '@/components/Apps/AccountListTable/RemoveAccount.vue'

export default {
  components: {
    AssetTreeTable,
    RemoveAccount
  },
  data() {
    const vm = this
    return {
      showDeleteAccountDialog: false,
      gatherAccounts: {},
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showSearch: true,
        showAssets: true,
        notShowBuiltinTree: true,
        url: '/api/v1/accounts/gathered-accounts/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/accounts/gathered-accounts/',
        hasTree: true,
        columns: [
          'asset', 'username', 'date_last_login', 'present',
          'address_last_login', 'date_updated'
        ],
        columnsShow: {
          default: [
            'asset', 'username', 'date_last_login', 'present',
            'address_last_login'
          ]
        },
        columnsMeta: {
          asset: {
            formatter: function(row) {
              const to = {
                name: 'AssetDetail',
                params: { id: row.asset.id }
              }
              if (vm.$hasPerm('assets.view_asset')) {
                return <router-link to={to}>{row.asset.name}</router-link>
              } else {
                return <span>{row.asset.name}</span>
              }
            }
          },
          username: {
            showOverflowTooltip: true
          },
          present: {
            width: '100px'
          },
          date_updated: {
            formatter: function(row, col, cell) {
              return toSafeLocalDateStr(row.date_updated)
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              hasUpdate: false, // can set function(row, value)
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'Sync',
                  title: this.$t('Sync'),
                  can: this.$hasPerm('accounts.add_gatheredaccount') && !this.$store.getters.currentOrgIsRoot,
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.post(
                      `/api/v1/accounts/gathered-accounts/sync-accounts/`,
                      { gathered_account_ids: [row.id] }
                    ).then(res => {
                      this.$message.success(this.$tc('SyncSuccessMsg'))
                    }).catch(() => {
                    })
                  }
                },
                {
                  name: 'SyncDelete',
                  title: this.$t('SyncDelete'),
                  can: this.$hasPerm('accounts.remove_account') && !this.$store.getters.currentOrgIsRoot,
                  type: 'danger',
                  callback: ({ row }) => {
                    vm.gatherAccounts = [row]
                    vm.showDeleteAccountDialog = false
                    setTimeout(() => {
                      vm.showDeleteAccountDialog = true
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasImport: false,
        hasExport: true,
        searchConfig: {
          exclude: ['asset'],
          options: [
            {
              label: this.$t('AssetName'),
              value: 'asset_name'
            }
          ]
        },
        extraMoreActions: [
          {
            name: 'SyncSelected',
            title: this.$t('SyncSelected'),
            type: 'primary',
            icon: 'fa fa-exchange',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('accounts.add_gatheredaccount')
            },
            callback: function({ selectedRows }) {
              const ids = selectedRows.map(v => {
                return v.id
              })
              this.$axios.post(
                `/api/v1/accounts/gathered-accounts/sync-accounts/`,
                { gathered_account_ids: ids }
              ).then(() => {
                this.$message.success(this.$tc('SyncSuccessMsg'))
              }).catch(err => {
                this.$message.error(this.$tc('SyncErrorMsg' + ' ' + err))
              })
            }.bind(this)
          },
          {
            name: 'SyncDeleteSelected',
            title: this.$t('SyncDeleteSelected'),
            type: 'primary',
            icon: 'fa fa-exchange',
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 && vm.$hasPerm('accounts.remove_account')
            },
            callback: function({ selectedRows }) {
              vm.gatherAccounts = selectedRows
              vm.showDeleteAccountDialog = false
              setTimeout(() => {
                vm.showDeleteAccountDialog = true
              })
            }
          }
        ]
      }
    }
  }
}
</script>

<style>

</style>
