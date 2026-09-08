<template>
  <AssetDialog
    v-if="visible"
    ref="assetDialog"
    :additional-tree-views="additionalTreeViews"
    :base-url="authorizationAssetsUrl"
    :can-select="canSelectAsset"
    :plain-text-cells="true"
    :remember-tree-view="false"
    :show-selected-items="true"
    :title="dialogTitle"
    :tree-setting="treeSetting"
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
} from '@/components/Apps/GrantedAssets/treeDataSource'

export default {
  name: 'FavoriteAssetsToFolderDialog',
  components: { AssetDialog },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    folder: {
      type: Object,
      default: null
    },
    existingAssetIds: {
      type: Array,
      default: () => []
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
      authorizationAssetsUrl: '/api/v1/perms/users/self/assets/',
      favoriteAssetsUrl: '/api/v1/perms/users/self/nodes/favorite/assets/',
      treeSetting: {
        ...commonTreeSetting,
        dataSource: authorizationTreeDataSource,
        settingsCacheKey: 'favorite-assets-dialog:authorization-tree',
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
            settingsCacheKey: 'favorite-assets-dialog:type-tree',
            treeIcon: 'fa-solid fa-shapes',
            treeTitle: this.$t('TypeTree'),
            callback: {
              onSelected: (event, node) => this.handleTypeSelected(node)
            }
          }
        },
        {
          icon: 'fa-solid fa-star',
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
            settingsCacheKey: 'favorite-assets-dialog:favorite-tree',
            treeIcon: 'fa-solid fa-star',
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
      const folderName = this.folder?.name || this.folder?.meta?.data?.value
      const title = this.$t('AddFavoriteAssetsToFolder')
      return folderName ? `${title} - ${folderName}` : title
    },
    existingAssetIdSet() {
      return new Set(this.existingAssetIds.map(String))
    }
  },
  methods: {
    canSelectAsset(asset) {
      return !this.existingAssetIdSet.has(String(asset?.id))
    },
    handleTreeViewChange(payload) {
      const name = payload?.name || payload?.item?.name
      if (!name) {
        return
      }
      const url = name === FAVORITE_TREE_NAME ? this.favoriteAssetsUrl : this.authorizationAssetsUrl
      this.$refs.assetDialog?.updateTableUrl(url)
    },
    handleAuthorizationSelected(node) {
      this.$refs.assetDialog?.updateTableUrl(
        getAuthorizationAssetsUrl(this.authorizationAssetsUrl, node)
      )
    },
    handleFavoriteSelected(node) {
      this.$refs.assetDialog?.updateTableUrl(getFavoriteAssetsUrl(this.favoriteAssetsUrl, node))
    },
    handleTypeSelected(node) {
      this.$refs.assetDialog?.updateTableUrl(getTypeAssetsUrl(this.authorizationAssetsUrl, node))
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
