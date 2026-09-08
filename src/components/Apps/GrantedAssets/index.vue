<template>
  <AssetTreeTable
    ref="AssetTreeTable"
    :additional-tree-views="additionalTreeViews"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :tree-setting="treeSetting"
    @active-tree-ready="handleTreeViewChange"
    @selection-change="handleSelectionChange"
    @tab-click="handleTreeViewChange"
  >
    <template #rMenu="{ close, data }">
      <template v-if="canAddFavoriteAssets(data)">
        <li class="divider" />
        <li
          id="m_add_favorite_assets"
          class="rmenu"
          tabindex="-1"
          @click="handleAddFavoriteAssets(data, close)"
        >
          <i class="fa fa-star-o" /> {{ $t('AddFavoriteAssetsToFolder') }}
        </li>
      </template>
    </template>
  </AssetTreeTable>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import { AccountInfoFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { connectivityMeta } from '@/components/Apps/AccountListTable/const'
import {
  AUTHORIZATION_TREE_NAME,
  FAVORITE_TREE_NAME,
  TYPE_TREE_NAME,
  createUserAuthorizationTreeDataSource,
  createUserFavoriteTreeDataSource,
  createUserTypeTreeDataSource,
  getAuthorizationAssetsUrl,
  getFavoriteAssetsUrl,
  getTypeAssetsUrl
} from './treeDataSource'

export default {
  name: 'GrantedAssets',
  components: {
    AssetTreeTable
  },
  props: {
    user: {
      type: String,
      required: true
    },
    tableUrl: {
      type: String,
      required: true
    },
    allowFavoriteEdit: {
      type: Boolean,
      default: false
    },
    onSelected: {
      type: Function,
      default: null
    },
    actions: {
      type: Object,
      default: null
    },
    getShowUrl: {
      type: Function,
      default: ({ row }) => `/api/v1/perms/users/self/assets/${row.id}/accounts/`
    },
    name: {
      type: Object,
      default: () => ({
        formatter: DetailFormatter,
        formatterArgs: {
          route: 'AssetDetail',
          can: true
        }
      })
    },
    comment: {
      type: Object,
      default: () => ({})
    }
  },
  emits: [
    'batch-favorite-request',
    'batch-unfavorite-request',
    'favorite-assets-request',
    'favorite-tree-change',
    'selection-change',
    'tree-view-change'
  ],
  data() {
    const authorizationTreeDataSource = createUserAuthorizationTreeDataSource(
      this.$axios,
      this.user
    )
    const favoriteTreeDataSource = createUserFavoriteTreeDataSource(this.$axios, this.user, {
      editable: this.allowFavoriteEdit,
      newFolderName: this.$t('FavoriteFolderDefaultName'),
      onMutated: (operation, folder) => this.handleFavoriteTreeMutated(operation, folder)
    })
    const typeTreeDataSource = createUserTypeTreeDataSource(this.$axios, this.user)
    const commonTreeSetting = {
      childrenPagination: true,
      countResource: 'asset',
      defaultMetricMode: 'asset_all',
      fillHeight: true,
      metricModes: ['asset_all'],
      notShowBuiltinTree: true,
      selectSyncToRoute: false,
      showAssetOrder: false,
      showAmountTooltip: false,
      showAssets: false,
      showCollapse: true,
      showMetrics: false,
      showNodeActions: false,
      showPermissionScope: false,
      showRefresh: true,
      showSearch: false,
      treeComponent: 'NodeAssetTree'
    }

    return {
      activeTreeName: AUTHORIZATION_TREE_NAME,
      selectedRows: [],
      treeSetting: {
        ...commonTreeSetting,
        dataSource: authorizationTreeDataSource,
        readOnly: true,
        settingsCacheKey: `user-authorization-tree:${this.user}`,
        treeIcon: 'fa-solid fa-sitemap',
        treeTitle: this.$t('AuthorizationTree'),
        callback: {
          onSelected: (event, node) => this.handleAuthorizationSelected(node)
        }
      },
      additionalTreeViews: [
        {
          icon: 'fa-solid fa-star',
          name: FAVORITE_TREE_NAME,
          title: this.$t('FavoriteTree'),
          treeComponent: 'NodeAssetTree',
          treeSetting: {
            ...commonTreeSetting,
            beforeRemove: (node) => this.confirmFavoriteFolderRemove(node),
            dataSource: favoriteTreeDataSource,
            edit: {
              drag: {
                isMove: false
              }
            },
            expandRootInGlobalOrg: true,
            getNodeLabel: (node) =>
              node?.meta?.data?.is_root
                ? this.$t('FavoriteTreeRoot')
                : node?.name || node?.meta?.data?.value || '',
            hasRightMenu: this.allowFavoriteEdit,
            readOnly: !this.allowFavoriteEdit,
            settingsCacheKey: `user-favorite-tree:${this.user}`,
            showCreate: (node) => this.isFavoriteFolderNode(node),
            showDelete: (node) => this.isEditableFavoriteFolderNode(node),
            showMenu: (node) => this.isFavoriteFolderNode(node),
            showUpdate: (node) => this.isEditableFavoriteFolderNode(node),
            callback: {
              onSelected: (event, node) => this.handleFavoriteSelected(node)
            }
          }
        },
        {
          icon: 'fa-solid fa-shapes',
          name: TYPE_TREE_NAME,
          title: this.$t('TypeTree'),
          treeComponent: 'XTree',
          treeSetting: {
            ...commonTreeSetting,
            amountInLabel: true,
            amountPredicate: (node) =>
              String(node?.id) === 'ROOT' ||
              ['category', 'type', 'platform'].includes(node?.meta?.type),
            amountTypes: ['category', 'type', 'platform'],
            childrenPagination: false,
            dataSource: typeTreeDataSource,
            edit: {
              drag: {
                isMove: false
              }
            },
            expandRootInGlobalOrg: true,
            lazyLoad: false,
            readOnly: true,
            settingsCacheKey: `user-type-tree:${this.user}`,
            treeIcon: 'fa-solid fa-shapes',
            treeTitle: this.$t('TypeTree'),
            callback: {
              onSelected: (event, node) => this.handleTypeSelected(node)
            }
          }
        }
      ],
      tableConfig: {
        url: this.tableUrl,
        hasTree: true,
        columnsExtra: ['view_account'],
        columnsExclude: ['spec_info'],
        columns: [
          'id',
          'name',
          'address',
          'comment',
          'labels',
          'connectivity',
          'platform',
          'view_account',
          'actions'
        ],
        columnsShow: {
          min: ['name', 'address', 'accounts'],
          default: ['name', 'address', 'platform', 'view_account', 'actions']
        },
        columnsMeta: {
          name: {
            ...this.name
          },
          labels: {
            formatterArgs: {
              showEditBtn: false
            }
          },
          actions: {
            ...this.actions
          },
          view_account: {
            label: this.$t('Accounts'),
            formatter: AccountInfoFormatter,
            width: '100px'
          },
          connectivity: connectivityMeta,
          comment: { ...this.comment }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasCreate: false,
        hasExport: false,
        hasImport: false,
        hasLeftActions: this.allowFavoriteEdit,
        hasMoreActions: this.allowFavoriteEdit,
        extraMoreActions: this.allowFavoriteEdit
          ? [
              {
                name: 'batchFavorite',
                title: this.$t('BatchFavorite'),
                icon: 'fa-star-o',
                can: ({ selectedRows }) => selectedRows.length > 0,
                callback: ({ selectedRows }) =>
                  this.$emit('batch-favorite-request', [...selectedRows])
              },
              {
                name: 'batchUnfavorite',
                title: this.$t('BatchUnfavorite'),
                icon: 'fa-star',
                can: ({ selectedRows }) => selectedRows.length > 0,
                callback: ({ selectedRows }) =>
                  this.$emit('batch-unfavorite-request', [...selectedRows])
              }
            ]
          : []
      }
    }
  },
  computed: {
    favoriteTableUrl() {
      return `/api/v1/perms/users/${this.user}/nodes/favorite/assets/`
    }
  },
  methods: {
    handleSelectionChange(rows) {
      this.selectedRows = Array.isArray(rows) ? [...rows] : []
      this.$emit('selection-change', this.selectedRows)
    },
    isFavoriteFolderNode(node) {
      return node?.meta?.type === 'node'
    },
    isEditableFavoriteFolderNode(node) {
      return this.isFavoriteFolderNode(node) && !node?.meta?.data?.is_root
    },
    canAddFavoriteAssets(node) {
      return (
        this.allowFavoriteEdit &&
        this.activeTreeName === FAVORITE_TREE_NAME &&
        this.isEditableFavoriteFolderNode(node)
      )
    },
    handleAddFavoriteAssets(node, close) {
      close?.()
      this.$emit('favorite-assets-request', node)
    },
    handleTreeViewChange(payload) {
      const name = payload?.name || payload?.item?.name
      if (!name) {
        return
      }
      if (name === this.activeTreeName) {
        return
      }
      this.activeTreeName = name
      const url = name === FAVORITE_TREE_NAME ? this.favoriteTableUrl : this.tableUrl
      this.$refs.AssetTreeTable?.updateTableUrl(url)
      this.$emit('tree-view-change', name)
    },
    handleAuthorizationSelected(node) {
      if (this.onSelected) {
        this.onSelected(node, this)
        return
      }
      this.$refs.AssetTreeTable?.updateTableUrl(getAuthorizationAssetsUrl(this.tableUrl, node))
    },
    handleFavoriteSelected(node) {
      this.$refs.AssetTreeTable?.updateTableUrl(getFavoriteAssetsUrl(this.favoriteTableUrl, node))
    },
    handleTypeSelected(node) {
      this.$refs.AssetTreeTable?.updateTableUrl(getTypeAssetsUrl(this.tableUrl, node))
    },
    async confirmFavoriteFolderRemove(node) {
      try {
        await this.$confirm(
          this.$t('FavoriteFolderDeleteConfirm', { name: node?.name || '' }),
          this.$t('Delete'),
          { type: 'warning' }
        )
        return true
      } catch {
        return false
      }
    },
    handleFavoriteTreeMutated(operation, folder) {
      this.$emit('favorite-tree-change', { folder, operation })
    },
    refreshFavoriteTree() {
      return this.$refs.AssetTreeTable?.refreshTreeView(FAVORITE_TREE_NAME)
    },
    reloadTable() {
      return this.$refs.AssetTreeTable?.reloadTable()
    },
    toggleRowSelection(row, isSelected) {
      return this.$refs.AssetTreeTable?.toggleRowSelection(row, isSelected)
    }
  }
}
</script>

<style scoped>
.row_disabled,
.row_disabled:hover,
.row_disabled:hover > td {
  cursor: not-allowed;
  background-color: rgba(192, 196, 204, 0.28) !important;
}
</style>
