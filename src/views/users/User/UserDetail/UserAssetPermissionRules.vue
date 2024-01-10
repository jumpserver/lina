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
            'name', 'users', 'user_groups', 'assets',
            'nodes', 'accounts', 'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'AssetPermissionDetail'
            }
          },
          action: {
            label: this.$t('Action'),
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
            label: this.$t('FromTicket'),
            width: 100,
            formatterArgs: {
              showFalse: false
            }
          },
          users: {
            label: this.$t('User'),
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
            label: this.$t('UserGroups'),
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
            label: this.$t('Asset'),
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
            label: this.$t('Node'),
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
            label: this.$t('Account'),
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
