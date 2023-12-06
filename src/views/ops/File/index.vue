<template>
  <Page>
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <div class="upload_input">
            <el-button
              :disabled="run_button.disabled"
              :type="run_button.el&&run_button.el.type"
              size="mini"
              style="display: inline-block; margin: 0 2px"
              @click="run_button.callback()"
            >
              <i :class="run_button.icon" style="margin-right: 4px;" />{{ run_button.name }}
            </el-button>
          </div>
          <div class="upload_input">{{ $t('users.Users') }}:</div>
          <div class="upload_input">
            <el-autocomplete
              v-model="runas_input.value"
              :placeholder="runas_input.placeholder"
              :fetch-suggestions="runas_input.el.query"
              style="display: inline-block; margin: 0 2px"
              size="mini"
              @select="runas_input.callback(runas_input.value)"
              @change="runas_input.callback(runas_input.value)"
            />
          </div>
          <div class="upload_input">{{ $t('ops.UploadDir') }}:</div>
          <div class="upload_input">
            <el-input
              v-if="dst_path_input.type==='input'"
              v-model="dst_path"
              :placeholder="dst_path_input.placeholder"
              size="mini"
              @change="dst_path_input.callback(dst_path_input.value)"
            />
          </div>
          <div
            class="file-uploader"
          >
            <el-card>
              <el-upload
                v-if="ready"
                ref="upload"
                :value.sync="files"
                :auto-upload="false"
                :on-change="onFileChange"
                drag
                multiple
                action=""
              >
                <i class="el-icon-upload" />
                <div class="el-upload__text">
                  {{ $t('common.imExport.dragUploadFileInfo') }}
                </div>
              </el-upload>
              <el-progress v-if="ShowProgress" :percentage="progressLength" />
            </el-card>
          </div>
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
          <div style="border-left: 20px white solid">
            <Term
              ref="xterm"
              :show-tool-bar="true"
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
import Page from '@/layout/components/Page'
import { createJob, getJob, getTaskDetail, JobUploadFile } from '@/api/ops'

export default {
  name: 'BulkTransfer',
  components: {
    TreeTable,
    Page,
    Term
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
      DataZTree: 0,
      runas: '',
      dst_path: '',
      run_button: {
        type: 'button',
        name: this.$t('ops.Transfer'),
        align: 'left',
        icon: 'fa fa-play',
        disabled: this.$store.getters.currentOrgIsRoot,
        el: {
          type: 'primary'
        },
        callback: () => {
          this.execute()
        }
      },
      runas_input: {
        name: this.$t('ops.runAs'),
        align: 'left',
        value: '',
        placeholder: this.$tc('ops.EnterRunUser'),
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
      dst_path_input: {
        type: 'input',
        name: this.$t('ops.runningPath'),
        align: 'left',
        value: '',
        placeholder: this.$tc('ops.EnterRunningPath'),
        callback: (val) => {
          this.chdir = val
        }
      },
      files: null,
      src_paths: [],
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
      iShowTree: true,
      progressLength: 0,
      ShowProgress: false,
      upload_interval: null
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
            this.runas_input.value = res.runas
            this.runas_input.callback(res.runas)
            this.executionInfo.status = data['status']
            this.executionInfo.timeCost = data['time_cost']
            this.setCostTimeInterval()
            this.writeExecutionOutput()
          })
        })
      }
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
        if (data?.event === 'end') {
          setTimeout(() => {
            clearInterval(this.executionInfo.cancel)
            this.execute_stop()
            this.getTaskStatus()
          }, 500)
        }
      }
    },
    getTaskStatus() {
      getTaskDetail(this.currentTaskId).then(data => {
        this.executionInfo.status = data['status']
        if (this.executionInfo.status === 'success') {
          this.$message.success(this.$tc('terminal.UploadSucceed'))
          clearInterval(this.upload_interval)
          this.progressLength = 100
          this.ShowProgress = true
        }
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
      this.run_button.icon = 'fa fa-spinner fa-spin'
      this.run_button.disabled = true
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
    truncateFileName(fullName) {
      const maxLength = 140 // 显示的最大字符数
      if (fullName.length <= maxLength) {
        return fullName
      }
      const firstPart = fullName.slice(0, maxLength / 2)
      const secondPart = fullName.slice(-maxLength / 2)
      return firstPart + '...' + secondPart
    },
    onFileChange(file, fileList) {
      file.name = this.truncateFileName(file.name)
      this.files = fileList
    },
    execute() {
      const { hosts, nodes } = this.getSelectedNodesAndHosts()
      if (!this.files) {
        this.$message.error(this.$tc('ops.RequiredUploadFile'))
        return
      }
      if (hosts.length === 0 && nodes.length === 0) {
        this.$message.error(this.$tc('ops.RequiredAssetOrNode'))
        return
      }
      if (!this.runas) {
        this.$message.error(this.$tc('ops.RequiredRunas'))
        return
      }
      const data = {
        assets: hosts,
        nodes: nodes,
        module: 'shell',
        args: JSON.stringify({ dst_path: this.dst_path }),
        type: 'upload_file',
        runas: this.runas,
        runas_policy: 'skip',
        instant: false,
        is_periodic: false,
        timeout: -1
      }
      if (this.chdir) {
        data.chdir = this.chdir
      }
      createJob(data).then(res => {
        this.progressLength = 0
        this.ShowProgress = true
        const form = new FormData()
        for (const file of this.files) {
          form.append('files', file.raw)
          form.append('job_id', res.id)
        }
        this.upload_interval = setInterval(() => {
          if (this.progressLength >= 99) {
            clearInterval(this.upload_interval)
            return
          }
          this.progressLength += 1
        }, 100)
        JobUploadFile(form).then(res => {
          this.executionInfo.timeCost = 0
          this.executionInfo.status = 'running'
          this.currentTaskId = res.task_id
          this.$router.replace({ query: { taskId: this.currentTaskId }})
          this.setCostTimeInterval()
          this.writeExecutionOutput()
        }).catch(() => {
          this.execute_stop()
        })
      })
    },
    execute_stop() {
      this.executionInfo.timeCost = 0
      this.progressLength = 0
      this.ShowProgress = false
      this.run_button.disabled = false
      clearInterval(this.upload_interval)
      this.run_button.icon = 'fa fa-play'
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

.status_success {
  color: var(--color-success);
}

.status_warning {
  color: var(--color-warning);
}

.status_danger {
  color: var(--color-danger);
}

.upload_input {
  display: inline-block;
  margin: 0 2px
}

.file-uploader {
  margin: 10px 0 10px 0;

  div > div:first-child {
    display: flex;
  }

  > > > .el-upload {
    width: 400px;

    flex-direction: column;

    .el-upload-dragger {
      width: 100%;
    }
  }

  > > > .el-upload-list {
    margin-left: 20px;
    padding: 0 10px 0 10px;
    list-style: none;
    width: 100%;
    height: 180px;
  }

  > > > .el-upload-list:not(:empty) {
    border: 1px dashed #d9d9d9;
    overflow-y: auto;
  }
}
</style>
