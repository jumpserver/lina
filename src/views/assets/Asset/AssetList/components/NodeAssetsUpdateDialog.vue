<template>
  <div class="asset-select-dialog">
    <AssetDialog
      v-if="iVisible"
      :title="$tc('assets.Assets')"
      :visible.sync="iVisible"
      @cancel="assetTreeTableDialogHandleCancel"
      @confirm="assetTreeTableDialogHandleConfirm($event)"
    />
  </div>
</template>

<script>
import AssetDialog from '@/components/AssetSelect/dialog.vue'
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
  data() {
    return {
      dialogVisible: false
    }
  },
  computed: {
    iVisible: {
      set(val) {
        this.$parent?.hideMenu()
        this.$emit('update:visible', val)
      },
      get() {
        return this.visible
      }
    }
  },
  methods: {
    assetTreeTableDialogHandleConfirm(assetsSelected) {
      const currentNode = this.selectNode
      if (!currentNode || assetsSelected.length === 0) {
        return
      }
      let url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/add/`
      if (this.action === 'move') {
        url = `/api/v1/assets/nodes/${currentNode.meta.data.id}/assets/replace/`
      }
      this.$axios.put(
        url, { assets: assetsSelected }
      ).then(res => {
        this.iVisible = false
        this.assetsSelected = []
        $('#tree-refresh').trigger('click')
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(error => {
        this.$parent?.hideMenu()
        this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + error))
      })
    },
    assetTreeTableDialogHandleCancel() {
      this.iVisible = false
    }
  }
}
</script>

<style scoped>

</style>
