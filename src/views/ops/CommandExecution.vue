<template>
  <Page>
    <el-collapse-transition>
      <div style="display: flex;justify-items: center; flex-wrap: nowrap;justify-content:space-between;">
        <div v-show="iShowTree" :style="iShowTree?('width:250px;'):('width:0;')" class="transition-box">
          <component
            :is="component"
            ref="AutoDataZTree"
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
                <CodeMirror :options="CodeMirrorOptions" @change="handleActionChange" />
              </div>
              <div style="display: flex;flex-direction: column ;justify-content: space-between">
                <el-select v-model="selectedSystemuser" placeholder="请选择" @change="handleSystemUserChange">
                  <el-option
                    v-for="item in options"
                    :key="item.id"
                    :disabled="item.protocol != 'ssh'"
                    :label="`${item.name}(${item.username})`"
                    :value="item.id"
                  />
                </el-select>
                <el-button type="primary" size="small" @click="execute">执行</el-button>
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
import Select2 from '@/components/Select2'
import CodeMirror from '@/components/CodeMirror'
import Page from '@/layout/components/Page'
export default {
  name: 'CommandExecution',
  components: {
    Term,
    AutoDataZTree,
    IBox,
    Select2,
    Page,
    CodeMirror
  },
  data() {
    return {
      component: 'AutoDataZTree',
      CodeMirrorOptions: {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'shell'
      },
      treeSetting: {
        treeUrl: '/api/v1/perms/users/nodes-with-assets/tree/?cache_policy=1',
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
          onClick: this.onClick.bind(this)
        },
        async: {
          enable: false
        }
      },
      iShowTree: true,
      actions: '',
      options: [],
      selectedSystemuser: '',
      basicUrl: '/api/v1/perms/users/nodes-with-assets/tree/?cache_policy=1',
      ws: ''
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
    this.$axios.get('api/v1/assets/system-users/').then(res => {
      this.options = res
    })
    this.xterm.write(`选择左侧资产, 选择运行的系统用户，批量执行命令`)
    this.enableWS()
  },
  methods: {
    handleActionChange(val) {
      this.actions = val
    },
    onClick(event, treeId, treeNode, clickFlag) {
      console.log(event, treeId, treeNode, clickFlag)
      if (treeNode.meta.type === 'asset') {
        const protocolsStr = treeNode.meta.asset.protocols + ''
        if (protocolsStr.indexOf('ssh/') === -1) {
          // Don't Support SSH
        }
      }
    },
    handleSystemUserChange(id) {
      this.treeSetting.treeUrl = `${this.basicUrl}&system_user=${id}`
      console.log(this.treeSetting.treeUrl)
      this.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree.initTree()
    },
    getSelectedAssetsNode() {
      const nodes = this.zTree.getCheckedNodes(true)
      const assetsNodeId = []
      const assetsNode = []
      nodes.forEach(function(node) {
        if (node.meta.type === 'asset' && !node.isHidden) {
          const protocolsStr = node.meta.asset.protocols + ''
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
      let message = `已选择资产:`
      message += nodes_names.join(', ')
      message += '\r\n'
      message += `总共：${nodes_names.length} 个\r\n`
      this.xterm.clear()
      this.xterm.write(message)
    },
    enableWS() {
      const scheme = document.location.protocol === 'https:' ? 'wss' : 'ws'
      const port = document.location.port ? ':' + document.location.port : ''
      const url = '/ws/ops/tasks/log/'
      const wsURL = scheme + '://' + document.location.hostname + port + url
      const failOverPort = '8070'
      const failOverWsURL = scheme + '://' + document.location.hostname + ':' + failOverPort + url
      this.ws = new WebSocket(wsURL)
      this.ws.onerror = (e) => {
        this.ws = new WebSocket(failOverWsURL)
        this.ws.onmessage = (e) => {
          const data = JSON.parse(e.data)
          this.xterm.write(data.message)
        }
        this.ws.onerror = (e) => {
          this.xterm.write('Connect websocket server error')
        }
      }
      this.ws.onmessage = (e) => {
        const data = JSON.parse(e.data)
        this.xterm.write(data.message)
      }
    },
    wrapperError(msg) {
      return '\\033[31m' + msg + '\\033[0m\r\n'
    },
    execute() {
      // const size = 'rows=' + this.xterm.rows + '&cols=' + this.xterm.cols
      // const url = '{% url "api-ops:command-execution-list" %}?' + size
      const run_as = this.selectedSystemuser()
      // const command = editor.getValue()
      const hosts = this.getSelectedAssetsNode().map(function(node) {
        return node.id
      })
      if (hosts.length === 0) {
        this.xterm.write(this.wrapperError("{% trans 'Unselected assets' %}"))
        return
      }
      // if (!command) {
      //   this.xterm.write(this.wrapperError("{% trans 'No input command' %}"))
      //   return
      // }
      if (!run_as) {
        this.xterm.write(this.wrapperError("{% trans 'No system user was selected' %}"))
        return
      }
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
  .vue-codemirror-wrap /deep/ .CodeMirror{
    width: 600px;
    height: 100px;
    border: 1px solid #eee;
  }
</style>
