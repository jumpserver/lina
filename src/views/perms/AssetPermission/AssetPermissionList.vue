<template>
  <div>
    <GenericTreeListPage :table-config="tableConfig" :header-actions="headerActions" :tree-setting="treeSetting" />
    <PermBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { DetailFormatter } from '@/components/TableFormatters'
import PermBulkUpdateDialog from '@/views/perms/components/PermBulkUpdateDialog'
import { mapGetters } from 'vuex'

export default {
  components: {
    GenericTreeListPage,
    PermBulkUpdateDialog
  },
  data() {
    const vm = this
    return {
      treeSetting: {
        showMenu: false,
        showRefresh: true,
        showAssets: true,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1'
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        hasTree: true,
        columns: [
          'name',
          'users_amount', 'user_groups_amount', 'assets_amount', 'nodes_amount', 'system_users_amount',
          'date_expired', 'is_valid', 'is_expired', 'is_active', 'from_ticket',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'users_amount', 'user_groups_amount', 'assets_amount', 'nodes_amount', 'system_users_amount',
            'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionDetail'
              }
            },
            showOverflowTooltip: true
          },
          users_amount: {
            label: this.$t('perms.User'),
            width: '60px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          from_ticket: {
            label: this.$t('perms.fromTicket'),
            width: 100,
            formatterArgs: {
              showFalse: false
            }
          },
          user_groups_amount: {
            label: this.$t('perms.UserGroups'),
            width: '100px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionUser'
              }
            }
          },
          assets_amount: {
            label: this.$t('perms.Asset'),
            width: '60px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          nodes_amount: {
            label: this.$t('perms.Node'),
            width: '60px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
              }
            }
          },
          system_users_amount: {
            label: this.$t('perms.SystemUser'),
            width: '100px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'AssetPermissionAsset'
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
        hasBulkUpdate: false,
        extraMoreActions: [
          {
            name: 'actionUpdateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !vm.currentOrgIsRoot &&
                vm.$hasPerm('perms.change_assetpermission')
            },
            callback: ({ selectedRows }) => {
              vm.updateSelectedDialogSetting.selectedRows = selectedRows
              vm.updateSelectedDialogSetting.visible = true
            }
          }
        ]
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
  }
}
</script>

<style>

</style>
