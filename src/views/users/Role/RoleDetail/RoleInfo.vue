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
            vm.checkDeps(event, treeNode)
            vm.checkViewNodeIfNeed()
          },
          onSelected() {
          }
        }
      },
      viewPermMapper: [
        ['view_console', ['rbac.view_console', 'rbac.view_dashboard']],
        ['view_audit', ['rbac.view_audit', 'rbac.view_dashboard']],
        ['view_workspace', ['rbac.view_workspace']]
      ]
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
    parsePerm(perm) {
      if (!perm) {
        this.$log.debug('No app code: ', perm)
        return
      }
      const [app, code] = perm.split('.')
      if (!app || !code) {
        this.$log.debug('App or code not found')
        return
      }
      const [action, resource] = code.split('_')
      if (!action || !resource) {
        return
      }
      return { action, resource, app }
    },
    checkDeps(evt, node) {
      if (node.isParent) {
        this.$log.debug('Is parent')
        return
      }
      const data = this.parsePerm(node.title)
      if (!data) {
        this.$log.error('Parse perm error: ', node.title)
        return
      }

      const { app, action, resource } = data
      const ztree = this.$refs.tree.zTree
      const viewId = `${app}.view_${resource}`
      const viewNode = ztree.getNodeByParam('title', viewId)
      if (!viewNode) {
        return
      }

      const viewIgnoreAction = ['match']
      const checked = node.checked
      if (action === 'view') {
        // 选中 view node 不需要处理, 不选中的话去掉 兄弟节点选中
        if (checked) {
          return
        }
        const parent = viewNode.getParentNode()
        const actionNodes = parent.children
        for (const node of actionNodes) {
          const d = this.parsePerm(node.title)
          if (!d) {
            continue
          }
          const { action: act, resource: res } = d
          // 忽略的 action 不用处理, resource 不相同的不用处理
          this.$log.debug('Action: ', act, d)
          if (act === 'view' || viewIgnoreAction.indexOf(act) > -1 || res !== resource) {
            continue
          }
          ztree.checkNode(node, false)
        }
      } else if (viewIgnoreAction.indexOf(action) > -1) {
        this.$log.debug('Action is ignore: ', action)
      } else {
        if (!checked) {
          return
        }
        this.$log.debug('Select view node: ', viewNode)
        ztree.checkNode(viewNode, true)
      }
    },
    checkViewNodeIfNeed() {
      const ztree = this.$refs.tree.zTree
      for (const [viewId, permIds] of this.viewPermMapper) {
        const viewNode = ztree.getNodeByParam('id', viewId)
        const permNodes = permIds.map(i => ztree.getNodeByParam('title', i))
        if (!viewNode || permNodes.length === 0) {
          this.$log.debug('Not view node or perms nodes length 0')
          continue
        }
        const nodeStatus = viewNode.getCheckStatus()
        const viewStatus = nodeStatus.checked || nodeStatus.half
        for (const permNode of permNodes) {
          ztree.checkNode(permNode, viewStatus)
        }
      }
      return Promise.resolve(true)
    },
    updatePermissions() {
      this.checkViewNodeIfNeed().then(() => {
        const ztree = this.$refs.tree.zTree
        const checkedNodes = ztree.getCheckedNodes()
        const permNodes = checkedNodes.filter(node => !node.isParent)
        const permIds = []
        for (const permNode of permNodes) {
          let id = permNode.id
          if (id.indexOf('#') !== -1) {
            id = id.split('#')[1]
          }
          permIds.push(id)
        }
        // const permIds = permNodes.map(node => node.id)

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
