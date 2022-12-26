<template>
  <Page>
    <AdhocOpenDialog v-if="showOpenAdhocDialog" :visible.sync="showOpenAdhocDialog" @select="onSelectAdhoc" />
    <AdhocSaveDialog
      v-if="showOpenAdhocSaveDialog"
      :args="command"
      :visible.sync="showOpenAdhocSaveDialog"
    />
    <VariableHelpDialog :visible.sync="showHelpDialog" />
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <CodeEditor style="margin-bottom: 20px" :toolbar="toolbar" :value.sync="command" />
          <b>{{ $tc('ops.output') }}:</b>
          <span v-if="executionInfo.status" style="float: right">
            <span>
              <span><b>{{ $tc('common.Status') }}: </b></span>
              <span type="primary">{{ executionInfo.status }}</span>
            </span>
            <span>
              <span><b>{{ $tc('ops.timeDelta') }}: </b></span>
              <span>{{ executionInfo.timeCost.toFixed(2) }}</span>
            </span>
          </span>
          <div style="padding-left: 30px; background-color: rgb(247 247 247)">
            <Term ref="xterm" style="border-left: solid 1px #dddddd" />
          </div>
          <div style="display: flex;margin-top:10px;justify-content: space-between" />
        </div>
      </template>
    </TreeTable>
  </Page>
</template>

<script>
import { TreeTable } from '@/components'
import Term from '@/components/Term'
import CodeEditor from '@/components/FormFields/CodeEditor'
import Page from '@/layout/components/Page'
import AdhocOpenDialog from '@/views/ops/Job/AdhocOpenDialog'
import AdhocSaveDialog from '@/views/ops/Job/AdhocSaveDialog'
import VariableHelpDialog from '@/views/ops/Job/VariableHelpDialog'

export default {
  name: 'CommandExecution',
  components: {
    VariableHelpDialog,
    AdhocSaveDialog,
    AdhocOpenDialog,
    TreeTable,
    Page,
    Term,
    CodeEditor
  },
  data() {
    return {
      currentStatus: '',
      currentTaskID: '',
      executionInfo: {
        status: '',
        timeCost: 0,
        cancel: 0
      },
      showHelpDialog: false,
      showOpenAdhocDialog: false,
      showOpenAdhocSaveDialog: false,
      DataZTree: 0,
      runas: ['root'],
      runasPolicy: 'skip',
      command: '',
      module: 'shell',
      selectedAccounts: [],
      toolbar: [
        {
          type: 'button',
          name: this.$t('ops.Run'),
          align: 'left',
          icon: 'fa-play',
          tip: this.$t('ops.RunCommand'),
          el: {
            type: 'primary'
          },
          callback: (val, setting) => {
            this.execute()
          }
        },
        {
          type: 'select',
          name: this.$t('ops.runAs'),
          align: 'left',
          value: ['root'],
          el: {
            multiple: true,
            create: true
          },
          options: [
            {
              label: 'root', value: 'root'
            }
          ],
          callback: (val, setting, option) => {
            this.runas = option
          }
        },
        {
          type: 'select',
          name: this.$t('ops.RunasPolicy'),
          align: 'left',
          value: 'skip',
          options: [
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
          callback: (val, setting, option) => {
            this.runasPolicy = option
          }
        },
        {
          type: 'select',
          name: this.$t('ops.Language'),
          align: 'left',
          value: 'shell',
          options: [
            {
              label: 'Shell', value: 'shell'
            },
            {
              label: 'Powershell', value: 'powershell'
            },
            {
              label: 'Python', value: 'python'
            }
          ],
          callback: (val, setting, option) => {
            setting.mode = option
            this.module = option
          }
        },
        {
          type: 'switch',
          name: this.$t('ops.DryRun'),
          align: 'left',
          value: false,
          callback: (val, setting, option) => {
            console.log(option)
          }
        },
        {
          type: 'button',
          align: 'right',
          icon: 'fa-folder-open',
          tip: this.$t('ops.OpenCommand'),
          callback: (val, setting) => {
            this.showOpenAdhocDialog = true
          }
        },
        {
          type: 'button',
          align: 'right',
          icon: 'save',
          tip: this.$t('ops.SaveCommand'),
          callback: (val, setting) => {
            this.showOpenAdhocSaveDialog = true
          }
        },
        {
          type: 'button',
          align: 'right',
          icon: 'fa fa-question-circle',
          tip: this.$t('ops.Help'),
          callback: (val, setting) => {
            this.showHelpDialog = true
          }
        }
      ],
      codeMirrorOptions: {
        lineNumbers: true,
        lineWrapping: true,
        mode: 'shell'
      },
      treeSetting: {
        treeUrl: '/api/v1/perms/users/self/nodes/children-with-assets/tree/',
        showRefresh: true,
        showMenu: false,
        showSearch: true,
        customTreeHeader: false,
        check: {
          enable: true
        },
        view: {
          dblClickExpand: false,
          showLine: true
        }
      },
      iShowTree: true,
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
    this.enableWS()
  },
  methods: {
    onSelectAdhoc(adhoc) {
      this.command = adhoc.args
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
        if (data.hasOwnProperty('message')) {
          let message = data.message
          message = message.replace(/Task ops\.tasks\.run_command_execution.*/, '')
          this.xterm.write(message)
        }
        if (data.hasOwnProperty('event')) {
          const event = data.event
          switch (event) {
            case 'end':
              clearInterval(this.executionInfo.cancel)
              this.$axios.get(`/api/v1/ops/job-execution/task-detail/?task_id=${this.currentTaskID}`).then(data => {
                this.executionInfo.status = data['is_success'] === true ? 'success' : 'failed'
              })
              break
          }
        }
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
      // const hosts = this.getSelectedAssetsNode().map(function(node) {
      //   return node.id
      // })
      const data = {
        assets: ['9a39ff4e-9ddf-403f-bc63-0f0e4484aafa'],
        module: this.module,
        args: this.command,
        run_as: this.runas.join(),
        run_as_policy: this.runasPolicy,
        instant: true,
        is_periodic: false
      }
      this.$axios.post(
        url, data
      ).then(res => {
        this.executionInfo.timeCost = 0
        this.executionInfo.status = 'running'
        this.executionInfo.cancel = setInterval(() => {
          this.executionInfo.timeCost += 0.1
        }, 100)
        this.currentTaskID = res.task_id
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

.output {
  padding-left: 30px;
  background-color: rgb(247 247 247);
  border: solid 1px #f3f3f3;;
}
</style>
