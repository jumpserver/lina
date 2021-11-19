<template>
  <AutoDataZTree :setting="setting" />
</template>

<script>
import AutoDataZTree from '@/components/AutoDataZTree'

export default {
  name: 'GroupGrantedAssets',
  components: {
    AutoDataZTree
  },
  props: {
    object: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      setting: {
        showAssets: false,
        showMenu: false,
        showRefresh: true,
        treeUrl: '/api/v1/rbac/permissions/tree',
        check: {
          enable: true
        },
        callback: {
          // onRightClick: this.onRightClick.bind(this),
          // onRename: this.onRename.bind(this),
          // onSelected: this.onSelected.bind(this),
          // beforeDrop: this.beforeDrop.bind(this),
          // onDrop: this.onDrop.bind(this),
          // refresh: this.refresh.bind(this)
          // 尚未定义的函数
          // beforeClick
          // beforeDrag
          // onDrag
          // beforeAsync: this.defaultCallback.bind(this, 'beforeAsync')
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
