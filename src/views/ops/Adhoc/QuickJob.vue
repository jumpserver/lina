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
    <SetVariableDialog
      :form-data="variableFormData"
      :query-param="variableQueryParam"
      :visible.sync="showSetVariableDialog"
      @submit="onSubmitVariable"
    />
    <ConfirmRunAssetsDialog
      :visible.sync="showConfirmRunAssetsDialog"
      :is-running="isRunning"
      :assets="classifiedAssets"
      @submit="onConfirmRunAsset"
    />
    <AssetTreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <CodeEditor
            v-if="ready"
            :options="cmOptions"
            :toolbar="toolbar"
            :value.sync="command"
            style="margin-bottom: 20px"
          />
          <span v-if="executionInfo.status" style="float: right" />
          <div class="xterm-container">
            <QuickJobTerm
              ref="xterm"
              :show-tool-bar="true"
              :select-assets="selectAssets"
              :xterm-config="xtermConfig"
              :execution-info="executionInfo"
              @view-assets="viewConfirmRunAssets"
            />
          </div>
          <div style="display: flex;margin-top:10px;justify-content: space-between" />
        </div>
      </template>
    </AssetTreeTable>
  </Page>
</template>

<script>
import $ from '@/utils/jquery-vendor.js'
import _isequal from 'lodash.isequal'
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import QuickJobTerm from '@/views/ops/Adhoc/components/QuickJobTerm.vue'
import CodeEditor from '@/components/Form/FormFields/CodeEditor'
import Page from '@/layout/components/Page'
import AdhocOpenDialog from './AdhocOpenDialog.vue'
import AdhocSaveDialog from './AdhocSaveDialog.vue'
import VariableHelpDialog from './VariableHelpDialog.vue'
import ConfirmRunAssetsDialog from './components/ConfirmRunAssetsDialog.vue'
import SetVariableDialog from '@/views/ops/Template/components/SetVariableDialog.vue'
import { createJob, getJob, getTaskDetail, stopJob } from '@/api/ops'

