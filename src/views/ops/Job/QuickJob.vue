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
            :options="cmOptions"
            :toolbar="toolbar"
            :value.sync="command"
            style="margin-bottom: 20px"
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
          <div class="xterm-container">
            <Term
              ref="xterm"
              :show-tool-bar="true"
              :xterm-config="xtermConfig"
              style="border-left: solid 1px #dddddd"
            />
          </div>
          <div style="display: flex;margin-top:10px;justify-content: space-between" />
        </div>
      </template>
    </TreeTable>
  </Page>
</template>

<script>
import { TreeTable } from '@/components'
import Term from '@/components/Widgets/Term'
import CodeEditor from '@/components/Form/FormFields/CodeEditor'
import Page from '@/layout/components/Page'
import AdhocOpenDialog from '@/views/ops/Job/AdhocOpenDialog'
import AdhocSaveDialog from '@/views/ops/Job/AdhocSaveDialog'
import VariableHelpDialog from '@/views/ops/Job/VariableHelpDialog'
import { createJob, getJob, getTaskDetail, StopJob } from '@/api/ops'

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
      ready: true,
      currentStatus: '',
      currentTaskId: '',
      executionInfo: {
        status: '',
        timeCost: 0,
        cancel: 0
      },
      xtermConfig: {},
      showHelpDialog: false,
      showOpenAdhocDialog: false,
      showOpenAdhocSaveDialog: false,
      DataZTree: 0,
      runas: '',
      runasPolicy: 'skip',
      chdir: '',
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
          stop: {
            type: 'button',
            name: this.$t('common.Stop'),
            align: 'left',
            icon: 'fa fa-stop',
            tip: this.$t('ops.StopJob'),
            disabled: true,
            el: {
              type: 'danger'
            },
            callback: () => {
              this.stop()
            }
          },
          runas: {
            type: 'input',
            name: this.$t('ops.runAs'),
            align: 'left',
            value: '',
            placeholder: this.$tc('ops.EnterRunUser'),
            tip: this.$tc('ops.RunasHelpText'),
            el: {
              autoComplete: true,
              query: (query, cb) => {
                const { hosts, nodes } = this.getSelectedNodesAndHosts()
                this.$axios.post('/api/v1/ops/username-hints/', {
                  nodes: nodes,
                  assets: hosts,
                  query: query
                }).then(data => {
                  const ns = data.map(item => {
                    return { value: item.username }
                  })
                  cb(ns)
                })
              }
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
            tip: this.$tc('ops.RunasPolicyHelpText'),
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
            name: this.$t('ops.Module'),
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
                label: 'Raw', value: 'raw'
              },
              {
                label: 'Python', value: 'python'
              },
              {
                label: 'MySQL', value: 'mysql'
              },
              {
                label: 'PostgreSQL', value: 'postgresql'
              },
              {
                label: 'SQL Server', value: 'sqlserver'
              },
              {
                label: 'HUAWEI', value: 'huawei'
              }
            ],
            callback: (option) => {
              this.cmOptions.mode = option === 'win_shell' ? 'powershell' : option
              this.module = option
            }
          }
        },
        fold: {
          timeout: {
            type: 'select',
            name: this.$t('ops.Timeout'),
            align: 'left',
            value: 60,
            options: [
              { label: '10', value: 10 },
              { label: '30', value: 30 },
              { label: '60', value: 60 }
            ],
            callback: (option) => {
              this.timeout = option
            }
          },
          chdir: {
            type: 'input',
            name: this.$t('ops.runningPath'),
            align: 'left',
            value: '',
            placeholder: this.$tc('ops.EnterRunningPath'),
            tip: this.$tc('ops.RunningPathHelpText'),
            callback: (val) => {
              this.chdir = val
            }
          }
        },
        right: {
          openCommand: {
            type: 'button',
            align: 'right',
            icon: 'load-file',
            tip: this.$t('ops.OpenCommand'),
            callback: (val, setting) => {
              this.showOpenAdhocDialog = true
            }
          },
          saveCommand: {
            type: 'button',
            align: 'right',
            icon: 'save-line',
            tip: this.$t('ops.SaveCommand'),
            callback: (val, setting) => {
              if (!this.command) {
                return this.$message.error(this.$t('ops.RequiredContent'))
              } else {
                this.showOpenAdhocSaveDialog = true
              }
            }
          },
          help: {
            type: 'button',
            align: 'right',
            icon: 'help',
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
        searchUrl: '/api/v1/perms/users/self/assets/tree/',
        showRefresh: true,
        showMenu: false,
        showSearch: true,
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
      this.recoverStatus()
    },
    recoverStatus() {
      if (this.$route.query.taskId) {
        this.currentTaskId = this.$route.query.taskId
        getTaskDetail(this.currentTaskId).then(data => {
          getJob(data.job_id).then(res => {
            this.toolbar.left.runas.value = res.runas
            this.toolbar.left.runas.callback(res.runas)
            this.toolbar.left.runasPolicy.value = res.runas_policy.value
            this.toolbar.left.runasPolicy.callback(res.runas_policy.value)
            this.toolbar.left.language.value = res.module.value
            this.toolbar.left.language.callback(res.module.value)
            this.toolbar.fold.timeout.value = res.timeout
            this.toolbar.fold.timeout.callback(res.timeout)
            this.command = res.args
            this.executionInfo.status = data['status']
            this.executionInfo.timeCost = data['time_cost']
            this.setCostTimeInterval()
            this.writeExecutionOutput()
          })
        })
      }
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
        this.setBtn()
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
        return node.id !== 'search' && status.half === false
      })
    },

    setCostTimeInterval() {
      this.toolbar.left.run.icon = 'fa fa-spinner fa-spin'
      this.toolbar.left.run.disabled = true
      this.executionInfo.cancel = setInterval(() => {
        this.executionInfo.timeCost += 0.1
      }, 100)
    },

    getSelectedNodesAndHosts() {
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
      return { hosts, nodes }
    },
    execute() {
      // const size = 'rows=' + this.xterm.rows + '&cols=' + this.xterm.cols
      const { hosts, nodes } = this.getSelectedNodesAndHosts()

      if (hosts.length === 0 && nodes.length === 0) {
        this.$message.error(this.$tc('ops.RequiredAssetOrNode'))
        return
      }
      if (this.command.length === 0) {
        this.$message.error(this.$tc('ops.RequiredContent'))
        return
      }
      if (!this.runas) {
        this.$message.error(this.$tc('ops.RequiredRunas'))
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
      if (this.chdir) {
        data.chdir = this.chdir
      }
      createJob(data).then(res => {
        this.executionInfo.timeCost = 0
        this.executionInfo.status = 'running'
        this.currentTaskId = res.task_id
        this.$router.replace({ query: { taskId: this.currentTaskId }})
        this.setCostTimeInterval()
        this.writeExecutionOutput()
        this.setBtn()
      })
    },
    stop() {
      StopJob({ task_id: this.currentTaskId }).then(() => {
        this.xterm.write('\x1b[31m' +
            this.$tc('ops.StopLogOutput').replace('currentTaskId', this.currentTaskId) + '\x1b[0m')
        this.xterm.write(this.wrapperError(''))
        this.getTaskStatus()
      }).catch((e) => {
        this.$log.error(e)
      }).finally(() => {
        this.setBtn()
      })
    },
    setBtn() {
      if (this.executionInfo.status !== 'running') {
        clearInterval(this.executionInfo.cancel)
        this.toolbar.left.run.icon = 'fa fa-play'
      }
      this.toolbar.left.run.disabled = this.executionInfo.status === 'running'
      this.toolbar.left.stop.disabled = this.executionInfo.status !== 'running'
    }
  }
}
</script>

<style lang="scss" scoped>
.xterm-container {
  padding-left: 30px;
  background-color: rgb(247, 247, 247);
  height: calc(100vh - 549px);
  overflow: hidden;

  & > div {
    height: 100%;

    & > > > .xterm {
      height: calc(100% - 8px);
      overflow-y: auto;
    }
  }
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
  width: 600px;
  height: 100px;
  border: 1px solid #eee;
}

.tree-box {
  margin-right: 2px;
  border: 1px solid #e0e0e0;

  > > > .ztree {
    .level0 {
      .node_name {
        max-width: 100px;
        text-overflow: ellipsis;
        overflow: hidden;
        display: inline-block;
      }
    }
  }
}

.output {
  padding-left: 30px;
  background-color: rgb(247 247 247);
  border: solid 1px #f3f3f3;;
}

.status_success {
  color: var(--color-primary);
}

.status_warning {
  color: var(--color-warning);
}

.status_danger {
  color: var(--color-danger);
}

.tree-table-content {
  > > > .left {
    padding-top: 4px;
  }
}
</style>
