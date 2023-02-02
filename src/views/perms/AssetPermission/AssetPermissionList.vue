<template>
  <Page v-bind="$attrs">
    <AssetTreeTable
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <PermBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
    />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import AssetTreeTable from '@/components/AssetTreeTable'
import PermBulkUpdateDialog from './components/PermBulkUpdateDialog'
import AmountFormatter from '@/components/TableFormatters/AmountFormatter'
import { mapGetters } from 'vuex'

export default {
  components: {
    Page,
    AssetTreeTable,
    PermBulkUpdateDialog
  },
  data() {
    return {
      treeSetting: {
        showMenu: false,
        showAssets: true,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
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
              routeQuery: {
                activeTab: 'AssetPermissionDetail'
              }
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
        hasBulkDelete: true,
        createRoute() {
          return {
            name: 'AssetPermissionCreate',
            query: this.$route.query
          }
        },
        handleImportClick: ({ selectedRows }) => {
          this.$eventBus.$emit('showImportDialog', {
            selectedRows,
            url: '/api/v1/perms/asset-permissions/'
          })
        },
        createInNewPage: true,
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
            {
              label: this.$t('perms.fromTicket'), value: 'from_ticket',
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
            {
              label: this.$t('perms.isEffective'), value: 'is_effective',
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
        },
        hasBulkUpdate: true,
        handleBulkUpdate: ({ selectedRows }) => {
          this.updateSelectedDialogSetting.selectedRows = selectedRows
          this.updateSelectedDialogSetting.visible = true
        }
      },
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  methods: {}
}
</script>

<style>

</style>
