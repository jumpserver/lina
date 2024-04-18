<template>
  <el-row :gutter="10">
    <el-col :span="18">
      <ListTable :header-actions="headerActions" :table-config="tableConfig" />
    </el-col>
  </el-row>
</template>

<script>
import ListTable from '@/components/Table/ListTable'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import { UserAssetPermissionListPageSearchConfigOptions } from '@/views/perms/const'

export default {
  name: 'UserAssetPermission',
  components: {
    ListTable
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      tableConfig: {
        url: `/api/v1/perms/asset-permissions/?user_id=${this.object.id}`,
        hasSelection: false,
        hasTree: true,
        columnsExclude: ['actions'],
        columnsExtra: ['action'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'users_amount', 'user_groups_amount', 'assets_amount',
            'nodes_amount', 'accounts', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'AssetPermissionDetail'
            }
          },
          action: {
            label: this.$t('common.Action'),
            formatter: function(row) {
              return row.actions.map(item => {
                return item.label
              }).join(', ')
            }
          },
          is_expired: {
            formatterArgs: {
              showFalse: false
            }
          },
          from_ticket: {
            label: this.$t('perms.fromTicket'),
            width: 100,
            formatterArgs: {
              showFalse: false
            }
          },
          users: {
            label: this.$t('perms.User'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AssetPermissionDetail',
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          user_groups: {
            label: this.$t('perms.UserGroups'),
            width: '100px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AssetPermissionDetail',
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          assets: {
            label: this.$t('perms.Asset'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AssetPermissionDetail',
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          nodes: {
            label: this.$t('perms.Node'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AssetPermissionDetail',
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          accounts: {
            label: this.$t('perms.Account'),
            width: '60px',
            formatter: AmountFormatter,
            formatterArgs: {
              route: 'AssetPermissionDetail',
              getItem(item) {
                return item
              },
              routeQuery: {
                activeTab: 'AssetPermissionAccount'
              }
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AssetPermissionUpdate',
              hasDelete: false,
              hasClone: false,
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/perms/asset-permissions/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        }
      },
      headerActions: {
        hasLeftActions: false,
        hasExport: false,
        hasImport: false,
        searchConfig: {
          url: '',
          options: UserAssetPermissionListPageSearchConfigOptions
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
