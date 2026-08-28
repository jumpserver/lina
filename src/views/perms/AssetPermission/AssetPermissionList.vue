<template>
  <Page v-bind="$attrs" :help-tip="helpMsg">
    <AssetTreeTable
      ref="AssetTreeTable"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      :quick-filters="quickFilter"
      :create-drawer="createDrawer"
      @detail-delete-success="reloadVisiblePermissionMetrics"
      @resource-change="reloadVisiblePermissionMetrics"
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
import { setUrlParam } from '@/utils/common/index'
import { createSourceIdCache } from '@/api/common'
import { AssetPermissionTableMeta } from '../const.js'
import PermBulkUpdateDialog from './components/PermBulkUpdateDialog'
import { createAssetPermissionTreeDataSource } from './components/nodeAssetTreeDataSource'

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
        treeComponent: 'NodeAssetTree',
        showMenu: false,
        showAssets: true,
        showCollapse: true,
        showMetrics: true,
        showPermissionScope: true,
        showRefresh: true,
        showSearch: true,
        defaultMetricMode: 'asset_all',
        defaultPermissionScope: 'effective',
        defaultSearchTarget: 'node',
        settingsCacheKey: 'asset-permission',
        searchLimit: 1000,
        dataSource: createAssetPermissionTreeDataSource(this.$axios),
        notShowBuiltinTree: true,
        // 选中节点只过滤表格，不把选择同步到路由。否则路由变化会触发整棵树重新初始化、闪烁。
        // 与资产列表(AllList)、账号发现、风险列表等页面保持一致。
        selectSyncToRoute: false,
        url: '/api/v1/perms/asset-permissions/',
        nodeUrl: '/api/v1/perms/asset-permissions/',
        treeUrl: '/api/v1/assets/nodes/children/tree/?assets=1&asset_amount=0',
        readOnly: true,
        callback: {
          onSelected: (event, treeNode, context) => {
            this.handlePermissionTreeSelected(treeNode, context)
          }
        },
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
              performDelete: ({ row }) => {
                const id = row.id
                const url = `/api/v1/perms/asset-permissions/${id}/`
                return this.$axios.delete(url).then((response) => {
                  this.reloadVisiblePermissionMetrics()
                  return response
                })
              }
            }
          }
        }
      },
      headerActions: {
        hasLabelSearch: true,
        hasBulkDelete: true,
        hasBulkUpdate: true,
        performBulkDelete: async (selectedRows) => {
          const ids = selectedRows.map((row) => row.id)
          const { spm } = await createSourceIdCache(ids)
          const url = setUrlParam('/api/v1/perms/asset-permissions/', 'spm', spm)
          const response = await this.$axios.delete(url)
          this.reloadVisiblePermissionMetrics()
          return response
        },
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
    handlePermissionTreeSelected(treeNode, context = {}) {
      const type = treeNode?.meta?.type
      const resourceId = treeNode?.meta?.data?.id
      if (!resourceId || !['node', 'asset'].includes(type)) {
        return
      }

      let url = this.treeSetting.url
      url = setUrlParam(url, 'node_id', type === 'node' ? resourceId : '')
      url = setUrlParam(url, 'asset_id', type === 'asset' ? resourceId : '')
      url = setUrlParam(url, 'all', context.permissionScope === 'direct' ? '0' : '1')
      this.$refs.AssetTreeTable?.updateTableUrl?.(url)
    },
    reloadAssetTreeTable() {
      this.$refs.AssetTreeTable?.reloadTable?.()
      this.reloadVisiblePermissionMetrics()
    },
    reloadVisiblePermissionMetrics() {
      const snapshot = this.$refs.AssetTreeTable?.getTreeSnapshot?.()
      const effectiveMetricMode = snapshot?.effectiveMetricMode || snapshot?.metricMode
      const permissionMetricModes = ['permission_direct', 'permission_effective']
      // Permission CRUD cannot change asset-relation counts. Avoid bypassing
      // that metric's cache unless a permission count is actually visible.
      if (permissionMetricModes.includes(effectiveMetricMode)) {
        this.$refs.AssetTreeTable?.reloadVisibleTreeMetrics?.()
        return
      }
      if (
        effectiveMetricMode === 'search_assets' &&
        permissionMetricModes.includes(snapshot?.metricMode)
      ) {
        this.$refs.AssetTreeTable?.invalidateNormalMetrics?.()
      }
    },
    handlePermBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.reloadAssetTreeTable()
    }
  }
}
</script>
