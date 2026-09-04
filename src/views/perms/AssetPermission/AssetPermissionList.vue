<template>
  <Page v-bind="$attrs" :help-tip="helpMsg">
    <AssetTreeTable
      ref="AssetTreeTable"
      :additional-tree-views="additionalTreeViews"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :tree-setting="treeSetting"
      :quick-filters="quickFilter"
      :create-drawer="createDrawer"
      @active-tree-ready="handlePermissionTreeReady"
      @detail-delete-success="reloadVisiblePermissionMetrics"
      @resource-change="reloadVisiblePermissionMetrics"
      @selection-clear="handlePermissionTreeSelectionClear"
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
import { createAssetPermissionUserTreeDataSource } from './components/userTreeDataSource'

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
        treeTitle: this.$t('AssetTree'),
        assetIconMode: 'platform',
        showMenu: false,
        showAssets: true,
        showCollapse: true,
        showMetrics: false,
        showPermissionScope: true,
        showRefresh: true,
        showSearch: true,
        metricModes: ['permission_direct', 'permission_effective'],
        defaultMetricMode: 'permission_effective',
        defaultPermissionScope: 'effective',
        defaultSearchTarget: 'all',
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
      additionalTreeViews: [
        {
          title: this.$t('UserTree'),
          name: 'UserTree',
          icon: 'fa-solid fa-user',
          treeComponent: 'UserTree',
          treeSetting: {
            showCollapse: true,
            showPermissionScope: true,
            showRefresh: true,
            showSearch: true,
            showUserOrder: true,
            defaultPermissionScope: 'effective',
            settingsCacheKey: 'asset-permission',
            searchLimit: 1000,
            dataSource: createAssetPermissionUserTreeDataSource(this.$axios),
            readOnly: true,
            callback: {
              onSelected: (event, treeNode, context) => {
                this.handlePermissionUserTreeSelected(treeNode, context)
              }
            }
          }
        }
      ],
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
    clearPermissionTreeFilters(url) {
      for (const key of ['node_id', 'asset_id', 'user_id', 'user_group_id', 'all']) {
        url = setUrlParam(url, key, '')
      }
      return url
    },
    handlePermissionTreeSelected(treeNode, context = {}) {
      const type = treeNode?.meta?.type
      const resourceId = treeNode?.meta?.data?.id
      if (!resourceId || !['node', 'asset'].includes(type)) {
        return
      }

      let url = this.clearPermissionTreeFilters(this.treeSetting.url)
      url = setUrlParam(url, 'node_id', type === 'node' ? resourceId : '')
      url = setUrlParam(url, 'asset_id', type === 'asset' ? resourceId : '')
      url = setUrlParam(url, 'all', context.permissionScope === 'direct' ? '0' : '1')
      this.$refs.AssetTreeTable?.updateTableUrl?.(url)
    },
    handlePermissionUserTreeSelected(treeNode, context = {}) {
      const type = treeNode?.meta?.type
      const resourceId = treeNode?.meta?.data?.resource_id ?? treeNode?.meta?.data?.id
      if (!resourceId || !['organization', 'user_group', 'user'].includes(type)) {
        return
      }

      let url = this.clearPermissionTreeFilters(this.treeSetting.url)
      if (type === 'user_group') {
        url = setUrlParam(url, 'user_group_id', resourceId)
      } else if (type === 'user') {
        url = setUrlParam(url, 'user_id', resourceId)
      }
      if (type !== 'organization') {
        url = setUrlParam(url, 'all', context.permissionScope === 'direct' ? '0' : '1')
      }
      this.$refs.AssetTreeTable?.updateTableUrl?.(url)
    },
    handlePermissionTreeReady({ tree } = {}) {
      const selected = tree?.getSelectedNodes?.()[0]
      const context = tree?.getTreeSnapshot?.() || {}
      const type = selected?.meta?.type
      if (['node', 'asset'].includes(type)) {
        this.handlePermissionTreeSelected(selected, context)
      } else if (['organization', 'user_group', 'user'].includes(type)) {
        this.handlePermissionUserTreeSelected(selected, context)
      } else {
        this.handlePermissionTreeSelectionClear()
      }
    },
    handlePermissionTreeSelectionClear() {
      const url = this.clearPermissionTreeFilters(this.treeSetting.url)
      this.$refs.AssetTreeTable?.updateTableUrl?.(url)
    },
    reloadAssetTreeTable() {
      this.$refs.AssetTreeTable?.reloadTable?.()
      this.reloadVisiblePermissionMetrics()
    },
    reloadVisiblePermissionMetrics() {
      this.$refs.AssetTreeTable?.reloadVisibleTreeMetrics?.()
    },
    handlePermBulkUpdate() {
      this.updateSelectedDialogSetting.visible = false
      this.reloadAssetTreeTable()
    }
  }
}
</script>
