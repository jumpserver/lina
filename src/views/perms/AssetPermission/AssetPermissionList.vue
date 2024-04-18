<template>
  <Page :help-message="helpMsg" v-bind="$attrs">
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
    />
    <PermBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
      @update="handlePermBulkUpdate"
    />
  </Page>
</template>

<script>
import Page from '@/layout/components/Page'
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import PermBulkUpdateDialog from './components/PermBulkUpdateDialog'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter'
import { mapGetters } from 'vuex'
import { AccountLabelMapper, AssetPermissionListPageSearchConfigOptions } from '../const'
import { SwitchFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    Page,
    AssetTreeTable,
    PermBulkUpdateDialog
  },
  data() {
    const vm = this
    return {
      helpMsg: this.$t('perms.AssetPermissionHelpMsg'),
      treeSetting: {
        showMenu: false,
        showAssets: true,
        notShowBuiltinTree: true,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        hasTree: true,
        columnsExtra: ['action'],
        columns: [
          'name', 'users_amount', 'user_groups_amount', 'assets_amount', 'nodes_amount',
          'accounts', 'is_valid', 'is_expired', 'from_ticket', 'is_active', 'actions'
        ],
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
              routeQuery: {
                activeTab: 'AssetPermissionDetail'
              }
            }
          },
          is_active: {
            width: '100px',
            formatter: SwitchFormatter,
            formatterArgs: {
              getPatchUrl(row) {
                return `/api/v1/perms/asset-permissions/${row.id}/`
              },
              getPatchData(row) {
                return {
                  is_active: !row.is_active
                }
              }
            }
          },
          action: {
            label: this.$t('common.Action'),
            formatter: function(row) {
              if (row.actions.length === 6) {
                return vm.$t('common.All')
              }
              return row.actions.map(item => {
                return item.label.replace(/ \([^)]*\)/, '')
              }).join(',')
            }
          },
          is_expired: {
            formatterArgs: {
              showFalse: false
            }
          },
          from_ticket: {
            label: this.$t('perms.fromTicket'),
            formatterArgs: {
              showFalse: false
            }
          },
          users_amount: {
            label: this.$t('perms.User'),
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups'),
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          assets_amount: {
            label: this.$t('perms.Asset'),
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          nodes_amount: {
            label: this.$t('perms.Node'),
            formatter: AmountFormatter,
            formatterArgs: {
              async: true,
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          accounts: {
            label: this.$t('perms.Account'),
            formatter: AmountFormatter,
            formatterArgs: {
              getItem(item) {
                if (item !== '@SPEC') {
                  return AccountLabelMapper[item] || item
                }
              },
              cellValueToRemove: ['@SPEC'],
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
        hasLabelSearch: true,
        hasBulkDelete: true,
        onCreate: () => {
          const route = {
            name: 'AssetPermissionCreate',
            query: this.$route.query
          }
          if (vm.$route.query.node_id) {
            const { href } = this.$router.resolve(route)
            window.open(href, '_blank')
          } else {
            this.$router.push(route)
          }
        },
        handleImportClick: ({ selectedRows }) => {
          this.$eventBus.$emit('showImportDialog', {
            selectedRows,
            url: '/api/v1/perms/asset-permissions/'
          })
        },
        searchConfig: {
          url: '',
          options: AssetPermissionListPageSearchConfigOptions
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
  methods: {
    handlePermBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.$refs.AssetTreeTable.$refs.TreeList.$refs?.ListTable?.reloadTable()
    }
  }
}
</script>

<style>

</style>
