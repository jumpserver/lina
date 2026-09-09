<template>
  <UserAssetSelectDialog
    v-if="visible"
    :can-select="canSelectAsset"
    settings-cache-key="favorite-assets-dialog"
    :title="dialogTitle"
    :visible="visible"
    @cancel="handleCancel"
    @confirm="handleConfirm"
    @update:visible="$emit('update:visible', $event)"
  />
</template>

<script>
import UserAssetSelectDialog from '@/components/Apps/GrantedAssets/UserAssetSelectDialog.vue'

export default {
  name: 'FavoriteAssetsToFolderDialog',
  components: { UserAssetSelectDialog },
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
