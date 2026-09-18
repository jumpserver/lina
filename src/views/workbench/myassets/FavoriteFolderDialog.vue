<template>
  <Dialog
    v-if="visible"
    :disabled-status="loading"
    :show-cancel="false"
    :show-confirm="false"
    :title="dialogTitle"
    :visible="visible"
    class="favorite-folder-select-dialog"
    max-width="440px"
    top="4vh"
    width="440px"
    @update:visible="$emit('update:visible', $event)"
  >
    <template #header="{ titleId, titleClass }">
      <div class="favorite-folder-select-dialog__header-content">
        <span
          :id="titleId"
          :class="[titleClass, 'favorite-folder-select-dialog__title']"
          style="
            display: inline-flex !important;
            align-items: baseline;
            flex-wrap: nowrap;
            white-space: nowrap;
          "
        >
          <span>{{ dialogTitle }}</span>
          <span
            class="favorite-folder-select-dialog__selected-count"
            style="display: inline !important"
          >
            ({{ selectedAssetsText }})
          </span>
        </span>
      </div>
    </template>

    <div class="favorite-folder-select-dialog__content">
      <TreePanel
        ref="favoriteTree"
        fill-height
        :setting="treeSetting"
        :show-header="false"
        class="favorite-folder-select-dialog__tree-panel"
        @selected="selectFolder"
        @tree-init-finish="handleTreeReady"
      />
    </div>

    <template #footer>
      <div class="favorite-folder-select-dialog__footer-actions">
        <el-button
          v-if="!batch && favorite"
          :disabled="loading"
          plain
          type="danger"
          @click="$emit('remove')"
        >
          {{ $t('RemoveFavorite') }}
        </el-button>
        <el-button :disabled="loading" @click="$emit('update:visible', false)">
          {{ $t('Cancel') }}
        </el-button>
        <el-button
          :disabled="!selectedFolderId"
          :loading="loading"
          type="primary"
          @click="$emit('confirm', selectedFolderId)"
        >
          {{ $t('Confirm') }}
        </el-button>
      </div>
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import {
  FAVORITE_ROOT_ID,
  createUserFavoriteTreeDataSource
} from '@/components/Apps/GrantedAssets/treeDataSource'
import TreePanel from '@/components/Tree/TreePanel/index.vue'
import {
  createXTreeSetting,
  X_TREE_LOAD_MODES,
  X_TREE_SEARCH_PLACEMENTS
} from '@/components/Tree/XTree/config'

const folderTreeKey = (folderId) => `favorite-folder:${folderId}`

function folderId(folder) {
  return String(folder?.id || '')
}

function parentFolderId(folder) {
  return String(folder?.parent?.id || folder?.parent || '')
}

function buildFavoriteTree(folders, rootName) {
  const parentIds = new Set(folders.map(parentFolderId).filter(Boolean))
  return [
    {
      id: FAVORITE_ROOT_ID,
      resourceId: FAVORITE_ROOT_ID,
      name: rootName,
      pId: '',
      isParent: true,
      open: true,
      meta: {
        type: 'node',
        data: { id: FAVORITE_ROOT_ID, is_root: true, value: rootName }
      }
    },
    ...folders.map((folder) => {
      const id = folderId(folder)
      const parentId = parentFolderId(folder)
      return {
        id: folderTreeKey(id),
        resourceId: id,
        name: folder.name,
        pId: parentId ? folderTreeKey(parentId) : FAVORITE_ROOT_ID,
        isParent: parentIds.has(id),
        open: false,
        meta: {
          type: 'node',
          data: { id, is_root: false, value: folder.name }
        }
      }
    })
  ]
}

