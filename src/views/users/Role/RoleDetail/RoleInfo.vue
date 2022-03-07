<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <IBox :title="$t('rbac.Permissions')">
        <div style="height: 10%">
          <el-button
            size="small"
            type="primary"
            style="width: 100%;"
            :disabled="isDisabled"
            @click="updatePermissions"
          >
            {{ $t('common.Update') }}
          </el-button>
        </div>
        <div class="perm-tree">
          <AutoDataZTree v-if="!loading" ref="tree" :setting="setting" />
        </div>
      </IBox>
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { IBox } from '@/components'
import AutoDataZTree from '@/components/AutoDataZTree'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'RoleInfo',
  components: {
    DetailCard,
    AutoDataZTree,
    IBox
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
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
          onCheck(event, treeId, treeNode) {
            // 选择后，更新按钮可用
            vm.$nextTick(() => {
              vm.isDisabled = false
            })
          },
          onSelected() {
          }
        }
      }
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$t('common.Name'),
          value: this.object.display_name
        },
        {
          key: this.$t('common.Scope'),
          value: this.object['scope_display']
        },
        {
          key: this.$t('common.Builtin'),
          value: this.object['builtin']
        },
        {
          key: this.$t('common.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('common.DateCreated'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('common.DateUpdated'),
          value: toSafeLocalDateStr(this.object.date_updated)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  mounted() {
    this.setting.treeUrl = `/api/v1/rbac/${this.object.scope}-roles/${this.object.id}/permissions/tree/`
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    checkViewNodeIfNeed() {
      const ztree = this.$refs.tree.zTree
      const viewPermMapper = [
        ['view_console', 'rbac.view_adminview'],
        ['view_audit', 'rbac.view_auditview'],
        ['view_workspace', 'rbac.view_userview']
      ]
      for (const [viewId, permId] of viewPermMapper) {
        const viewNode = ztree.getNodeByParam('id', viewId)
        const permNode = ztree.getNodeByParam('title', permId)
        if (!viewNode || !permNode) {
          continue
        }
        const nodeStatus = viewNode.getCheckStatus()
        const viewStatus = nodeStatus.checked || nodeStatus.half
        ztree.checkNode(permNode, viewStatus)
      }
      return Promise.resolve(true)
    },
    updatePermissions() {
      this.checkViewNodeIfNeed().then(() => {
        const ztree = this.$refs.tree.zTree
        const checkedNodes = ztree.getCheckedNodes()
        const permNodes = checkedNodes.filter(node => !node.isParent)
        const permIds = permNodes.map(node => node.id)

        const roleDetailUrl = `/api/v1/rbac/${this.object.scope}-roles/${this.object.id}/`
        const data = {
          permissions: permIds
        }
        this.$axios.patch(roleDetailUrl, data).then(() => {
          this.$message.success(this.$t('common.updateSuccessMsg'))
        }).catch(error => {
          this.$message.error(this.$t('common.updateErrorMsg') + error)
          this.$log.error(error)
        })
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.perm-tree >>> .ztree * {
  background: white;
}
.perm-tree >>> .ztree {
  background: white !important;
}
.perm-tree >>> .checkbox_true_disable,
.perm-tree >>> .checkbox_false_disable {
  cursor: not-allowed!important;
}
.perm-tree >>> .checkbox_true_disable:before,
.perm-tree >>> .checkbox_false_disable:before  {
  color: #aaaaaa!important;
}
</style>
