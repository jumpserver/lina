<template>
  <Page>
    <el-collapse-transition>
      <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
        <div v-show="iShowTree" :style="iShowTree?('width:250px;'):('width:0;')" class="transition-box">
          <AutoDataZTree
            ref="AutoDataZTree"
            :key="DataZTree"
            :setting="treeSetting"
            class="auto-data-ztree"
          />
        </div>
        <div :style="iShowTree?('display: flex;width: calc(100% - 250px);'):('display: flex;width:100%;')">
          <div class="mini">
            <div style="display:block" class="mini-button" @click="iShowTree=!iShowTree">
              <i v-show="iShowTree" class="fa fa-angle-left fa-x" /><i v-show="!iShowTree" class="fa fa-angle-right fa-x" />
            </div>
          </div>
          <IBox class="transition-box" style="width: calc(100% - 17px);">
            <Term ref="xterm" />
            <div style="display: flex;margin-top:10px;justify-content: space-between">
              <div>
                <CodeMirror :options="codeMirrorOptions" @change="handleActionChange" />
              </div>
              <div style="display: flex;flex-direction: column ;justify-content: space-between">
                <el-select v-model="selectedSystemUser" :placeholder="this.$t('ops.PleaseSelect')" @change="handleSystemUserChange">
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :disabled="item.protocol !== 'ssh' || item.login_mode!== 'auto'"
                    :label="`${item.name}(${item.username})`"
                    :value="item.id"
                  />
                </el-select>
                <el-button type="primary" size="small" @click="execute">{{ this.$t('ops.Execute') }}</el-button>
              </div>
            </div>
          </IBox>
        </div>
      </div>
    </el-collapse-transition>
  </Page>
</template>

<script>
import AutoDataZTree from '@/components/AutoDataZTree'
import Term from '@/components/Term'
import IBox from '@/components/IBox'
import CodeMirror from '@/components/CodeMirror'
import Page from '@/layout/components/Page'

export default {
  name: 'CommandExecution',
  components: {
    Term,
    AutoDataZTree,
    IBox,
    Page,
    CodeMirror
  },
  data() {
    return {
      DataZTree: 0,
      codeMirrorOptions: {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'shell'
      },
      treeSetting: {
        treeUrl: '',
        showRefresh: true,
        showMenu: false,
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
          onCheck: this.onCheck.bind(this),
          onClick: this.onClick.bind(this),
          onSelected: this.onSelected.bind(this)
        },
        async: {
          enable: false
        }
      },
      iShowTree: true,
      actions: '',
      options: [],
      selectedSystemUser: '',
      basicUrl: '/api/v1/perms/users/nodes-with-assets/tree/?cache_policy=1',
      ws: '',
      wsConnected: false
    }
  },
  computed: {
    zTree() {
      return this.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree.zTree
    },
    xterm() {
      return this.$refs.xterm.xterm
    }
  },
  mounted() {
    this.$axios.get('/api/v1/perms/system-users-permission/').then(res => {
      if (res.length === 0) {
        this.handleSystemUserChange('')
        return
      }
      for (const i in res) {
        // :disabled="item.protocol !== 'ssh'&& item.login_mode!=='auto'"
        if (res[i].protocol === 'ssh' && res[i].login_mode === 'auto') {
          this.handleSystemUserChange(res[i].id)
          this.selectedSystemUser = res[i].id
          break
        }
      }
      this.options = res
    })
    this.xterm.write(this.$t('ops.selectAssetsMessage'))
    this.enableWS()
  },
  methods: {
    handleActionChange(val) {
      this.actions = val
    },
    onClick(event, treeId, treeNode, clickFlag) {
      // if (treeNode.meta.type === 'asset') {
      //   const protocolsStr = treeNode.meta.data.protocols + ''
      //   if (protocolsStr.indexOf('ssh/') === -1) {
      //     // Don't Support SSH
      //   }
      // }
    },
    onSelected(event, treeNode) {

    },
    handleSystemUserChange(id) {
      this.treeSetting.treeUrl = `${this.basicUrl}&system_user=${id}`
      this.xterm.clear()
      this.DataZTree++
    },
    getSelectedAssetsNode() {
      const nodes = this.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree.getCheckedNodes()
      const assetsNodeId = []
      const assetsNode = []
      nodes.forEach(function(node) {
        if (node.meta.type === 'asset' && !node.isHidden) {
          const protocolsStr = node.meta.data.protocols + ''
          if (assetsNodeId.indexOf(node.id) === -1 && protocolsStr.indexOf('ssh') > -1) {
            assetsNodeId.push(node.id)
            assetsNode.push(node)
          }
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
      // const failOverPort = '8070'
      // const failOverWsURL = scheme + '://' + document.location.hostname + ':' + failOverPort + url
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
      const runAs = this.selectedSystemUser
      const command = this.actions
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

<style scoped>
  .mini-button{
    width: 12px;
    float: right;
    text-align: center;
    padding: 5px 0;
    background-color: #1ab394;
    border-color: #1ab394;
    color: #FFFFFF;
    border-radius: 3px;
  }
  .el-tree{
    background-color: inherit !important;
  }
  .mini{
    margin-right: 5px;
    width: 12px !important;
  }

  .auto-data-ztree {
    overflow: auto;
    /*border-right: solid 1px red;*/
  }
  .vue-codemirror-wrap  ::v-deep  .CodeMirror{
    width: 600px;
    height: 100px;
    border: 1px solid #eee;
  }
</style>