export default {
  name: 'CommandExecution',
  components: {
    VariableHelpDialog,
    AdhocSaveDialog,
    AdhocOpenDialog,
    SetVariableDialog,
    AssetTreeTable,
    Page,
    QuickJobTerm,
    CodeEditor,
    ConfirmRunAssetsDialog
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
      showSetVariableDialog: false,
      showConfirmRunAssetsDialog: false,
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
            name: '',
            align: 'left',
            icon: 'fa fa-play',
            tip: this.$t('RunCommand'),
            isVisible: this.$store.getters.currentOrgIsRoot,
            el: {
              type: 'primary'
            },
            callback: () => {
              if (this.variableFormData.length !== 0) {
                this.showSetVariableDialog = true
                return
              }
              this.execute()
            }
          },
          stop: {
            type: 'button',
            name: '',
            align: 'left',
            icon: 'fa fa-stop',
            tip: this.$t('StopJob'),
            isVisible: true,
            el: {
              type: 'danger'
            },
            callback: () => {
              this.stop()
            }
          },
          runas: {
            type: 'input',
            name: this.$t('RunAs'),
            align: 'left',
            value: '',
            placeholder: this.$tc('EnterRunUser'),
            // tip: this.$tc('RunasHelpText'),
            el: {
              autoComplete: true,
              query: (query, cb) => {
                const { hosts, nodes } = this.getSelectedNodesAndHosts()

                if (hosts.length === 0 && nodes.length === 0) {
                  this.$message.warning(`${this.$t('RequiredAssetOrNode')}`)
                  return cb([])
                }
                cb([]) // 先返回空，避免输入时出现下拉闪烁
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
            name: this.$t('RunasPolicy'),
            align: 'left',
            value: 'skip',
            tip: this.$tc('RunasPolicyHelpText'),
            options: [
              {
                label: this.$tc('Skip'),
                value: 'skip'
              }, {
                label: this.$tc('PrivilegedFirst'),
                value: 'privileged_first'
              },
              {
                label: this.$tc('PrivilegedOnly'),
                value: 'privileged_only'
              }
            ],
            callback: (option) => {
              this.runasPolicy = option
            }
          },
          language: {
            type: 'select',
            name: this.$t('Module'),
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
                label: 'SQLServer', value: 'sqlserver'
              },
              {
                label: 'CloudEngine', value: 'huawei'
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
            name: this.$t('Timeout(s)'),
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
            name: this.$t('RunningPath'),
            align: 'left',
            value: '',
            placeholder: this.$tc('EnterRunningPath'),
            tip: this.$tc('RunningPathHelpText'),
            callback: (val) => {
              this.chdir = val
            }
          }
        },
        right: {
          openCommand: {
            type: 'button',
            align: 'right',
            icon: 'open',
            tip: this.$t('OpenCommand'),
            callback: (val, setting) => {
              this.showOpenAdhocDialog = true
            }
          },
          saveCommand: {
            type: 'button',
            align: 'right',
            icon: 'save',
            tip: this.$t('SaveCommand'),
            callback: (val, setting) => {
              if (!this.command) {
                return this.$message.error(this.$t('RequiredContent'))
              } else {
                this.showOpenAdhocSaveDialog = true
              }
            }
          },
          help: {
            type: 'button',
            align: 'right',
            icon: 'info',
            tip: this.$t('Help'),
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
        notShowBuiltinTree: true,
        check: {
          enable: true
        },
        view: {
          dblClickExpand: false,
          showLine: true
        },
        callback: {
          onCheck: function(_event, treeId, treeNode) {
            const treeObj = $.fn.zTree.getZTreeObj(treeId)
            if (treeNode.checked) {
              treeObj.expandNode(treeNode, true, false, true)
            }
          }
        }
      },
      iShowTree: true,
      variableFormData: [],
      variableQueryParam: '',
      classifiedAssets: {
        error: [],
        runnable: [],
        skipped: []
      },
      selectAssets: [],
      selectNodes: [],
      lastRequestPayload: null
    }
  },
  computed: {
    xterm() {
      return this.$refs.xterm.xterm
    },
    ztree() {
      return this.$refs.TreeTable.$refs.TreeList.$refs.AutoDataZTree.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree
    },
    isRunning() {
      return this.executionInfo.status.value === 'running'
    }
  },
  watch: {
    command(iNew, iOld) {
      if (iNew === '') {
        this.variableFormData = []
      }
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
      this.variableFormData = adhoc?.variable.map((data) => {
        return data.form_data
      })
      this.variableQueryParam = 'adhoc=' + adhoc.id
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
          message = message.replace(/\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} Task ops\.tasks\.run_ops_job_execution.*/, '')
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
      let msg = this.$t('Pending')
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
      this.toolbar.left.run.isVisible = true
      this.executionInfo.cancel = setInterval(() => {
        this.executionInfo.timeCost += 1
      }, 1000)
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
    shouldReRequest(payload) {
      if (!this.lastRequestPayload) return true
      const current = _.omit(payload, ['args'])
      const last = _.omit(this.lastRequestPayload, ['args'])
      return !_isequal(current, last)
    },
    execute() {
      // const size = 'rows=' + this.xterm.rows + '&cols=' + this.xterm.cols
      const { hosts, nodes } = this.getSelectedNodesAndHosts()

      if (hosts.length === 0 && nodes.length === 0) {
        this.$message.error(this.$tc('RequiredAssetOrNode'))
        return
      }
      if (this.command.length === 0) {
        this.$message.error(this.$tc('RequiredContent'))
        return
      }
      if (!this.runas) {
        this.$message.error(this.$tc('RequiredRunas'))
        return
      }
      const payload = {
        assets: hosts,
        nodes: nodes,
        module: this.module,
        args: this.command,
        runas: this.runas,
        runas_policy: this.runasPolicy
      }
      if (!this.shouldReRequest(payload)) {
        this.onConfirmRunAsset(this.selectAssets, this.selectNodes)
        return
      }

      this.lastRequestPayload = { ...payload }
      this.$axios.post('/api/v1/ops/classified-hosts/', {
        ...payload
      }).then(data => {
        this.classifiedAssets = data
        if (this.classifiedAssets.error.length === 0) {
          this.onConfirmRunAsset(hosts, nodes)
        } else {
          this.showConfirmRunAssetsDialog = true
        }
      })
    },
    onConfirmRunAsset(assets, nodes) {
      const data = {
        assets: assets,
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
      if (this.parameters) {
        data.parameters = this.parameters
      }
      createJob(data).then(res => {
        this.executionInfo.timeCost = 0
        this.executionInfo.status = { value: 'running', label: this.$t('Running') }
        this.currentTaskId = res.task_id
        this.xtermConfig = { taskId: this.currentTaskId, type: 'shortcut_cmd' }
        this.setCostTimeInterval()
        this.writeExecutionOutput()
        this.setBtn()
        this.selectAssets = assets
        this.selectNodes = nodes
      })
    },
    viewConfirmRunAssets() {
      this.showConfirmRunAssetsDialog = true
    },
    stop() {
      stopJob({ task_id: this.currentTaskId }).then(() => {
        this.xterm.write('\x1b[31m' +
          this.$tc('StopLogOutput').replace('currentTaskId', this.currentTaskId) + '\x1b[0m')
        this.xterm.write(this.wrapperError(''))
        this.getTaskStatus()
      }).catch((e) => {
        this.$log.error(e)
      }).finally(() => {
        this.setBtn()
      })
    },
    setBtn() {
      if (!this.isRunning) {
        clearInterval(this.executionInfo.cancel)
        this.toolbar.left.run.icon = 'fa fa-play'
      }
      this.toolbar.left.run.isVisible = this.isRunning
      this.toolbar.left.stop.isVisible = !this.isRunning
    },
    onSubmitVariable(parameters) {
      this.parameters = parameters
      this.showSetVariableDialog = false
      this.execute()
    }
  }
}
</script>

<style lang="scss" scoped>
$container-bg-color: #f7f7f7;

.transition-box {
  display: flex;
  flex-direction: column;

  .xterm-container {
    margin-left: 30px;
    height: calc(100vh - 549px);
    min-height: 255px;
    border: 1px solid var(--color-border);
    border-radius: 5px;
    background-color: $container-bg-color;
    overflow: hidden;

    & > div {
      height: 100%;

      & ::v-deep .xterm {
        height: calc(100% - 8px);
        overflow-y: auto;
      }
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
  border-radius: 2px;
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

  ::v-deep .ztree {
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

.tree-table-content {
  ::v-deep .left {
    padding-top: 4px;
  }
}
</style>
