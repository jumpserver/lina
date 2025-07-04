<template>
  <Page>
    <el-alert
      :center="false"
      class="announcement"
      type="success"
    >
      <span v-for="(tip,index) of FileTransferBootStepHelpTips" :key="index" style="padding-right: 24px">
        <span style="font-weight: 700; color:#1C84C6">{{ index + 1 }}.</span>
        {{ tip }}
      </span>
    </el-alert>

    <AssetTreeTable ref="AssetTreeTable" :tree-setting="treeSetting">
      <template slot="table">
        <div class="transition-box" style="width: calc(100% - 17px);">
          <div class="upload_input">
            <el-button
              :disabled="runButton.disabled"
              :type="runButton.el&&runButton.el.type"
              size="small"
              style="display: inline-block; padding: 6px 10px"
              @click="runButton.callback()"
            >
              <i :class="runButton.icon" style="margin-right: 4px;" />{{ runButton.name }}
            </el-button>
          </div>
          <span style="color: red">*</span>
          <div class="upload_input">{{ $t('Account') }}:</div>
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
          <div class="upload_input">{{ $t('UploadDir') }}:</div>
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
                <div class="el-upload__text" style="margin-bottom: 10px;padding: 0 5px 0 5px ">
                  {{ $t('DragUploadFileInfo') }}
                </div>
                <span>
                  {{ $t('UploadFileLthHelpText', {limit: SizeLimitMb}) }}
                </span>
                <div slot="file" slot-scope="{file}">
                  <li class="el-upload-list__item is-ready" tabindex="0">
                    <a :style="sameFileStyle(file)" class="el-upload-list__item-name">
                      <i class="el-icon-document" />{{ file.name }}
                      <i style="color: #1ab394;float: right;font-weight:normal">
                        {{ formatFileSize(file.size) }}
                        <i class="el-icon-close" @click="removeFile(file)" />
                      </i>
                    </a>
                  </li>
                </div>
                <div
                  v-if="uploadFileList.length === 0"
                  slot="tip"
                  class="empty-file-tip"
                >
                  {{ $tc('NoFiles') }}
                </div>
              </el-upload>
              <el-progress v-if="ShowProgress" :percentage="progressLength" />

            </el-card>
          </div>
          <div style="margin-bottom: 5px;font-weight: bold; display: inline-block">{{ $tc('Output') }}:</div>
          <span v-if="executionInfo.status && summary" style="float: right">
            <span>
              <span><b>{{ $tc('Status') }}: </b></span>
              <span
                v-if="executionInfo.status==='timeout'"
                class="status_warning"
              >{{ $tc('Timeout') }}</span>
              <span v-else>
                <span class="status_success">{{ $tc('Success') + ': ' + summary.success }}</span>
                <span class="status_warning">{{ $tc('Skip') + ': ' + summary.skip }}</span>
                <span class="status_danger">{{ $tc('Failed') + ': ' + summary.failed }}</span>
              </span>
            </span>
            <span>
              <span><b>{{ $tc('TimeDelta') }}: </b></span>
              <span>{{ executionInfo.timeCost }}</span>
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
          <div style="display: flex; margin-top:10px; justify-content: space-between" />
        </div>
      </template>
    </AssetTreeTable>
  </Page>
</template>

<script>
import AssetTreeTable from '@/components/Apps/AssetTreeTable'
import Term from '@/components/Widgets/Term'
import Page from '@/layout/components/Page'
import { createJob, getTaskDetail, JobUploadFile } from '@/api/ops'
import { formatFileSize } from '@/utils/common'
import store from '@/store'

