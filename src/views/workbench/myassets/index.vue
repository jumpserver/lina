<template>
  <Page>
    <GrantedAssets
      ref="grantedAssets"
      allow-favorite-edit
      class="my-assets-table"
      :actions="actions"
      :comment="comment"
      :name="name"
      :table-url="tableUrl"
      user="self"
      @batch-favorite-request="openBatchFavoriteDialog"
      @batch-unfavorite-request="removeSelectedFavorites"
      @favorite-assets-request="openFavoriteAssetsDialog"
      @favorite-tree-change="handleFavoriteTreeChange"
      @selection-change="updateAssistantSelection"
      @query-change="clearAssistantSelection"
      @url-change="clearAssistantSelection"
    />
    <FavoriteFolderDialog
      v-model:folder-id="favoriteDialog.folderId"
      v-model:visible="favoriteDialog.visible"
      :asset-count="favoriteDialog.assets.length"
      :batch="favoriteDialog.batch"
      :favorite="favoriteDialog.favorite"
      :folders="favoriteFolders"
      :loading="favoriteDialog.loading"
      @confirm="saveFavorite"
      @folder-created="handleFavoriteFolderCreated"
      @folder-deleted="handleFavoriteFolderDeleted"
      @folders-refreshed="handleFavoriteFoldersRefreshed"
      @folder-updated="handleFavoriteFolderUpdated"
      @remove="removeFavorite"
    />
    <FavoriteAssetsToFolderDialog
      v-model:visible="favoriteAssetsDialog.visible"
      :existing-asset-ids="favoriteAssetsInTargetFolder"
      :folder="favoriteAssetsDialog.folder"
      @confirm="addAssetsToFavoriteFolder"
    />
  </Page>
</template>

<script>
import { getPreference } from '@/api/settings'
import GrantedAssets from '@/components/Apps/GrantedAssets/index.vue'
import {
  FAVORITE_ROOT_ID,
  FAVORITE_TREE_NAME
} from '@/components/Apps/GrantedAssets/treeDataSource'
import { EditableInputFormatter } from '@/components/Table/TableFormatters'
import Page from '@/layout/components/Page/index.vue'
import {
  publishAssetPageContext,
  clearAssetPageContext
} from '@/components/Apps/ChatAi/utils/pageContext'
import { addBasePath, openNewWindow } from '@/utils/common/index'
import FavoriteFolderDialog from './FavoriteFolderDialog.vue'
import FavoriteAssetsToFolderDialog from './FavoriteAssetsToFolderDialog.vue'

