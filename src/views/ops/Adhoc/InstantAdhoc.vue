<template>
  <el-collapse-transition>
    <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
      <el-form ref="form" label-width="80px">
        <el-form-item label="选择资产">
          <el-input />
        </el-form-item>
        <el-form-item label="选择账号">
          <el-input />
        </el-form-item>
      </el-form>
      <div :style="iShowTree?('display: flex;width: 80%;'):('display: flex;width:100%;')">
        <IBox class="transition-box" style="width: calc(100% - 17px);">
          <div style="margin-bottom: 20px">
            <CodeEditor />
          </div>
          Output
          <Term ref="xterm" />
        </IBox>
      </div>
    </div>
  </el-collapse-transition>
</template>

<script>
import Term from '@/components/Term'
import IBox from '@/components/IBox'
import CodeEditor from '@/components/FormFields/CodeEditor'

export default {
  name: 'CommandExecution',
  components: {
    Term,
    IBox,
    CodeEditor
  },
  data() {
    return {
      languageOptions: [
        {
          label: 'Shell',
          value: 'shell'
        },
        {
          label: 'Python',
          value: 'python'
        },
        {
          label: 'Ruby',
          value: 'ruby'
        },
        {
          label: 'PowerShell',
          value: 'powershell'
        }
      ],
      DataZTree: 0,
      codeMirrorOptions: {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'shell'
      },
      treeSetting: {
        treeUrl: '/api/v1/perms/users/nodes-with-assets/tree/',
        showRefresh: true,
        showMenu: false,
        showSearch: true,
        customTreeHeader: true,
        check: {
          enable: true
        },
        view: {
          dblClickExpand: false,
          showLine: true
        },
        data: {
          simpleData: {
            enable: true
          }
        },
        edit: {
          enable: true,
          showRemoveBtn: false,
          showRenameBtn: false,
          drag: {
            isCopy: true,
            isMove: true
          }
        },
        callback: {
          onCheck: this.onCheck.bind(this)
        },
        async: {
          enable: false
        }
      },
      iShowTree: true,
      actions: '',
      options: [],
      ws: '',
      wsConnected: false
    }
  },
  computed: {
    codemirror() {
      return this.$refs.myCm.codemirror
    },
    zTree() {
      return this.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree.zTree
    },
    xterm() {
      return this.$refs.xterm.xterm
    }
  },
  mounted() {
    this.fetchAccountUsernames()
    this.xterm.write(this.$t('ops.selectAssetsMessage'))
    this.enableWS()
  },
  methods: {
    fetchAccountUsernames() {
      const temp = {}
      this.$axios.get('/api/v1/assets/accounts/',).then(data => {
        data.forEach((item) => {
          temp[item.username] = {}
        })
        for (const key of Object.keys(temp)) {
          this.accountConfig.usernameOptions.push({ 'label': key, 'value': key })
        }
      })
    },
    onChangeLanguage() {
      this.codemirror.setOption('mode', this.scriptMeta.language)
    },
    onOpenScriptListDialog() {
      this.showScriptListDialog = true
    },
    onOpenScriptSaveDialog() {
      this.showScriptAddDialog = true
    },
    onOpenAccountPolicyDialog() {
      this.showAccountPolicyDialog = true
    },
    onSelectScript(scriptId) {
      this.$axios.get(`/api/v1/ops/scripts/${scriptId}`).then((data) => {
        this.scriptMeta.content = data['content']
      })
    },
    onSelectAccountPolicy(policy) {
      this.accountConfig.accountPolicy = policy
    },
    getSelectedAssetsNode() {
      const nodes = this.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree.getCheckedNodes()
      const assetsNode = []
      nodes.forEach(function(node) {
        if (node.meta.type === 'asset' && !node.isHidden) {
          assetsNode.push(node)
        }
      })
      return assetsNode
    },
    onCheck(e, treeId, treeNode) {
      const nodes = this.getSelectedAssetsNode()
      const nodes_names = nodes.map(function(node) {
        return node.name
      })
      let message = this.$t('ops.selectedAssets')
      message += nodes_names.join(', ')
      message += '\r\n'
      message += this.$t('ops.inTotal') + `：${nodes_names.length} \r\n`
      this.xterm.clear()
      this.xterm.write(message)
    },
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/ops/tasks/log/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      this.ws = new WebSocket(wsURL)
      this.ws.onerror = (e) => {
        this.xterm.write(this.wrapperError('Connect websocket server error'))
      }
      this.setWsCallback()
    },
    setWsCallback() {
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        let message = data.message
        message = message.replace(/Task ops\.tasks\.run_command_execution.*/, '')
        this.xterm.write(message)
      }
    },
    wrapperError(msg) {
      return `\r\n${msg}\r\n`
    },
    writeExecutionOutput(taskId) {
      let msg = this.$t('assets.Pending')
      this.xterm.write(msg)
      msg = JSON.stringify({ task: taskId })
      this.ws.send(msg)
    },
    execute() {
      const size = 'rows=' + this.xterm.rows + '&cols=' + this.xterm.cols
      const url = '/api/v1/ops/command-executions/?' + size
      const runAs = this.accountConfig.selectedUsername
      const command = this.scriptMeta.content
      const hosts = this.getSelectedAssetsNode().map(function(node) {
        return node.id
      })
      if (hosts.length === 0) {
        this.xterm.write(this.wrapperError(this.$t('assets.UnselectedAssets')))
        return
      }
      if (!command) {
        this.xterm.write(this.wrapperError(this.$t('assets.NoInputCommand')))
        return
      }
      if (!runAs) {
        this.xterm.write(this.wrapperError(this.$t('assets.NoSystemUserWasSelected')))
        return
      }
      const data = {
        hosts: hosts,
        run_as: runAs,
        command: command
      }
      this.$axios.post(
        url, data
      ).then(res => {
        this.writeExecutionOutput(res.id)
      })
    }
  }
}
</script>

<style lang="scss" scoped>

> > > .el-input input {
  height: 100%;
}

.mini-button {
  width: 12px;
  float: right;
  text-align: center;
  padding: 5px 0;
  background-color: var(--color-primary);
  border-color: var(--color-primary);
  color: #FFFFFF;
  border-radius: 3px;
}

.el-tree {
  background-color: inherit !important;
}

.mini {
  margin-right: 5px;
  width: 12px !important;
}

.auto-data-ztree {
  overflow: auto;
  /*border-right: solid 1px red;*/
}

.vue-codemirror-wrap ::v-deep .CodeMirror {
  //width: calc(100% - 17px);
  height: 480px;
  border: 1px solid #eee;
}

.tree-box {
  margin-right: 2px;
  border: 1px solid #e0e0e0;
}
</style>
