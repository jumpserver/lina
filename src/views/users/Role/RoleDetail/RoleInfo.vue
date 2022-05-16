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
import { IBox } from '@/components'
import DetailCard from '@/components/DetailCard'
import AutoDataZTree from '@/components/AutoDataZTree'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'RolePerms',
  components: {
    AutoDataZTree,
    DetailCard,
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
          onCheck: _.debounce((event, treeId, treeNode) => {
            // 选择后，更新按钮可用
            vm.setUpdateBtn()
            vm.checkActionDeps(treeNode)
            vm.checkSpecDeps()
          }, 200),
          beforeCheck: (treeId, treeNode) => {
            return true
          },
          onClick: _.debounce((event, treeId, treeNode) => {
            vm.ztree.expandNode(treeNode)
          }, 100)
        }
      },
      nodesDeps: {
        'view_console': ['rbac.view_console'],
        'view_audit': ['rbac.view_audit'],
        'view_workbench': ['rbac.view_workbench'],
        'view_setting': ['settings.view_setting'],
        'cloud_import': ['assets.view_asset'],
        'terminal_node': ['settings.change_terminal'],
        'rbac.orgrolebinding': ['rbac.view_orgrole', 'users.view_user'],
        'rbac.systemrolebinding': ['rbac.view_systemrole', 'users.view_user'],
        'tickets.change_ticketflow': ['users.view_user', 'tickets.view_ticket'],
        'tickets.view_ticket': [
          'assets.match_asset', 'assets.match_node', 'assets.match_systemuser',
          'applications.match_application', 'rbac.view_workbench'
        ],
        'tickets.view_ticketflow': ['tickets.view_ticket'],
        'users.invite_user': [
          'users.match_user', 'rbac.add_orgrolebinding',
          'rbac.view_orgrolebinding', 'rbac.view_orgrole'
        ],
        'acls.loginacl': ['users.view_user'],
        'acls.loginassetacl': ['users.view_user'],
        'assets.view_asset': ['assets.view_node'],
        'assets.commandfilterrule': ['assets.view_commandfilter'],
        'assets.gateway': ['assets.view_domain'],
        'assets.add_asset': ['assets.view_platform'],
        'assets.change_asset': ['assets.view_platform'],
        'assets.view_authbook': ['assets.view_node'],
        'assets.gathereduser': ['assets.view_node'],
        'assets.refresh_assethardwareinfo': ['assets.change_asset'],
        'xpack.gatherusertaskexecution': ['xpack.view_gatherusertask'],
        'applications.add_application': ['assets.view_asset'],
        'applications.view_account': ['applications.view_application'],
        'perms.view_assetpermission': ['assets.view_node'],
        'perms.view_applicationpermission': ['applications.view_application'],
        'perms.assetpermission': [
          'assets.view_asset', 'assets.view_node', 'assets.view_systemuser',
          'users.view_user', 'users.view_usergroup'
        ],
        'perms.applicationpermission': [
          'applications.view_application', 'assets.view_systemuser',
          'users.view_user', 'users.view_usergroup'
        ],
        'settings.change_systemmsgsubscription': ['users.view_user'],
        'terminal.add_terminal': ['terminal.view_commandstorage', 'terminal.view_replaystorage'],
        'terminal.change_terminal': ['terminal.view_commandstorage', 'terminal.view_replaystorage'],
        'terminal.view_commandstroage': ['settings.change_terminal'],
        'terminal.view_replaystorage': ['settings.change_terminal'],
        'terminal.view_status': ['settings.change_terminal'],
        'terminal.view_task': ['settings.change_terminal'],
        'terminal.view_terminal': ['settings.change_terminal'],
        'xpack.add_syncinstancetask': [
          'assets.view_asset', 'assets.view_node', 'assets.view_systemuser',
          'xpack.view_account'
        ],
        'xpack.view_syncinstancetask': ['xpack.view_account'],
        'xpack.view_syncinstancedetail': ['xpack.view_syncinstancetask'],
        'xpack.view_syncinstancetaskexecution': ['xpack.view_syncinstancetask'],
        'xpack.view_changeauthplan': ['assets.view_asset'],
        'xpack.view_changeauthplantask': ['xpack.view_changeauthplan'],
        'xpack.view_changeauthplanexecution': ['xpack.view_changeauthplan'],
        'xpack.view_applicationchangeauthplan': ['applications.view_application', 'assets.view_systemuser'],
        'xpack.view_applicationchangeauthplantask': ['xpack.view_applicationchangeauthplan'],
        'xpack.view_applicationchangeauthplanexecution': ['xpack.view_applicationchangeauthplan']
      }
    }
  },
  computed: {
    ztree() {
      return this.$refs.tree.zTree
    },
    scope() {
      return this.object.scope
    },
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
    setUpdateBtn() {
      const permRequired = `rbac.change_${this.object.scope}role`
      if (this.$hasPerm(permRequired)) {
        this.isDisabled = false
      }
    },
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
    checkActionDeps(node) {
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
    checkSpecDeps() {
      const ztree = this.$refs.tree.zTree
      const depsId = ztree.getCheckedNodes().filter(i => {
        return !!this.nodesDeps[i.title]
      }).reduce((result, v) => {
        return [...result, ...this.nodesDeps[v.title]]
      }, [])
      this.$log.debug('Select nodes should try: ', depsId)

      for (const i of depsId) {
        const depNode = this.ztree.getNodeByParam('title', i)
        if (!depNode) {
          this.$log.debug(`Not found depNode for title: ${i}`)
          continue
        }
        this.ztree.checkNode(depNode, true)
      }
    },
    updatePermissions() {
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