export default {
  name: 'FavoriteFolderDialog',
  components: { Dialog, TreePanel },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    assetCount: {
      type: Number,
      default: 0
    },
    batch: {
      type: Boolean,
      default: false
    },
    favorite: {
      type: Object,
      default: null
    },
    folders: {
      type: Array,
      default: () => []
    },
    folderId: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: [
    'confirm',
    'folder-created',
    'folder-deleted',
    'folders-refreshed',
    'folder-updated',
    'remove',
    'update:folderId',
    'update:visible'
  ],
  computed: {
    dialogTitle() {
      return this.batch ? this.$t('BatchFavorite') : this.$t('FavoriteAssetDialogTitle')
    },
    favoriteTreeNodes() {
      return buildFavoriteTree(this.folders, this.$t('FavoriteTreeRoot'))
    },
    favoriteTreeDataSource() {
      const dataSource = createUserFavoriteTreeDataSource(this.$axios, 'self', {
        editable: true,
        newFolderName: this.$t('FavoriteFolderDefaultName'),
        onMutated: (operation, folder) => this.handleFolderMutation(operation, folder)
      })
      return {
        ...dataSource,
        root: async ({ signal }) => {
          const response = await this.$axios.get('/api/v1/assets/favorite-folders/', { signal })
          const folders = Array.isArray(response) ? response : response?.results || []
          this.$emit('folders-refreshed', folders)
          return buildFavoriteTree(folders, this.$t('FavoriteTreeRoot'))
        }
      }
    },
    treeSetting() {
      return createXTreeSetting({
        amountTypes: ['node'],
        beforeRemove: (node) => this.confirmFavoriteFolderRemove(node),
        countResource: 'asset',
        dataSource: this.favoriteTreeDataSource,
        edit: { drag: { isMove: false } },
        hasRightMenu: true,
        initialData: this.favoriteTreeNodes,
        initialExpandedKeys: [FAVORITE_ROOT_ID],
        loadMode: X_TREE_LOAD_MODES.EAGER,
        readOnly: false,
        selectPredicate: () => true,
        selectSyncToRoute: false,
        showAssets: false,
        showAmountTooltip: false,
        showCollapse: true,
        showCreate: true,
        showDefaultMenu: true,
        showDelete: (node) => !this.isVirtualRoot(node),
        showMenu: (node) => this.prepareContextMenu(node),
        showRefresh: true,
        showSearch: true,
        searchPlacement: X_TREE_SEARCH_PLACEMENTS.HEADER,
        showUpdate: (node) => !this.isVirtualRoot(node),
        toolsPlacement: 'bottom-end',
        virtualize: true
      })
    },
    selectedFolderId: {
      get() {
        return this.folderId
      },
      set(value) {
        this.$emit('update:folderId', value || '')
      }
    },
    selectedAssetsText() {
      return this.$t('ResourceSelectSelectedCount', {
        count: this.assetCount,
        resource: this.$t('Assets')
      })
    }
  },
  methods: {
    isVirtualRoot(node) {
      return node?.id === FAVORITE_ROOT_ID || node?.meta?.data?.is_root === true
    },
    getFolderId(node) {
      if (this.isVirtualRoot(node)) {
        return FAVORITE_ROOT_ID
      }
      return String(node?.meta?.data?.id || '').trim()
    },
    selectFolder(node) {
      const id = this.getFolderId(node)
      if (!id) {
        return
      }
      this.selectedFolderId = id
    },
    prepareContextMenu(node) {
      this.selectFolder(node)
      return true
    },
    async confirmFavoriteFolderRemove(node) {
      const assetCount = this.$refs.favoriteTree?.getTree()?.getNodeAmount?.(node)
      if (Number.isFinite(assetCount) && assetCount > 0) {
        this.$message.warning(this.$t('FavoriteFolderDeleteBlocked'))
        return false
      }
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
    handleFolderMutation(operation, folder) {
      if (operation === 'create') {
        this.selectedFolderId = String(folder.id)
        this.$emit('folder-created', folder)
      } else if (operation === 'update') {
        this.$emit('folder-updated', folder)
      } else if (operation === 'remove') {
        if (String(folder?.id) === this.selectedFolderId) {
          this.selectedFolderId = ''
        }
        this.$emit('folder-deleted', folder)
      }
    },
    handleTreeReady() {
      if (!this.selectedFolderId) {
        return
      }
      const selectedNode = this.favoriteTreeNodes.find(
        (node) => this.getFolderId(node) === String(this.selectedFolderId)
      )
      this.$nextTick(() => {
        this.$refs.favoriteTree?.selectNode(selectedNode)
      })
    }
  }
}
</script>

<style lang="scss">
.favorite-folder-select-dialog.el-dialog {
  --favorite-folder-dialog-max-height: min(560px, 82vh);
  --favorite-folder-dialog-inline-padding: 16px;

  display: flex;
  flex-direction: column;
  height: var(--favorite-folder-dialog-max-height);
  max-height: var(--favorite-folder-dialog-max-height);

  .el-dialog__header,
  .el-dialog__footer {
    flex: none;
  }

  .el-dialog__footer {
    overflow: hidden;
    padding-right: var(--favorite-folder-dialog-inline-padding) !important;
    padding-left: var(--favorite-folder-dialog-inline-padding) !important;
  }

  .el-dialog__body {
    display: flex;
    flex: 1 1 auto;
    min-height: 0;
    padding: 0 !important;
    overflow: hidden;
    background: var(--el-bg-color, #fff);
  }

  .el-dialog__body > div {
    box-sizing: border-box;
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
  }

  .favorite-folder-select-dialog__header-content {
    box-sizing: border-box;
    display: grid !important;
    grid-template-columns: minmax(0, max-content);
    align-items: baseline;
    column-gap: 6px;
    width: 100%;
    min-width: 0;
    padding-right: 30px;
    overflow: hidden;
    white-space: nowrap;
  }

  .favorite-folder-select-dialog__title {
    display: block !important;
    column-gap: 10px;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .favorite-folder-select-dialog__content {
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--el-bg-color, #fff);
  }

  .favorite-folder-select-dialog__tree-panel {
    --x-tree-toolbar-height: 50px;
    --x-tree-toolbar-padding-block: 10px;
    --x-tree-toolbar-padding-inline: var(--favorite-folder-dialog-inline-padding);
    --x-tree-body-inline-padding: var(--favorite-folder-dialog-inline-padding);
    --x-tree-body-border-top: 0;
    --x-tree-body-separator-space-before: 0;
    --x-tree-body-separator-space-after: 0;

    box-sizing: border-box;
    flex: 1 1 auto;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    min-height: 0;
    overflow: hidden;
    background: var(--el-bg-color, #fff);
  }

  .favorite-folder-select-dialog__tree-panel > .tree-panel__tree {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .dialog-footer {
    box-sizing: border-box;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    overflow: hidden;
  }

  .favorite-folder-select-dialog__selected-count {
    display: inline !important;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    font-weight: 400;
    line-height: 1.4;
    white-space: nowrap;
  }

  .favorite-folder-select-dialog__footer-actions {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    justify-content: flex-end;
    width: 100%;
    max-width: 100%;
    min-width: 0;
    gap: 12px;

    .el-button {
      flex: 0 1 auto;
      box-sizing: border-box;
      max-width: 100%;
      min-width: 0;
      height: auto;
      margin-left: 0;
      white-space: normal;
    }

    .el-button > span {
      white-space: normal;
      overflow-wrap: anywhere;
      text-align: center;
    }
  }
}
</style>
