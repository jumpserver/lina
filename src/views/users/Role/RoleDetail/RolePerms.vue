<template>
  <div class="row">
    <div class="el-col-12">
      <AutoDataZTree v-if="!loading" :setting="setting" />
    </div>
    <div class="el-col-12" style="background-color: white;">
      <span>Hello</span>
    </div>
  </div>
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
      loading: true,
      setting: {
        showAssets: false,
        showMenu: false,
        showRefresh: true,
        treeUrl: '',
        check: {
          enable: true
        },
        async: {
          enable: false
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
  },
  computed: {
  },
  mounted() {
    this.setting.treeUrl = `/api/v1/rbac/permissions/tree/?role=${this.object.id}`
    setTimeout(() => {
      this.loading = false
    })
  }
}
</script>

<style scoped>

</style>