export default {
  components: {
    Page,
    GrantedAssets,
    FavoriteFolderDialog,
    FavoriteAssetsToFolderDialog
  },
  data() {
    return {
      tableUrl: `/api/v1/perms/users/self/assets/`,
      preference: {},
      actions: {
        width: '88px',
        align: 'center',
        formatterArgs: {
          hasDelete: false,
          loading: true,
          hasClone: false,
          hasUpdate: false,
          extraActions: [
            {
              name: 'connect',
              icon: 'fa-desktop',
              type: 'primary',
              can: ({ row }) => row.is_active,
              callback: ({ row }) => {
                const oid = this.$store.getters.currentOrg ? this.$store.getters.currentOrg.id : ''
                const url = `/luna/connect?login_to=${row.id}`
                if (this.preference?.basic?.connect_default_open_method === 'new') {
                  openNewWindow(url)
                } else {
                  const url = `/luna/?login_to=${row.id}${oid ? `&oid=${oid}` : ''}`
                  window.open(addBasePath(url), '_blank')
                }
              }
            },
            {
              name: 'favor',
              type: 'info',
              icon: ({ row }) => {
                return this.checkFavorite(row.id) ? 'fa-star' : 'fa-star-o'
              },
              callback: ({ row }) => this.openFavoriteDialog(row)
            }
          ]
        }
      },
      allFavorites: [],
      favoriteFolders: [],
      favoriteDialog: {
        asset: null,
        assets: [],
        batch: false,
        favorite: null,
        folderId: '',
        loading: false,
        visible: false
      },
      favoriteAssetsDialog: {
        folder: null,
        visible: false
      },
      name: {
        formatter: EditableInputFormatter,
        formatterArgs: {
          canEdit: true,
          showEditBtn: true,
          onEnter: ({ row, col, oldValue, newValue }) => {
            this.updateAssetCustomAttr(row, col, oldValue, newValue)
          }
        }
      },
      comment: {
        formatter: EditableInputFormatter,
        formatterArgs: {
          canEdit: true,
          showEditBtn: true,
          onEnter: ({ row, col, oldValue, newValue }) => {
            this.updateAssetCustomAttr(row, col, oldValue, newValue)
          }
        }
      }
    }
  },
  computed: {
    favoriteAssetsInTargetFolder() {
      const folderId = this.favoriteAssetsDialog.folder?.meta?.data?.id
      if (!folderId) {
        return []
      }
      return this.allFavorites
        .filter((favorite) => String(favorite.folder?.id || favorite.folder) === String(folderId))
        .map((favorite) => favorite.asset?.id || favorite.asset)
        .filter(Boolean)
    }
  },
  mounted() {
    this.refreshFavoriteData()
    this.preference = getPreference().then((resp) => {
      this.preference = resp
    })
  },
  watch: {
    '$route.fullPath'() {
      clearAssetPageContext(this)
    },
    '$store.getters.currentOrg.id'() {
      clearAssetPageContext(this)
    }
  },
  deactivated() {
    clearAssetPageContext(this)
  },
  beforeUnmount() {
    clearAssetPageContext(this)
  },
  methods: {
    clearAssistantSelection() {
      clearAssetPageContext(this)
    },
    updateAssistantSelection(rows) {
      publishAssetPageContext(this, this.$route, this.$store.getters.currentOrg, rows)
    },
    normalizeListResponse(response) {
      return Array.isArray(response) ? response : response?.results || []
    },
    async refreshFavoriteData() {
      const formatterArgs = this.actions.formatterArgs
      formatterArgs.loading = true
      try {
        const [favorites, folders] = await Promise.all([
          this.$axios.get('/api/v1/assets/favorite-assets/'),
          this.$axios.get('/api/v1/assets/favorite-folders/')
        ])
        this.allFavorites = this.normalizeListResponse(favorites)
        this.favoriteFolders = this.normalizeListResponse(folders)
      } finally {
        formatterArgs.loading = false
      }
    },
    async openFavoriteDialog(asset) {
      await this.refreshFavoriteData()
      const favorite = this.checkFavorite(asset.id)
      this.favoriteDialog = {
        asset,
        assets: [asset],
        batch: false,
        favorite,
        folderId: this.getFavoriteFolderId(favorite),
        loading: false,
        visible: true
      }
    },
    async openBatchFavoriteDialog(assets) {
      if (!assets?.length) {
        return
      }
      await this.refreshFavoriteData()
      this.favoriteDialog = {
        asset: null,
        assets: [...assets],
        batch: true,
        favorite: null,
        folderId: '',
        loading: false,
        visible: true
      }
    },
    openFavoriteAssetsDialog(folder) {
      this.favoriteAssetsDialog = {
        folder,
        visible: true
      }
    },
    async addAssetsToFavoriteFolder(assetIds) {
      const folderId = this.favoriteAssetsDialog.folder?.meta?.data?.id
      if (!folderId || !assetIds?.length) {
        return
      }
      try {
        await this.$axios.post(`/api/v1/assets/favorite-folders/${folderId}/assets/`, {
          assets: assetIds
        })
        this.$message.success(this.$t('CollectionSucceed'))
        await this.refreshFavoriteData()
        await this.refreshFavoriteTreeAndTable()
      } catch (error) {
        this.$message.error(`${this.$t('UpdateErrorMsg')} ${error}`)
      }
    },
    async saveFavorite(folderId) {
      if (this.favoriteDialog.batch) {
        await this.saveBatchFavorite(folderId)
        return
      }
      const assetId = this.favoriteDialog.asset?.id
      if (!assetId || !folderId) {
        return
      }
      const targetFolderId = folderId === FAVORITE_ROOT_ID ? null : folderId
      this.favoriteDialog.loading = true
      try {
        const favorite = await this.$axios.post('/api/v1/assets/favorite-assets/', {
          asset: assetId,
          folder: targetFolderId
        })
        this.allFavorites = [
          ...this.allFavorites.filter((item) => this.getFavoriteAssetId(item) !== String(assetId)),
          favorite
        ]
        this.favoriteDialog.visible = false
        this.$message.success(this.$t('CollectionSucceed'))
        await this.refreshFavoriteTreeAndTable()
      } finally {
        this.favoriteDialog.loading = false
      }
    },
    async saveBatchFavorite(folderId) {
      const assets = this.favoriteDialog.assets
      const assetIds = assets.map((asset) => asset?.id).filter(Boolean)
      if (!folderId || assetIds.length === 0) {
        return
      }
      const targetFolderId = folderId === FAVORITE_ROOT_ID ? null : folderId
      this.favoriteDialog.loading = true
      try {
        await this.$axios.post('/api/v1/assets/favorite-assets/batch/', {
          assets: assetIds,
          folder: targetFolderId
        })
        this.favoriteDialog.visible = false
        this.$message.success(this.$t('CollectionSucceed'))
        assets.forEach((asset) => this.$refs.grantedAssets?.toggleRowSelection(asset, false))
        await this.refreshFavoriteData()
        await this.refreshFavoriteTreeAndTable()
      } finally {
        this.favoriteDialog.loading = false
      }
    },
    async removeFavorite() {
      const assetId = this.favoriteDialog.asset?.id
      if (!assetId) {
        return
      }
      this.favoriteDialog.loading = true
      const url = `/api/v1/assets/favorite-assets/?asset=${assetId}`
      try {
        await this.$axios.delete(url)
        this.allFavorites = this.allFavorites.filter(
          (item) => this.getFavoriteAssetId(item) !== String(assetId)
        )
        this.favoriteDialog.visible = false
        this.$message.success(this.$t('UnFavoriteSucceed'))
        await this.refreshFavoriteTreeAndTable()
      } finally {
        this.favoriteDialog.loading = false
      }
    },
    async removeSelectedFavorites(assets) {
      const assetIds = assets?.map((asset) => asset?.id).filter(Boolean) || []
      if (assetIds.length === 0) {
        return
      }
      await this.$axios.delete('/api/v1/assets/favorite-assets/batch/', {
        data: { assets: assetIds }
      })
      assets.forEach((asset) => this.$refs.grantedAssets?.toggleRowSelection(asset, false))
      this.$message.success(this.$t('UnFavoriteSucceed'))
      await this.refreshFavoriteData()
      await this.refreshFavoriteTreeAndTable()
    },
    checkFavorite(assetId) {
      return (
        this.allFavorites.find((item) => this.getFavoriteAssetId(item) === String(assetId)) || null
      )
    },
    getFavoriteAssetId(favorite) {
      return String(favorite?.asset?.id || favorite?.asset || '')
    },
    getFavoriteFolderId(favorite) {
      if (!favorite) {
        return ''
      }
      return String(favorite?.folder?.id || favorite?.folder || FAVORITE_ROOT_ID)
    },
    async handleFavoriteFolderCreated(folder) {
      this.favoriteFolders = [
        ...this.favoriteFolders.filter((item) => String(item.id) !== String(folder.id)),
        folder
      ]
      await this.$refs.grantedAssets?.refreshFavoriteTree()
    },
    async handleFavoriteFolderDeleted(folder) {
      const deletedFolderIds = new Set([String(folder?.id || '')])
      let changed = true
      while (changed) {
        changed = false
        this.favoriteFolders.forEach((item) => {
          const id = String(item.id)
          const parentId = String(item.parent?.id || item.parent || '')
          if (!deletedFolderIds.has(id) && deletedFolderIds.has(parentId)) {
            deletedFolderIds.add(id)
            changed = true
          }
        })
      }
      this.favoriteFolders = this.favoriteFolders.filter(
        (item) => !deletedFolderIds.has(String(item.id))
      )
      if (deletedFolderIds.has(String(this.favoriteDialog.folderId))) {
        this.favoriteDialog.folderId = ''
      }
      await this.$refs.grantedAssets?.refreshFavoriteTree()
      if (this.$refs.grantedAssets?.activeTreeName === FAVORITE_TREE_NAME) {
        this.$refs.grantedAssets.reloadTable()
      }
    },
    handleFavoriteFoldersRefreshed(folders) {
      this.favoriteFolders = [...folders]
    },
    async handleFavoriteFolderUpdated(folder) {
      this.favoriteFolders = this.favoriteFolders.map((item) =>
        String(item.id) === String(folder.id) ? folder : item
      )
      await this.$refs.grantedAssets?.refreshFavoriteTree()
    },
    async handleFavoriteTreeChange() {
      await this.refreshFavoriteData()
      if (this.$refs.grantedAssets?.activeTreeName === FAVORITE_TREE_NAME) {
        this.$refs.grantedAssets.reloadTable()
      }
    },
    async refreshFavoriteTreeAndTable() {
      await this.$refs.grantedAssets?.refreshFavoriteTree()
      if (this.$refs.grantedAssets?.activeTreeName === FAVORITE_TREE_NAME) {
        this.$refs.grantedAssets.reloadTable()
      }
    },
    updateAssetCustomAttr(row, col, oldValue, newValue) {
      if (oldValue.toString() === newValue.toString()) {
        return
      }
      const colProp = col.prop

      this.$axios
        .post('/api/v1/assets/my-asset/', {
          asset: row.id,
          [colProp]: newValue
        })
        .catch((e) => {
          this.$message.error(e?.response?.request?.responseText || this.$t('BadRequestErrorMsg'))
          return Promise.reject(e)
        })
        .then(() => {
          row[colProp] = newValue
          this.$message.success(this.$t('UpdateSuccessMsg'))
        })
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.row_disabled),
:deep(.row_disabled:hover),
:deep(.row_disabled:hover > td) {
  cursor: not-allowed;
  background-color: rgba(192, 196, 204, 0.28) !important;
}

:deep(.my-assets-table .table-actions) {
  .el-button .el-tooltip__trigger .pre-icon .fa {
    margin-right: 0;
  }
}
</style>