export default {
  name: 'FileTransfer',
  components: {
    AssetTreeTable,
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
        name: this.$t('Transfer'),
        align: 'left',
        icon: 'fa fa-play',
        disabled: this.$store.getters.currentOrgIsRoot || !this.$hasPerm('ops.add_job'),
        el: {
          type: 'primary'
        },
        callback: () => {
          setTimeout(() => {
            this.execute()
          }, 300)
        }
      },
      runAsInput: {
        name: this.$t('RunAs'),
        align: 'left',
        value: '',
        placeholder: this.$tc('EnterRunUser'),
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
        name: this.$t('RunningPath'),
        align: 'left',
        value: '',
        placeholder: this.$tc('EnterUploadPath'),
        callback: (val) => {
          this.chdir = val
        }
      },
      treeSetting: {
        treeUrl: '/api/v1/perms/users/self/nodes/children-with-assets/tree/',
        searchUrl: '/api/v1/perms/users/self/assets/tree/',
        notShowBuiltinTree: true,
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
      },
      FileTransferBootStepHelpTips: [
        this.$tc('FileTransferBootStepHelpTips1'),
        this.$tc('FileTransferBootStepHelpTips2'),
        this.$tc('FileTransferBootStepHelpTips3')
      ]
    }
  },
  computed: {
    xterm() {
      return this.$refs.xterm.xterm
    },
    ztree() {
      return this.$refs.AssetTreeTable.$refs.TreeList.$refs.AutoDataZTree.$refs.AutoDataZTree.$refs.dataztree.$refs.ztree
    }
  },
  mounted() {
    this.enableWS()
  },
  methods: {
    formatFileSize,
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
      const { ok = [], failures = [], dark = [], excludes = [], skipped = [] } = summary

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
          this.$message.success(this.$tc('RunSucceed'))
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
      this.runButton.icon = 'fa fa-spinner fa-spin'
      this.runButton.disabled = true
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
        this.$message.error(this.$tc('FileSizeExceedsLimit'))
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
          this.$message.error(this.$tc('DuplicateFileExists'))
          return
        }
        if (this.isFileExceedsLimit(file)) {
          return
        }
        if (file.name.length > 128) {
          this.$message.error(file.name + ' ' + this.$tc('FileNameTooLong'))
          return
        }
      }
      if (this.uploadFileList.length === 0) {
        this.$message.error(this.$tc('RequiredUploadFile'))
        return
      }
      if (hosts.length === 0 && nodes.length === 0) {
        this.$message.error(this.$tc('RequiredAssetOrNode'))
        return
      }
      if (!this.runas) {
        this.$message.error(this.$tc('RequiredRunas'))
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
        this.executionInfo.timeCost = 0
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
          this.executionInfo.status = 'running'
          this.currentTaskId = res.task_id
          this.xtermConfig = { taskId: this.currentTaskId, type: 'shortcut_cmd' }
          this.setCostTimeInterval()
          this.writeExecutionOutput()
        }).catch(() => {
          this.execute_stop()
        })
      })
    },
    execute_stop() {
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
}

.vue-codemirror-wrap ::v-deep .CodeMirror {
  width: 600px;
  height: 100px;
  border: 1px solid #eee;
}

.upload_input ::v-deep .el-input-group__prepend {
  padding: 0 10px;
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
  margin: 10px 0;
  min-width: 925px;

  ::v-deep .el-card__body {
    div {
      display: flex;
      position: relative;

      .el-upload > .el-upload-dragger {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .empty-file-tip {
        position: absolute;
        right: calc(50% - 230px);
        top: 50%;
        font-size: 18px;
        color: #c5c9cc;
        transform: translateY(-50%);
      }

      .el-upload-list {
        margin-left: 20px;
        padding: 0 10px 0 10px;
        list-style: none;
        width: 100%;
        height: 180px;
        border: 1px dashed #d9d9d9;
        overflow-y: auto;
        font-weight: 500;

        .el-upload-list__item {
          &:first-child {
            margin-top: 5px;
          }

          .el-upload-list__item-name {
            .el-icon-close {
              position: relative;
              top: 0;
              left: 10px;
            }
          }
        }
      }
    }
  }
}

.output {
  min-width: 925px;
  padding: 0 20px 20px;
  background: #fff;
}

.output ::v-deep #terminal {
  border: dashed 1px #d9d9d9;
}
</style>
