<template>
  <Page>
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <IBox class="transition-box" style="width: calc(100% - 17px);">
          <el-form label-width="160px">
            <el-form-item label="runas">
              <el-input v-model="runas" />
            </el-form-item>
            <el-form-item label="runas policy">
              <el-select v-model="runasPolicy">
                <el-option v-for="(item,index) of runasPolicyOptions" :key="index" :value="item">
                  {{ item.label }}
                </el-option>
              </el-select>
            </el-form-item>
          </el-form>

          <CodeEditor style="margin-bottom: 20px" :toolbar="toolbar" />
          <Term ref="xterm" />
          <div style="display: flex;margin-top:10px;justify-content: space-between" />
        </IBox>
      </template>
    </TreeTable>
  </Page>
</template>

<script>
import { TreeTable } from '@/components'
import Term from '@/components/Term'
import IBox from '@/components/IBox'
import CodeEditor from '@/components/FormFields/CodeEditor'
import Page from '@/layout/components/Page'

export default {
  name: 'CommandExecution',
  components: {
    TreeTable,
    Page,
    Term,
    IBox,
    CodeEditor
  },
  data() {
    return {
      DataZTree: 0,
      runas: 'root',
      runasPolicy: 'skip',
      command: '',
      runasPolicyOptions: [
        {
          label: 'skip',
          value: 'skip'
        }, {
          label: 'Privileged First',
          value: 'privileged_first'
        },
        {
          label: 'Privileged Only',
          value: 'privileged_only'
        }
      ],
      toolbar: [
        {
          type: 'button',
          icon: 'fa  fa-play',
          tip: 'Run command',
          callback: () => {
            this.execute()
          }
        }
      ],
      codeMirrorOptions: {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'shell'
      },
      treeSetting: {
        treeUrl: '',
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
        async: {
          enable: false
        }
      },
      iShowTree: true,
      basicUrl: '/api/v1/perms/users/nodes-with-assets/tree/?cache_policy=1',
      ws: '',
      wsConnected: false
    }
  },
  computed: {
    xterm() {
      return this.$refs.xterm.xterm
    }
  },
  mounted() {
    this.handleSystemUserChange('')
    this.enableWS()
  },
  methods: {
    handleSystemUserChange(id) {
      this.treeSetting.treeUrl = this.basicUrl
      this.xterm.clear()
      this.DataZTree++
    },
    getSelectedAssetsNode() {
      const nodes = this.$refs.TreeTable.getSelectedNodes()
      return nodes
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
      // const size = 'rows=' + this.xterm.rows + '&cols=' + this.xterm.cols
      const url = '/api/v1/ops/jobs/?'
      const hosts = this.getSelectedAssetsNode().map(function(node) {
        return node.id
      })
      const data = {
        assets: hosts,
        run_as: this.runas,
        run_as_policy: this.runasPolicy,
        instant: true,
        is_periodic: false
      }
      this.$axios.post(
        url, data
      ).then(res => {
        this.writeExecutionOutput(res.task_id)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
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
  width: 600px;
  height: 100px;
  border: 1px solid #eee;
}

.tree-box {
  margin-right: 2px;
  border: 1px solid #e0e0e0;
}
</style>
