<template>
  <div class="row">
    <div style="height: 10%">
      <el-button
        size="small"
        type="primary"
        style="width: 220px;"
        :disabled="isDisabled"
        @click="updatePermissions"
      >
        {{ $t('common.Update') }}
      </el-button>
    </div>
    <div class="el-col-12 perm-tree" style="height: 80%">
      <AutoDataZTree v-if="!loading" ref="tree" :setting="setting" />
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
    const vm = this
    return {
      loading: true,
      isDisabled: true,
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
          onCheck(event, treeId, treeNode) {
            const checked = treeNode.checked
            vm.$nextTick(() => {
              vm.isDisabled = false
            })
            console.log('on check click: ', checked)
          },
          onSelected() {
          }
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
    this.setting.treeUrl = `/api/v1/rbac/roles/${this.object.id}/permissions/tree/`
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    updatePermissions() {
      const ztree = this.$refs.tree.zTree
      const checkedNodes = ztree.getCheckedNodes()
      const permNodes = checkedNodes.filter(node => !node.isParent)
      const permIds = permNodes.map(node => node.id)

      const roleDetailUrl = `/api/v1/rbac/roles/${this.object.id}/`
      const data = {
        permissions: permIds
      }
      this.$axios.patch(roleDetailUrl, data).then(() => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$t('common.updateErrorMsg') + error)
        this.$log.error(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.perm-tree >>> .ztree {
  //background: white;

  //* {
  //  background: white;
  //}
}

</style>
