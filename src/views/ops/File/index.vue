<template>
  <Page>
    <TreeTable ref="TreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <div class="upload_input">
            <el-button
              :disabled="runButton.disabled"
              :type="runButton.el&&runButton.el.type"
              size="mini"
              style="display: inline-block; margin: 0 2px"
              @click="runButton.callback()"
            >
              <i :class="runButton.icon" style="margin-right: 4px;" />{{ runButton.name }}
            </el-button>
          </div>
          <div class="upload_input">{{ $t('users.Users') }}:</div>
          <div class="upload_input">
            <el-autocomplete
              v-model="runAsInput.value"
              :fetch-suggestions="runAsInput.el.query"
              :placeholder="runAsInput.placeholder"
              size="mini"
              style="display: inline-block; margin: 0 2px"
              @change="runAsInput.callback(runAsInput.value)"
              @select="runAsInput.callback(runAsInput.value)"
            />
          </div>
          <div class="upload_input">{{ $t('ops.UploadDir') }}:</div>
          <div class="upload_input">
            <el-input
              v-if="dstPathInput.type==='input'"
              v-model="dstPath"
              :placeholder="dstPathInput.placeholder"
              size="mini"
              @change="dstPathInput.callback(dstPathInput.value)"
            >
              <template slot="prepend">/tmp/</template>
            </el-input>
          </div>
          <div
            class="file-uploader"
          >
            <el-card>
              <el-upload
                v-if="ready"
                ref="upload"
                :auto-upload="false"
                :on-change="onFileChange"
                :value.sync="uploadFileList"
                action=""
                drag
                multiple
              >
                <i class="el-icon-upload" />
                <div class="el-upload__text">
                  {{ $t('common.imExport.dragUploadFileInfo') }}
                </div>
                <br>
                <span>
                  {{ $t('ops.uploadFileLthHelpText', {limit: SizeLimitMb}) }}
                </span>
                <div slot="file" slot-scope="{file}">
                  <li tabindex="0" class="el-upload-list__item is-ready">
                    <a class="el-upload-list__item-name" :style="sameFileStyle(file)">
                      <i class="el-icon-document" />{{ file.name }}
                      <i style="color: #1ab394;float: right;font-weight:normal">
                        {{ formatFileSize(file.size) }}
                        <i class="el-icon-close" @click="removeFile(file)" />
                      </i>
                    </a>
                  </li>
                </div>
              </el-upload>
              <el-progress v-if="ShowProgress" :percentage="progressLength" />
              <div
                v-if="uploadFileList.length===0"
                class="empty-file-tip"
              >
                {{ $tc('ops.NoFiles') }}
              </div>
            </el-card>
          </div>
          <b>{{ $tc('ops.output') }}:</b>
          <span v-if="executionInfo.status && summary" style="float: right">
            <span>
              <span><b>{{ $tc('common.Status') }}: </b></span>
              <span
                v-if="executionInfo.status==='timeout'"
                class="status_warning"
              >{{ $tc('ops.timeout') }}</span>
              <span v-else>
                <span class="status_success">{{ $tc('ops.success') + ': ' + summary.success }}</span>
                <span class="status_warning">{{ $tc('ops.Skip') + ': ' + summary.skip }}</span>
                <span class="status_danger">{{ $tc('ops.failed') + ': ' + summary.failed }}</span>
              </span>
            </span>
            <span>
              <span><b>{{ $tc('ops.timeDelta') }}: </b></span>
              <span>{{ executionInfo.timeCost.toFixed(2) }}</span>
            </span>
          </span>
          <div class="output">
            <Term
              ref="xterm"
              :show-tool-bar="true"
              :xterm-config="xtermConfig"
            />
            <div style="height: 2px" />
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
import { formatFileSize } from '@/utils/common'
import store from '@/store'

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
      xtermConfig: {},
      DataZTree: 0,
      runas: '',
      dstPath: '',
      runButton: {
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
      runAsInput: {
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
      dstPathInput: {
        type: 'input',
        name: this.$t('ops.runningPath'),
        align: 'left',
        value: '',
        placeholder: this.$tc('ops.EnterUploadPath'),
        callback: (val) => {
          this.chdir = val
        }
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
      iShowTree: true,
      progressLength: 0,
      ShowProgress: false,
      upload_interval: null,
      uploadFileList: [],
      SizeLimitMb: store.getters.publicSettings['FILE_UPLOAD_SIZE_LIMIT_MB'],
      summary: {
        'success': 0,
        'failed': 0,
        'skip': 0
      }
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
    formatFileSize,
    async initData() {
      this.recoverStatus()
    },
    recoverStatus() {
      if (this.$route.query.taskId) {
        this.currentTaskId = this.$route.query.taskId
        getTaskDetail(this.currentTaskId).then(data => {
          getJob(data.job_id).then(res => {
            this.runAsInput.value = res.runas
            this.runAsInput.callback(res.runas)
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
    taskStatusStat(summary) {
      const { ok, failures, dark, excludes, skipped } = summary

      const failedKeys = Object.keys(failures)
      const darkKeys = Object.keys(dark)
      const excludesKeys = Object.keys(excludes)

      this.summary['success'] = ok.length
      this.summary['failed'] = failedKeys.length + darkKeys.length
      this.summary['skip'] = excludesKeys.length + skipped.length
    },
    getTaskStatus() {
      getTaskDetail(this.currentTaskId).then(data => {
        this.executionInfo.status = data['status']
        this.taskStatusStat(data['summary'])
        if (this.executionInfo.status === 'success') {
          this.$message.success(this.$tc('ops.runSucceed'))
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
      this.runButton.icon = 'fa fa-spinner fa-spin'
      this.runButton.disabled = true
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
      const maxLength = 130 // 显示的最大字符数
      if (fullName.length <= maxLength) {
        return fullName
      }
      const firstPart = fullName.slice(0, maxLength / 2)
      const secondPart = fullName.slice(-maxLength / 2)
      return firstPart + '...' + secondPart
    },
    handleSameFile(fileList) {
      const filenameList = fileList.map((file) => file.name)
      const filenameCount = _.countBy(filenameList)
      for (const file of fileList) {
        file.isSame = filenameCount[file.name] > 1
      }
    },
    sameFileStyle(file) {
      if (file.isSame) {
        return { backgroundColor: 'var(--color-danger)' }
      }
      return ''
    },
    isFileExceedsLimit(file) {
      const isGtLimit = file.size / 1024 / 1024 > this.SizeLimitMb
      if (isGtLimit) {
        this.$message.error(this.$tc('ops.FileSizeExceedsLimit'))
      }
      return isGtLimit
    },
    onFileChange(file, fileList) {
      file.name = this.truncateFileName(file.name)
      this.uploadFileList = fileList
      this.handleSameFile(fileList)
    },
    removeFile(file) {
      this.uploadFileList.splice(this.uploadFileList.indexOf(file), 1)
      this.handleSameFile(this.uploadFileList)
    },
    execute() {
      const { hosts, nodes } = this.getSelectedNodesAndHosts()
      for (const file of this.uploadFileList) {
        if (file.isSame) {
          this.$message.error(this.$tc('ops.DuplicateFileExists'))
          return
        }
        if (this.isFileExceedsLimit(file)) {
          return
        }
        if (file.name.length > 128) {
          this.$message.error(file.name + ' ' + this.$tc('ops.FileNameTooLong'))
          return
        }
      }
      if (this.uploadFileList.length === 0) {
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
        args: JSON.stringify({ dst_path: this.dstPath }),
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
        for (const file of this.uploadFileList) {
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
      this.runButton.disabled = false
      clearInterval(this.upload_interval)
      this.runButton.icon = 'fa fa-play'
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
  color: var(--color-primary);
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

  .empty-file-tip {
    position: relative;
    bottom: 100px;
    left: 58%;
    font-size: 18px;
    color: #c5c9cc;
  }

  > > > .el-upload-list {
    margin-left: 20px;
    padding: 0 10px 0 10px;
    list-style: none;
    width: 100%;
    height: 180px;
    border: 1px dashed #d9d9d9;
    overflow-y: auto;
    font-weight: 500;
  }
}

.output {
  background: white;
}

.output > > > #terminal {
  border: dashed 1px #d9d9d9;
  margin: 0 20px 20px;
}
</style>
