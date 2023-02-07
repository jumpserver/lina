<template>
  <TreeTable :table-config="tableConfig" :tree-setting="treeSetting" :header-actions="headerActions" />
</template>

<script>
import TreeTable from '@/components/TreeTable'
import { toSafeLocalDateStr } from '@/utils/common'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    TreeTable
  },
  data() {
    const vm = this
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: true,
        url: '/api/v1/accounts/gathered-accounts/',
        nodeUrl: '/api/v1/assets/nodes/',
        // ?assets=0不显示资产. =1显示资产
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/accounts/gathered-accounts/',
        hasTree: true,
        columns: [
          'asset', 'username', 'date_last_login', 'present', 'address_last_login', 'date_updated'
        ],
        columnsMeta: {
          asset: {
            label: vm.$t('assets.Asset'),
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
            width: 80
          },
          address_last_login: {
            width: 120
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
              hasDelete: false, // can set function(row, value)
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.Sync'),
                  can: this.$hasPerm('accounts.add_gatheredaccount'),
                  type: 'primary',
                  callback: ({ row }) => {
                    console.log('row', row.id)
                    this.$axios.post(
                      `/api/v1/accounts/gathered-accounts/${row.id}/sync/`,
                    ).then(res => {
                      this.$message.success(this.$tc('common.updateSuccessMsg'))
                    }).catch(res => {
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasCreate: false,
        hasImport: false,
        hasExport: false,
        searchConfig: {
          exclude: ['asset'],
          options: [
          ]
        }
      }
    }
  }
}
</script>

<style>

</style>
