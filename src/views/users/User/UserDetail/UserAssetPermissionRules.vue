<template>
  <ListTable :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import ListTable from '@/components/ListTable'
import AmountFormatter from '@/components/TableFormatters/AmountFormatter.vue'

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
          options: [
            { label: this.$t('common.Name'), value: 'name' },
            {
              label: this.$t('perms.isValid'), value: 'is_valid',
              children: [
                {
                  value: '1',
                  label: this.$t('common.Yes')
                },
                {
                  value: '0',
                  label: this.$t('common.No')
                }
              ]
            },
            { label: this.$t('common.Username'), value: 'username' },
            { label: this.$t('perms.UserGroups'), value: 'user_group' },
            { label: this.$t('perms.IP'), value: 'ip' },
            { label: this.$t('perms.hostName'), value: 'hostname' },
            { label: this.$t('perms.Node'), value: 'node' },
            { label: this.$t('perms.SystemUser'), value: 'system_user' },
            {
              label: this.$t('perms.Inherit'), value: 'all',
              children: [
                {
                  value: '1',
                  label: this.$t('perms.Include')
                },
                {
                  value: '0',
                  label: this.$t('perms.Exclude')
                }
              ]
            }
          ]
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
