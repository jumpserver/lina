<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <IBox :title="$tc('rbac.Permissions')">
        <div style="height: 10%">
          <el-button
            :disabled="isDisabled"
            size="small"
            style="width: 100%;"
            type="primary"
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
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import AutoDataZTree from '@/components/Tree/AutoDataZTree'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'RolePerms',
  components: {
    AutoDataZTree,
    AutoDetailCard,
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
        showSearch: false,
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
        'view_console': [],
        'view_audit': [],
        'view_workbench': [
          'authentication.view_connectiontoken', 'authentication.add_connectiontoken',
          'authentication.expire_connectiontoken', 'authentication.reuse_connectiontoken',
          'ops.view_adhoc'
        ],
        'view_setting': ['settings.view_setting'],
        'cloud_import': ['assets.view_asset', 'assets.view_platform'],
        'terminal_node': ['settings.change_terminal'],
        'rbac.orgrolebinding': ['rbac.view_orgrole', 'users.view_user'],
        'rbac.systemrolebinding': ['rbac.view_systemrole', 'users.view_user'],
        'tickets.change_ticketflow': ['users.view_user', 'tickets.view_ticket'],
        'tickets.view_ticket': [
          'assets.match_asset', 'assets.match_node', 'assets.match_systemuser',
          'applications.match_application', 'rbac.view_workbench'
        ],
        'tickets.view_ticketflow': ['tickets.view_ticket'],
        'users.add_user': ['rbac.view_role'],
        'users.change_user': ['rbac.view_role'],
        'users.invite_user': [
          'users.match_user', 'rbac.add_orgrolebinding',
          'rbac.view_orgrolebinding', 'rbac.view_orgrole'
        ],
        'acls.loginacl': ['users.view_user'],
        'acls.loginassetacl': ['users.view_user'],
        'acls.commandfilteracl': ['users.view_user'],
        'assets.view_asset': ['assets.view_platform'],
        'assets.view_node': ['assets.view_asset', 'assets.view_platform'],
        'acls.commandgroup': ['acls.view_commandfilteracl'],
        'assets.gateway': ['assets.view_domain'],
        'assets.add_gateway': ['assets.view_domain', 'assets.view_platform', 'assets.view_node'],
        'assets.change_gateway': ['assets.view_domain', 'assets.view_platform', 'assets.view_node'],
        'assets.add_asset': ['assets.view_platform'],
        'assets.change_asset': ['assets.view_platform'],
        'accounts.view_gatheredaccount': ['assets.view_asset', 'assets.view_node'],
        'accounts.view_account': ['assets.view_node'],
        'accounts.view_accountsecret': ['accounts.view_account'],
        'accounts.view_historyaccount': ['accounts.view_account', 'accounts.view_accountsecret'],
        'accounts.view_accounttemplatesecret': ['accounts.view_accounttemplate'],
        'accounts.change_accounttemplatesecret': ['accounts.view_accounttemplate'],
        'accounts.view_historyaccountsecret': ['accounts.view_account', 'accounts.view_accountsecret'],
        'accounts.add_account': ['assets.view_asset'],
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
        'terminal.add_applethost': ['assets.view_platform'],
        'terminal.change_applethost': ['assets.view_platform'],
        'ops.view_job': ['assets.view_asset', 'assets.view_node', 'ops.view_adhoc', 'ops.view_playbook'],
        'ops.change_job': ['assets.view_asset', 'assets.view_node', 'ops.view_adhoc', 'ops.view_playbook'],
        'ops.add_job': ['assets.view_asset', 'assets.view_node', 'ops.view_adhoc', 'ops.view_playbook'],
        'ops.add_jobexecution': ['ops.view_celerytaskexecution'],
        'authentication.add_connectiontoken': ['rbac.view_webterminal'],
        'labels.view_labeledresource': ['rbac.view_contenttype'],
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
      },
      url: `/api/v1/rbac/${this.object.scope.value}-roles/${this.object.id}`,
      detailFields: [
        'display_name', 'scope_display', 'builtin', 'created_by',
        {
          key: this.$t('common.DateCreated'),
          formatter: (item, val) => {
            return <span> {toSafeLocalDateStr(this.object.date_created)}</span>
          }
        },
        {
          key: this.$t('common.DateUpdated'),
          formatter: (item, val) => {
            return <span> {toSafeLocalDateStr(this.object.date_updated)}</span>
          }
        },
        'comment'
      ]
    }
  },
  computed: {
    ztree() {
      return this.$refs.tree.zTree
    },
    scope() {
      return this.object.scope.value
    }
  },
  mounted() {
    this.setting.treeUrl = `/api/v1/rbac/${this.object.scope.value}-roles/${this.object.id}/permissions/tree/`
  },
  activated() {
    this.loading = true
    setTimeout(() => {
      this.loading = false
    })
  },
  methods: {
    setUpdateBtn() {
      const permRequired = `rbac.change_${this.object.scope.value}role`
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
      const roleDetailUrl = `/api/v1/rbac/${this.object.scope.value}-roles/${this.object.id}/`
      const data = {
        permissions: permIds
      }
      this.$axios.patch(roleDetailUrl, data).then(() => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(error => {
        this.$message.error(this.$tc('common.updateErrorMsg') + error)
        this.$log.error(error)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.perm-tree > > > .ztree * {
  background: white;
}

.perm-tree > > > .ztree {
  background: white !important;
}

.perm-tree > > > .checkbox_true_disable,
.perm-tree > > > .checkbox_false_disable {
  cursor: not-allowed !important;
}

.perm-tree > > > .checkbox_true_disable:before,
.perm-tree > > > .checkbox_false_disable:before {
  color: #aaaaaa !important;
}
</style>
