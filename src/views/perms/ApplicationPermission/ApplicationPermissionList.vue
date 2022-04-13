<template>
  <div>
    <GenericTreeListPage
      ref="TreeTablePage"
      :tree-setting="treeSetting"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <PermBulkUpdateDialog
      :visible.sync="updateSelectedDialogSetting.visible"
      v-bind="updateSelectedDialogSetting"
      :perm-type="permType"
    />
  </div>
</template>

<script>
import GenericTreeListPage from '@/layout/components/GenericTreeListPage'
import { setUrlParam } from '@/utils/common'
import { DetailFormatter } from '@/components/TableFormatters'
import { ApplicationTypes } from '@/views/applications/const'
import PermBulkUpdateDialog from '@/views/perms/components/PermBulkUpdateDialog'
import { mapGetters } from 'vuex'

export default {
  name: 'AssetAccountList',
  components: {
    GenericTreeListPage,
    PermBulkUpdateDialog
  },
  data() {
    const vm = this
    return {
      permType: 'applications',
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      treeSetting: {
        async: false,
        showMenu: false,
        showRefresh: true,
        showAssets: false,
        treeUrl: '/api/v1/applications/applications/tree/',
        callback: {
          onSelected: function(event, treeNode) {
            let url = '/api/v1/perms/application-permissions/'
            const nodeId = treeNode.id
            const value = treeNode.meta.data?.value
            if (treeNode.meta.type === 'category') {
              url = setUrlParam(url, 'category', value)
              url = setUrlParam(url, 'type', '')
            } else if (treeNode.meta.type === 'type') {
              url = setUrlParam(url, 'category', '')
              url = setUrlParam(url, 'type', value)
            } else if (treeNode.meta.type === 'application') {
              url = setUrlParam(url, 'category', '')
              url = setUrlParam(url, 'type', '')
              url = setUrlParam(url, 'app', nodeId)
            }
            setTimeout(() => {
              vm.tableConfig.url = url
            }, 100)
          }
        }
      },
      tableConfig: {
        url: '/api/v1/perms/application-permissions/',
        columns: [
          'name', 'type_display', 'category_display',
          'users_amount', 'user_groups_amount',
          'applications_amount', 'system_users_amount',
          'date_expired', 'is_valid', 'from_ticket',
          'created_by', 'date_created', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'category_display', 'users_amount', 'user_groups_amount',
            'applications_amount', 'system_users_amount',
            'is_valid', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              routeQuery: {
                activeTab: 'RemoteAppPermissionDetail'
              }
            },
            showOverflowTooltip: true
          },
          type_display: {
            width: '135px'
          },
          category_display: {
            width: '135px'
          },
          users_amount: {
            label: this.$t('users.Users'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'ApplicationPermissionUser'
              }
            }
          },
          user_groups_amount: {
            label: this.$t('users.UserGroups'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'ApplicationPermissionUser'
              }
            }
          },
          applications_amount: {
            label: this.$t('assets.Applications'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'ApplicationsPermission'
              }
            }
          },
          system_users_amount: {
            label: this.$t('assets.SystemUsers'),
            width: '110px',
            formatter: DetailFormatter,
            formatterArgs: {
              routeQuery: {
                activeTab: 'ApplicationsPermission'
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
          actions: {
            formatterArgs: {
              onUpdate: ({ row }) => {
                const route = {
                  name: 'ApplicationPermissionUpdate',
                  params: { id: row.id },
                  query: { type: row.type, category: row.category }
                }
                this.$router.push(route)
              },
              onClone: ({ row }) => {
                const route = {
                  name: 'ApplicationPermissionCreate',
                  query: { type: row.type, category: row.category, clone_from: row.id }
                }
                this.$router.push(route)
              }
            }
          }
        }
      },
      headerActions: {
        hasCreate: false,
        createInNewPage: true,
        moreActionsType: 'primary',
        moreCreates: {
          callback: (option) => {
            vm.$router.push({ name: 'ApplicationPermissionCreate', query: {
              category: option.category.toLowerCase(),
              type: option.name.toLowerCase()
            }})
          },
          dropdown: ApplicationTypes
        },
        extraMoreActions: [
          {
            name: 'actionUpdateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => {
              return selectedRows.length > 0 &&
                !vm.currentOrgIsRoot &&
                vm.$hasPerm('perms.change_applicationpermission')
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
  }
}
</script>
