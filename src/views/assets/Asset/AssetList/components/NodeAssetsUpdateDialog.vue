<template>
  <div class="asset-select-dialog">
    <AssetDialog
      v-if="visible"
      :base-url="assetsUrl"
      :title="$tc('Assets')"
      :visible="visible"
      @cancel="assetTreeTableDialogHandleCancel"
      @confirm="assetTreeTableDialogHandleConfirm"
      @update:visible="handleVisibleChange"
    />
  </div>
</template>

<script>
import AssetDialog from '@/components/Apps/AssetSelect/dialog.vue'
import $ from '@/utils/jquery-vendor'

export default {
  name: 'NodeAssetsUpdate',
  components: {
    AssetDialog
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    action: {
      type: String,
      default: 'add'
    },
    selectNode: {
      type: Object,
      default: null
    }
  },
  emits: ['update:visible'],
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    assetsUrl() {
      if (this.action === 'remove') {
        return '/api/v1/assets/assets/?node_id=' + this.selectNode.meta.data.id
      } else {
        return `/api/v1/assets/assets/`
      }
    }
  },
  methods: {
    handleVisibleChange(val) {
      this.$parent?.hideMenu()
      this.$emit('update:visible', val)
    },
    assetTreeTableDialogHandleConfirm(assetsSelected) {
      if (!assetsSelected) {
        return
      }
      const currentNode = this.selectNode
      if (!currentNode || assetsSelected.length === 0) {
        return
      }
      let url
      switch (this.action) {
        case 'add':
          url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/add/`
          break
        case 'move':
          url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/replace/`
          break
        case 'remove':
          url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/remove/`
          break
        default:
          return
      }
      this.$axios.put(
        url, { assets: assetsSelected }
      ).then(res => {
        this.$emit('update:visible', false)
        this.assetsSelected = []
        $('#tree-refresh').trigger('click')
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(error => {
        this.$parent?.hideMenu()
        this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + error))
      })
    },
    assetTreeTableDialogHandleCancel() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style scoped>

</style>
