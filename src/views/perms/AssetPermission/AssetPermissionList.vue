<template>
  <Page v-bind="$attrs" :help-tip="helpMsg">
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      :quick-filters="quickFilter"
      :create-drawer="createDrawer"
    />
    <PermBulkUpdateDialog
      v-bind="updateSelectedDialogSetting"
      v-model:visible="updateSelectedDialogSetting.visible"
      @update="handlePermBulkUpdate"
    />
  </Page>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import Page from '@/layout/components/Page'
import { mapGetters } from 'vuex'
import { AssetPermissionTableMeta } from '../const.js'
import PermBulkUpdateDialog from './components/PermBulkUpdateDialog'

export default {
  components: {
    Page,
    AssetTreeTable,
    PermBulkUpdateDialog
  },
  data() {
    return {
      createDrawer: () => import('./AssetPermissionCreateUpdate.vue'),
      helpMsg: this.$t('AssetPermissionHelpMsg'),
      quickFilter: [
        {
          label: this.$t('QuickFilter'),
          options: [
            {
              label: this.$t('Invalid'),
              filter: {
                is_valid: false
              }
            },
            {
              label: this.$t('Valid'),
              filter: {
                is_valid: true
              }
            },
            {
              label: this.$t('Expired'),
              filter: {
                is_expired: true
              }
            },
            {
              label: this.$t('Disabled'),
              filter: {
                is_active: false
              }
            },
            {
              label: this.$t('NoResource'),
              filter: {
                is_no_resource: true
              }
            }
          ]
        }
      ],
      treeSetting: {
        showMenu: false,
        showAssets: true,
        notShowBuiltinTree: true,
        // 选中节点只过滤表格，不把选择同步到路由。否则路由变化会触发整棵树重新初始化、闪烁。
        // 与资产列表(AllList)、账号发现、风险列表等页面保持一致。
        selectSyncToRoute: false,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1&asset_amount=0',
        edit: {
          drag: {
            isMove: false
          }
        }
      },
      tableConfig: {
        url: '/api/v1/perms/asset-permissions/',
        hasTree: true,
        columnsExtra: ['action'],
        columns: [
          'id',
          'name',
          'users_amount',
          'user_groups_amount',
          'assets_amount',
          'nodes_amount',
          'accounts',
          'labels',
          'is_valid',
          'is_expired',
          'from_ticket',
          'is_active',
          'actions',
          'date_created',
          'date_start',
          'date_expired',
          'created_by'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name',
            'users_amount',
            'user_groups_amount',
            'assets_amount',
            'nodes_amount',
            'accounts',
            'is_valid',
            'actions'
          ]
        },
        columnsMeta: {
          ...AssetPermissionTableMeta,
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
        hasBulkUpdate: true,
        handleBulkUpdate: ({ selectedRows }) => {
          this.updateSelectedDialogSetting.selectedRows = selectedRows
          this.updateSelectedDialogSetting.visible = true
        }
      },
      updateSelectedDialogSetting: {
        visible: false,
        selectedRows: []
      },
      activatedReloadTimer: null,
      hasBeenDeactivated: false
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  activated() {
    // activated is also called after the first mount. The table has just loaded
    // at that point, so scheduling another reload only duplicates the initial GET.
    if (!this.hasBeenDeactivated) {
      return
    }
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = setTimeout(() => {
      this.reloadAssetTreeTable()
    }, 500)
  },
  deactivated() {
    this.hasBeenDeactivated = true
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  },
  beforeUnmount() {
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  },
  methods: {
    reloadAssetTreeTable() {
      this.$refs.AssetTreeTable?.reloadTable?.()
    },
    handlePermBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.reloadAssetTreeTable()
    }
  }
}
</script>
