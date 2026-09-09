<template>
  <AssetDialog
    v-if="visible"
    ref="assetDialog"
    v-bind="$attrs"
    :additional-tree-views="additionalTreeViews"
    :base-url="baseUrl"
    :can-select="canSelect"
    :page-size="pageSize"
    :plain-text-cells="plainTextCells"
    :remember-tree-view="false"
    :show-selected-items="showSelectedItems"
    :title="dialogTitle"
    :tree-setting="treeSetting"
    :value="value"
    :visible="visible"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    @tree-view-change="handleTreeViewChange"
    @update:visible="$emit('update:visible', $event)"
  />
</template>

<script>
import AssetDialog from '@/components/Apps/AssetSelect/dialog.vue'
import {
  FAVORITE_TREE_NAME,
  TYPE_TREE_NAME,
  createUserAuthorizationTreeDataSource,
  createUserFavoriteTreeDataSource,
  createUserTypeTreeDataSource,
  getAuthorizationAssetsUrl,
  getFavoriteAssetsUrl,
  getTypeAssetsUrl
} from './treeDataSource'

const DEFAULT_FAVORITE_ASSETS_URL = '/api/v1/perms/users/self/nodes/favorite/assets/'

function copyUrlQuery(sourceUrl, targetUrl) {
  const source = new URL(sourceUrl, location.origin)
  const target = new URL(targetUrl, location.origin)
  const sourceKeys = new Set(source.searchParams.keys())

  sourceKeys.forEach((key) => target.searchParams.delete(key))
  source.searchParams.forEach((value, key) => target.searchParams.append(key, value))
  return `${target.pathname}${target.search}`
}

export default {
  name: 'UserAssetSelectDialog',
  components: { AssetDialog },
  inheritAttrs: false,
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    value: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: ''
    },
    baseUrl: {
      type: String,
      default: '/api/v1/perms/users/self/assets/'
    },
    favoriteBaseUrl: {
      type: String,
      default: DEFAULT_FAVORITE_ASSETS_URL
    },
    canSelect: {
      type: Function,
      default: () => true
    },
    pageSize: {
      type: Number,
      default: 10
    },
    plainTextCells: {
      type: Boolean,
      default: true
    },
    showSelectedItems: {
      type: Boolean,
      default: true
    },
    settingsCacheKey: {
      type: String,
      default: 'user-asset-select-dialog'
    }
  },
  emits: ['cancel', 'confirm', 'update:visible'],
  data() {
    const user = 'self'
    const authorizationTreeDataSource = createUserAuthorizationTreeDataSource(this.$axios, user)
    const favoriteTreeDataSource = createUserFavoriteTreeDataSource(this.$axios, user)
    const typeTreeDataSource = createUserTypeTreeDataSource(this.$axios, user)
    const commonTreeSetting = {
      childrenPagination: true,
      countResource: 'asset',
      defaultMetricMode: 'asset_all',
      fillHeight: true,
      hasRightMenu: false,
      metricModes: ['asset_all'],
      notShowBuiltinTree: true,
      readOnly: true,
      selectSyncToRoute: false,
      showAssetOrder: false,
      showAmountTooltip: false,
      showAssets: false,
      showAssetScope: false,
      showCollapse: true,
      showMenu: false,
      showMetrics: false,
      showNodeActions: false,
      showPermissionScope: false,
      showRefresh: true,
      showSearch: false,
      treeComponent: 'NodeAssetTree',
      edit: {
        drag: {
          isMove: false
        }
      }
    }

    return {
      treeSetting: {
        ...commonTreeSetting,
        dataSource: authorizationTreeDataSource,
        settingsCacheKey: `${this.settingsCacheKey}:authorization-tree`,
        treeIcon: 'fa-solid fa-sitemap',
        treeTitle: this.$t('AuthorizationTree'),
        callback: {
          onSelected: (event, node) => this.handleAuthorizationSelected(node)
        }
      },
      additionalTreeViews: [
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
            expandRootInGlobalOrg: true,
            lazyLoad: false,
            settingsCacheKey: `${this.settingsCacheKey}:type-tree`,
            treeIcon: 'fa-solid fa-shapes',
            treeTitle: this.$t('TypeTree'),
            callback: {
              onSelected: (event, node) => this.handleTypeSelected(node)
            }
          }
        },
        {
          icon: 'fa-regular fa-star',
          name: FAVORITE_TREE_NAME,
          title: this.$t('FavoriteTree'),
          treeComponent: 'NodeAssetTree',
          treeSetting: {
            ...commonTreeSetting,
            dataSource: favoriteTreeDataSource,
            expandRootInGlobalOrg: true,
            getNodeLabel: (node) =>
              node?.meta?.data?.is_root
                ? this.$t('FavoriteTreeRoot')
                : node?.name || node?.meta?.data?.value || '',
            settingsCacheKey: `${this.settingsCacheKey}:favorite-tree`,
            treeIcon: 'fa-regular fa-star',
            treeTitle: this.$t('FavoriteTree'),
            callback: {
              onSelected: (event, node) => this.handleFavoriteSelected(node)
            }
          }
        }
      ]
    }
  },
  computed: {
    dialogTitle() {
      return (
        this.title ||
        this.$t('ResourceSelectDialogTitle', {
          resource: this.$t('Asset')
        })
      )
    },
    favoriteAssetsUrl() {
      return copyUrlQuery(this.baseUrl, this.favoriteBaseUrl)
    }
  },
  methods: {
    handleTreeViewChange(payload) {
      const name = payload?.name || payload?.item?.name
      if (!name) {
        return
      }
      const url = name === FAVORITE_TREE_NAME ? this.favoriteAssetsUrl : this.baseUrl
      this.$refs.assetDialog?.updateTableUrl(url)
    },
    handleAuthorizationSelected(node) {
      this.$refs.assetDialog?.updateTableUrl(getAuthorizationAssetsUrl(this.baseUrl, node))
    },
    handleFavoriteSelected(node) {
      this.$refs.assetDialog?.updateTableUrl(getFavoriteAssetsUrl(this.favoriteAssetsUrl, node))
    },
    handleTypeSelected(node) {
      this.$refs.assetDialog?.updateTableUrl(getTypeAssetsUrl(this.baseUrl, node))
    },
    handleConfirm(assetIds, assetRows) {
      this.$emit('confirm', assetIds, assetRows)
    },
    handleCancel() {
      this.$emit('update:visible', false)
      this.$emit('cancel')
    }
  }
}
</script>
