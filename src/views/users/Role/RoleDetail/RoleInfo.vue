<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    <template #right>
      <IBox :title="$tc('Permissions')">
        <div style="height: 10%">
          <el-button
            :disabled="isDisabled"
            size="small"
            style="float: right; width: 100%"
            type="primary"
            @click="updatePermissions"
          >
            {{ $t('Update') }}
          </el-button>
        </div>
        <div class="tree-zone">
          <div class="perm-tree">
            <AutoDataZTree v-if="!loading" ref="tree" :setting="setting" />
          </div>
        </div>
      </IBox>
    </template>
  </TwoCol>
</template>

<script>
import { IBox } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import AutoDataZTree from '@/components/Tree/AutoDataZTree'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import _ from 'lodash'
import { auditReportPermissions } from '@/views/reports/center/permissions'

export default {
  name: 'RolePerms',
  components: {
    TwoCol,
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
          onCheck: (event, treeId, treeNode) => {
            // 选择后，更新按钮可用
            vm.setUpdateBtn()
            vm.checkPermissionDeps(treeNode)
          },
          beforeCheck: (treeId, treeNode) => {
            return true
          },
          onClick: _.debounce((event, treeId, treeNode) => {
            vm.ztree.expandNode(treeNode)
          }, 100)
        }
      },
      nodesDeps: {
        ...Object.fromEntries(
          Object.values(auditReportPermissions).map((permission) => [
            permission,
            ['rbac.view_audit']
          ])
        ),
        view_console: [],
        view_audit: [],
        view_pam: [],
        view_workbench: [
          'authentication.view_connectiontoken',
          'authentication.add_connectiontoken',
          'authentication.expire_connectiontoken',
          'authentication.reuse_connectiontoken'
        ],
        view_setting: ['settings.view_setting'],
        'accounts.view_accountsession': ['terminal.view_session'],
        cloud_import: ['assets.view_asset', 'assets.view_platform'],
        terminal_node: ['settings.change_terminal'],
        'rbac.orgrolebinding': ['rbac.view_orgrole', 'users.view_user'],
        'rbac.systemrolebinding': ['rbac.view_systemrole', 'users.view_user'],
        'tickets.change_ticketflow': ['users.view_user', 'tickets.view_ticket'],
        'tickets.view_ticket': [
          'assets.match_asset',
          'assets.match_node',
          'assets.match_systemuser',
          'applications.match_application',
          'rbac.view_workbench'
        ],
        'terminal.view_sessionreplay': ['terminal.view_command'],
        'rbac.view_filemanager': ['perms.view_myassets'],
        'tickets.view_ticketflow': ['tickets.view_ticket'],
        'users.add_user': ['rbac.view_role'],
        'users.change_user': ['rbac.view_role'],
        'users.invite_user': [
          'users.match_user',
          'rbac.add_orgrolebinding',
          'rbac.view_orgrolebinding',
          'rbac.view_orgrole'
        ],
        'acls.loginacl': ['users.view_user'],
        'acls.loginassetacl': ['users.view_user'],
        'acls.commandfilteracl': ['users.view_user'],
        'assets.view_asset': ['assets.view_platform'],
        'accounts.view_checkaccountexecution': ['accounts.view_checkaccountautomation'],
        'accounts.add_integrationapplication': ['accounts.view_account'],
        'accounts.change_integrationapplication': ['accounts.view_account'],
        'accounts.add_checkaccountexecution': ['accounts.view_checkaccountautomation'],
        'accounts.view_changesecretexecution': ['accounts.view_changesecretautomation'],
        'accounts.add_changesecretexecution': ['accounts.view_changesecretautomation'],
        'accounts.view_changesecretrecord': ['accounts.view_changesecretautomation'],
        'accounts.view_pushaccountexecution': ['accounts.view_pushaccountautomation'],
        'accounts.add_pushaccountexecution': ['accounts.view_pushaccountautomation'],
        'accounts.view_pushsecretrecord': ['accounts.view_pushaccountautomation'],
        'accounts.view_backupaccountexecution': ['accounts.view_backupaccountautomation'],
        'accounts.add_backupaccountexecution': ['accounts.view_backupaccountautomation'],
        'accounts.view_gatheraccountsexecution': ['accounts.view_gatheraccountsautomation'],
        'accounts.add_gatheraccountsexecution': ['accounts.view_gatheraccountsautomation'],
        'accounts.view_gatheraccountsautomation': ['accounts.view_gatheredaccount'],
        'assets.view_node': ['assets.view_asset', 'assets.view_platform'],
        'acls.commandgroup': ['acls.view_commandfilteracl'],
        'assets.gateway': ['assets.view_zone'],
        'assets.add_gateway': ['assets.view_zone', 'assets.view_platform', 'assets.view_node'],
        'assets.change_gateway': ['assets.view_zone', 'assets.view_platform', 'assets.view_node'],
        'assets.add_asset': ['assets.view_platform'],
        'assets.change_asset': ['assets.view_platform'],
        'accounts.view_gatheredaccount': ['assets.view_asset', 'assets.view_node'],
        'accounts.view_accounttemplate': ['accounts.view_account'],
        'accounts.view_account': ['assets.view_node'],
        'accounts.view_accountsecret': ['accounts.view_account'],
        'accounts.view_historyaccount': ['accounts.view_account', 'accounts.view_accountsecret'],
        'accounts.view_accounttemplatesecret': ['accounts.view_accounttemplate'],
        'accounts.view_historyaccountsecret': [
          'accounts.view_account',
          'accounts.view_accountsecret'
        ],
        'accounts.add_account': ['assets.view_asset'],
        'assets.gathereduser': ['assets.view_node'],
        'assets.refresh_assethardwareinfo': ['assets.change_asset'],
        'xpack.gatherusertaskexecution': ['xpack.view_gatherusertask'],
        'applications.add_application': ['assets.view_asset'],
        'applications.view_account': ['applications.view_application'],
        'perms.view_assetpermission': ['assets.view_node'],
        'perms.view_applicationpermission': ['applications.view_application'],
        'perms.assetpermission': [
          'assets.view_asset',
          'assets.view_node',
          'assets.view_systemuser',
          'users.view_user',
          'users.view_usergroup'
        ],
        'perms.applicationpermission': [
          'applications.view_application',
          'assets.view_systemuser',
          'users.view_user',
          'users.view_usergroup'
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
        'ops.view_job': [
          'assets.view_asset',
          'assets.view_node',
          'ops.view_adhoc',
          'ops.view_playbook'
        ],
        'ops.change_job': [
          'assets.view_asset',
          'assets.view_node',
          'ops.view_adhoc',
          'ops.view_playbook'
        ],
        'ops.add_job': [
          'assets.view_asset',
          'assets.view_node',
          'ops.view_adhoc',
          'ops.view_playbook'
        ],
        'ops.add_jobexecution': ['ops.view_celerytaskexecution'],
        'rbac.view_webterminal': ['authentication.add_connectiontoken'],
        'labels.view_labeledresource': ['rbac.view_contenttype'],
        'xpack.add_syncinstancetask': [
          'assets.view_asset',
          'assets.view_node',
          'assets.view_systemuser',
          'xpack.view_cloudaccount'
        ],
        'xpack.view_syncinstancetask': ['xpack.view_cloudaccount'],
        'xpack.view_syncinstancedetail': ['xpack.view_syncinstancetask'],
        'xpack.view_syncinstancetaskexecution': ['xpack.view_syncinstancetask'],
        'xpack.view_changeauthplan': ['assets.view_asset'],
        'xpack.view_changeauthplantask': ['xpack.view_changeauthplan'],
        'xpack.view_changeauthplanexecution': ['xpack.view_changeauthplan'],
        'xpack.view_applicationchangeauthplan': [
          'applications.view_application',
          'assets.view_systemuser'
        ],
        'xpack.view_applicationchangeauthplantask': ['xpack.view_applicationchangeauthplan'],
        'xpack.view_applicationchangeauthplanexecution': ['xpack.view_applicationchangeauthplan']
      },
      url: `/api/v1/rbac/${this.object.scope.value}-roles/${this.object.id}/`,
      detailFields: [
        'display_name',
        'scope_display',
        'builtin',
        'created_by',
        'date_created',
        'date_updated',
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
    checkPermissionDeps(treeNode) {
      const ztree = this.ztree
      const nodes = ztree.transformToArray(ztree.getNodes()).filter((node) => !node.isParent)
      const dependencies = new Map(
        nodes.map((node) => {
          // 分组依赖适用于其下的每个权限，半选分组也不例外。
          const deps = node.getPath().flatMap((parent) => this.nodesDeps[parent.title] || [])
          const perm = this.parsePerm(node.title)
          if (perm && !['view', 'match'].includes(perm.action)) {
            deps.push(`${perm.app}.view_${perm.resource}`)
          }
          return [node, deps]
        })
      )
      const checked = treeNode.checked
      const pending = ztree.transformToArray([treeNode]).filter((node) => !node.isParent)
      const visited = new Set()
      while (pending.length) {
        const node = pending.pop()
        if (visited.has(node) || node.chkDisabled) {
          continue
        }
        visited.add(node)
        const related = checked
          ? nodes.filter((item) => dependencies.get(node).includes(item.title))
          : nodes.filter((item) => dependencies.get(item).includes(node.title))
        for (const item of related) {
          if (item.chkDisabled) {
            continue
          }
          ztree.checkNode(item, checked, true)
          pending.push(item)
        }
      }
    },
    updatePermissions() {
      const ztree = this.$refs.tree.zTree
      const checkedNodes = ztree.getCheckedNodes()
      const permNodes = checkedNodes.filter((node) => !node.isParent)
      const permIds = permNodes.map((node) => node.id)
      const roleDetailUrl = `/api/v1/rbac/${this.object.scope.value}-roles/${this.object.id}/`
      const data = {
        permissions: permIds
      }
      this.$axios
        .patch(roleDetailUrl, data)
        .then(() => {
          this.$message.success(this.$tc('UpdateSuccessMsg'))
        })
        .catch((error) => {
          this.$message.error(this.$tc('UpdateErrorMsg') + error)
          this.$log.error(error)
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.perm-tree {
  :deep(.ztree) {
    background: white !important;

    .checkbox_false_disable,
    .checkbox_true_disable {
      cursor: not-allowed !important;
    }

    .checkbox_true_disable:before,
    .checkbox_false_disable:before {
      color: #aaaaaa !important;
    }
  }
}
</style>
