<template>
  <Page>
    <AdhocOpenDialog v-if="showOpenAdhocDialog" :visible.sync="showOpenAdhocDialog" @select="onSelectAdhoc" />
    <AdhocSaveDialog
      v-if="showOpenAdhocSaveDialog"
      :args="command"
      :module="module"
      :visible.sync="showOpenAdhocSaveDialog"
    />
    <VariableHelpDialog :visible.sync="showHelpDialog" />
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <CodeEditor
            v-if="ready"
            style="margin-bottom: 20px"
            :toolbar="toolbar"
            :options="cmOptions"
            :value.sync="command"
          />
          <b>{{ $tc('ops.output') }}:</b>
          <span v-if="executionInfo.status" style="float: right">
            <span>
              <span><b>{{ $tc('common.Status') }}: </b></span>
              <span
                :class="{'status_success':executionInfo.status==='success',
                         'status_warning':executionInfo.status==='timeout',
                         'status_danger':executionInfo.status==='failed'
                }"
              >{{ $tc('ops.' + executionInfo.status) }}</span>
            </span>
            <span>
              <span><b>{{ $tc('ops.timeDelta') }}: </b></span>
              <span>{{ executionInfo.timeCost.toFixed(2) }}</span>
            </span>
          </span>
          <div style="padding-left: 30px; background-color: rgb(247 247 247)">
            <Term ref="xterm" style="border-left: solid 1px #dddddd" :show-tool-bar="true" />
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
import { getJob, getTaskDetail } from '@/api/ops'

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
      ready: false,
      currentStatus: '',
      currentTaskId: '',
      executionInfo: {
        status: '',
        timeCost: 0,
        cancel: 0
      },
      showHelpDialog: false,
      showOpenAdhocDialog: false,
      showOpenAdhocSaveDialog: false,
      DataZTree: 0,
      runas: 'root',
      runasPolicy: 'skip',
      command: '',
      module: 'shell',
      timeout: -1,
      cmOptions: {
        mode: 'shell'
      },
      toolbar: {
        left: {
          run: {
            type: 'button',
            name: this.$t('ops.Run'),
            align: 'left',
            icon: 'fa fa-play',
            tip: this.$t('ops.RunCommand'),
            disabled: this.$store.getters.currentOrgIsRoot,
            el: {
              type: 'primary'
            },
            callback: () => {
              this.execute()
            }
          },
          runas: {
            type: 'select',
            name: this.$t('ops.runAs'),
            align: 'left',
            value: 'root',
            el: {
              create: true
            },
            options: [],
            callback: (option) => {
              this.runas = option
            }
          },
          runasPolicy: {
            type: 'select',
            name: this.$t('ops.RunasPolicy'),
            align: 'left',
            value: 'skip',
            options: [
              {
                label: this.$tc('ops.Skip'),
                value: 'skip'
              }, {
                label: this.$tc('ops.PrivilegedFirst'),
                value: 'privileged_first'
              },
              {
                label: this.$tc('ops.PrivilegedOnly'),
                value: 'privileged_only'
              }
            ],
            callback: (option) => {
              this.runasPolicy = option
            }
          },
          language: {
            type: 'select',
            name: this.$t('ops.Language'),
            align: 'left',
            value: 'shell',
            options: [
              {
                label: 'Shell', value: 'shell'
              },
              {
                label: 'Powershell', value: 'win_shell'
              },
              {
                label: 'Python', value: 'python'
              }
            ],
            callback: (option) => {
              this.cmOptions.mode = option === 'win_shell' ? 'powershell' : option
              this.module = option
            }
          },
          timeout: {
            type: 'select',
            name: this.$t('ops.Timeout'),
            align: 'left',
            value: -1,
            el: {
              create: true
            },
            options: [
              { label: '无', value: -1 },
              { label: '10', value: 10 },
              { label: '30', value: 30 },
              { label: '60', value: 60 },
              { label: this.$t('ops.ManualInput'), value: 'manualInput' }
            ],
            callback: (option) => {
              this.timeout = option
            }
          }
        },
        right: {
          openCommand: {
            type: 'button',
            align: 'right',
            icon: 'fa-folder-open',
            tip: this.$t('ops.OpenCommand'),
            callback: (val, setting) => {
              this.showOpenAdhocDialog = true
            }
          },
          saveCommand: {
            type: 'button',
            align: 'right',
            icon: 'save',
            tip: this.$t('ops.SaveCommand'),
            callback: (val, setting) => {
              this.showOpenAdhocSaveDialog = true
            }
          },
          help: {
            type: 'button',
            align: 'right',
            icon: 'fa fa-question-circle',
            tip: this.$t('ops.Help'),
            callback: (val, setting) => {
              this.showHelpDialog = true
            }
          }
        }
      },
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
      iShowTree: true
    }
  },
  computed: {
    xterm() {
      return this.$refs.xterm.xterm
    },
    ztree() {
      return this.$refs.TreeTable.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree
    }
  },
  mounted() {
    this.enableWS()
    this.initData()
  },
  methods: {
    async initData() {
      await this.getFrequentUsernames()
      this.recoverStatus()
    },
    recoverStatus() {
      if (this.$route.query.taskId) {
        this.currentTaskId = this.$route.query.taskId
        getTaskDetail(this.currentTaskId).then(data => {
          getJob(data.job_id).then(res => {
            this.toolbar.left.runas.value = res.runas
            this.toolbar.left.runasPolicy.value = res.runas_policy.value
            this.toolbar.left.language.value = res.module.value
            this.toolbar.left.language.callback(res.module.value)
            this.toolbar.left.timeout.value = res.timeout
            this.command = res.args
            this.executionInfo.status = data['status']
            this.executionInfo.timeCost = data['time_cost']
            this.setCostTimeInterval()
            this.writeExecutionOutput()
          })
        })
      }
    },
    getFrequentUsernames() {
      this.$axios.get('/api/v1/ops/frequent-username').then(data => {
        this.toolbar.left.runas.options.push({
          label: 'root', value: 'root'
        })
        data.filter((item) => {
          return item.username !== 'root'
        }).forEach((item) => {
          this.toolbar.left.runas.options.push({
            label: item.username,
            value: item.username
          })
        })
        this.ready = true
      })
    },
    onSelectAdhoc(adhoc) {
      this.command = adhoc.args
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
          message = message.replace(/Task ops\.tasks\.run_ops_job_execution.*/, '')
          this.xterm.write(message)
        }
        if (data.hasOwnProperty('event')) {
          const event = data.event
          switch (event) {
            case 'end':
              setTimeout(() => {
                clearInterval(this.executionInfo.cancel)
                this.toolbar.left.run.icon = 'fa fa-play'
                this.toolbar.left.run.disabled = false
                this.getTaskStatus()
              }, 500)
              break
          }
        }
      }
    },
    getTaskStatus() {
      getTaskDetail(this.currentTaskId).then(data => {
        this.executionInfo.status = data['status']
      })
    },
    wrapperError(msg) {
      return `\r\n${msg}\r\n`
    },
    writeExecutionOutput() {
      let msg = this.$t('assets.Pending')
      this.xterm.write(msg)
      msg = JSON.stringify({ task: this.currentTaskId })
      this.ws.send(msg)
    },
    getSelectedNodes() {
      return this.ztree.getCheckedNodes().filter(node => {
        const status = node.getCheckStatus()
        return status.half === false
      })
    },

    setCostTimeInterval() {
      this.toolbar.left.run.icon = 'fa fa-spinner fa-spin'
      this.toolbar.left.run.disabled = true
      this.executionInfo.cancel = setInterval(() => {
        this.executionInfo.timeCost += 0.1
      }, 100)
    },

    execute() {
      // const size = 'rows=' + this.xterm.rows + '&cols=' + this.xterm.cols
      const url = '/api/v1/ops/jobs/?'

      const hosts = this.getSelectedNodes().filter((item) => {
        return item.meta.type !== 'node'
      }).map(function(node) {
        return node.id
      })

      const nodes = this.getSelectedNodes().filter((item) => {
        return item.meta.type === 'node'
      }).map(function(node) {
        return node.meta.data.id
      })

      if (hosts.length === 0 && nodes.length === 0) {
        this.$message.error(this.$tc('ops.RequiredAssetOrNode'))
        return
      }
      if (this.command.length === 0) {
        this.$message.error(this.$tc('ops.RequiredContent'))
        return
      }

      const data = {
        assets: hosts,
        nodes: nodes,
        module: this.module,
        args: this.command,
        runas: this.runas,
        runas_policy: this.runasPolicy,
        instant: true,
        is_periodic: false,
        timeout: this.timeout
      }
      this.$axios.post(
        url, data
      ).then(res => {
        this.executionInfo.timeCost = 0
        this.executionInfo.status = 'running'
        this.currentTaskId = res.task_id
        this.$router.replace({ query: { taskId: this.currentTaskId }})
        this.setCostTimeInterval()
        this.writeExecutionOutput()
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

.status_success {
  color: var(--color-success);
}

.status_warning {
  color: var(--color-warning);
}

.status_danger {
  color: var(--color-danger);
}
</style>
