<template>
  <Page>
    <ConfirmRunAssetsDialog
      v-model:visible="showConfirmRunAssetsDialog"
      :is-running="running"
      :assets="classifiedAssets"
      @submit="onConfirmRunAsset"
    />
    <el-alert :center="false" class="announcement" type="info">
      <span
        v-for="(tip, index) of FileTransferBootStepHelpTips"
        :key="index"
        style="padding-right: 24px"
      >
        <span style="font-weight: 700; color: #1c84c6">{{ index + 1 }}.</span>
        {{ tip }}
      </span>
    </el-alert>
    <div class="job-container">
      <div class="select-assets">
        <SelectJobAssetDialog
          base-url="/api/v1/perms/users/self/assets/?category__in!=database,web"
          @change="handleSelectAssets"
        />
      </div>
      <div class="transition-box">
        <div class="transfer-toolbar">
          <el-button
            :disabled="runButton.disabled"
            :loading="running"
            :type="runButton.el && runButton.el.type"
            @click="runButton.callback()"
          >
            <el-icon v-if="!running"><VideoPlay /></el-icon>
            <span>{{ runButton.name }}</span>
          </el-button>

          <el-autocomplete
            v-model="runAsInput.value"
            :fetch-suggestions="runAsInput.el.query"
            :placeholder="runAsInput.placeholder"
            class="toolbar-field account-field"
            @change="runAsInput.callback(runAsInput.value)"
            @select="runAsInput.callback(runAsInput.value)"
          >
            <template #prepend> <span class="required-mark">*</span>{{ $t('Account') }} </template>
          </el-autocomplete>

          <div class="policy-field">
            <span class="field-label">{{ $t('RunasPolicy') }}</span>
            <el-tooltip :content="$tc('RunasPolicyHelpText')">
              <el-select v-model="runasPolicy">
                <el-option
                  v-for="option in runasPolicyOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
            </el-tooltip>
          </div>

          <el-input
            v-if="dstPathInput.type === 'input'"
            v-model="dstPath"
            :placeholder="dstPathInput.placeholder"
            class="toolbar-field dstpath-field"
            @change="dstPathInput.callback(dstPathInput.value)"
          >
            <template #prepend>/tmp/</template>
          </el-input>
        </div>

        <IBox title="selectFiles" class="file-uploader">
          <template #header>
            <div class="file-uploader-header">
              <span>{{ $t('selectFiles', { number: uploadFileList.length }) }}</span>
              <el-tooltip
                v-if="uploadFileList.length > 0"
                :content="$t('ClearSelection')"
                placement="top"
              >
                <el-icon class="clear-icon" @click="clearAllFiles"><Delete /></el-icon>
              </el-tooltip>
            </div>
          </template>

          <div class="uploader-body">
            <el-upload
              v-if="ready"
              ref="upload"
              v-model="uploadFileList"
              :auto-upload="false"
              :on-change="onFileChange"
              action=""
              drag
              multiple
            >
              <el-icon class="uploader-icon"><Upload /></el-icon>
              <div class="el-upload__text">{{ $t('DragUploadFileInfo') }}</div>
              <div class="uploader-limit">
                {{ $t('UploadFileLthHelpText', { limit: sizeLimitMb }) }}
              </div>
              <template #file="{ file }">
                <a :style="sameFileStyle(file)" class="el-upload-list__item-name">
                  <el-icon><Document /></el-icon>{{ file.name }}
                  <span class="file-size">
                    {{ formatFileSize(file.size) }}
                    <el-icon class="remove-icon" @click="removeFile(file)"><Close /></el-icon>
                  </span>
                </a>
              </template>
              <template #tip>
                <div v-if="uploadFileList.length === 0" class="empty-file-tip">
                  {{ $tc('NoFiles') }}
                </div>
              </template>
            </el-upload>
          </div>

          <template v-if="showProgress">
            <el-progress :percentage="progressLength" />
            <div class="status-info">
              <span class="left">{{ speedText }}</span>
              <span class="right">{{ loadedSize }} / {{ totalSize }}</span>
            </div>
          </template>
        </IBox>

        <IBox title="Output" class="output-box">
          <template #header>
            <div class="output-header">
              <span class="output-title">{{ $tc('Output') }}</span>
              <span v-if="executionInfo.status && summary && !showProgress" class="output-summary">
                <span class="summary-group">
                  <b>{{ $tc('Status') }}: </b>
                  <span v-if="executionInfo.status === 'timeout'" class="status_warning">
                    {{ $tc('Timeout') }}
                  </span>
                  <span v-else>
                    <span class="status_success">{{
                      $tc('Success') + ': ' + summary.success
                    }}</span>
                    <span class="status_warning">{{ $tc('Skip') + ': ' + summary.skip }}</span>
                    <span class="status_danger">{{ $tc('Failed') + ': ' + summary.failed }}</span>
                  </span>
                </span>
                <span class="summary-group">
                  <b>{{ $tc('TimeDelta') }}: </b>
                  <span>{{ executionInfo.timeCost }}</span>
                </span>
              </span>
            </div>
          </template>

          <div class="output">
            <Term ref="xterm" :show-tool-bar="true" :xterm-config="xtermConfig" />
          </div>
        </IBox>
      </div>
    </div>
  </Page>
</template>

<script>
import Term from '@/components/Widgets/Term'
import Page from '@/layout/components/Page'
import IBox from '@/components/Common/IBox/index.vue'
import { createJob, getTaskDetail, JobUploadFile } from '@/api/ops'
import { formatFileSize } from '@/utils/common/index'
import store from '@/store'
import SelectJobAssetDialog from '@/views/ops/Adhoc/components/SelectJobAssetDialog.vue'
import ConfirmRunAssetsDialog from '@/views/ops/Adhoc/components/ConfirmRunAssetsDialog.vue'

export default {
  name: 'FileTransfer',
  components: {
    ConfirmRunAssetsDialog,
    SelectJobAssetDialog,
    Page,
    IBox,
    Term
  },
  data() {
    return {
      ready: true,
      running: false,
      currentStatus: '',
      currentTaskId: '',
      executionInfo: {
        status: '',
        timeCost: 0,
        cancel: 0
      },
      xtermConfig: {},
      runas: '',
      runasPolicy: 'skip',
      runasPolicyOptions: [
        { label: this.$tc('Skip'), value: 'skip' },
        { label: this.$tc('PrivilegedFirst'), value: 'privileged_first' },
        { label: this.$tc('PrivilegedOnly'), value: 'privileged_only' }
      ],
      dstPath: '',
      runButton: {
        type: 'button',
        name: this.$t('Transfer'),
        align: 'left',
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
            cb([]) // 先返回空，避免输入时出现下拉闪烁
            this.$axios
              .post('/api/v1/ops/username-hints/', {
                nodes: nodes,
                assets: hosts,
                query: query
              })
              .then((data) => {
                const ns = data.map((item) => {
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
      progressLength: 0,
      showProgress: false,
      upload_interval: null,
      uploadFileList: [],
      sizeLimitMb: store.getters.publicSettings['FILE_UPLOAD_SIZE_LIMIT_MB'],
      summary: {
        success: 0,
        failed: 0,
        skip: 0
      },
      FileTransferBootStepHelpTips: [
        this.$tc('FileTransferBootStepHelpTips1'),
        this.$tc('FileTransferBootStepHelpTips2'),
        this.$tc('FileTransferBootStepHelpTips3')
      ],
      speedText: '',
      loadedSize: '',
      totalSize: '',
      selectHosts: [],
      showConfirmRunAssetsDialog: false,
      classifiedAssets: {
        error: [],
        runnable: []
      }
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
        if (Object.prototype.hasOwnProperty.call(data, 'message')) {
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
      getTaskDetail(this.currentTaskId).then((data) => {
        this.executionInfo.status = data['status']
        this.taskStatusStat(data['summary'])
        if (this.executionInfo.status === 'success') {
          this.$message.success(this.$tc('RunSucceed'))
          clearInterval(this.upload_interval)
          this.showProgress = false
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
    setButtonLoading() {
      this.running = true
    },
    resetButtonState() {
      this.running = false
    },
    setCostTimeInterval() {
      this.setButtonLoading()
      this.executionInfo.cancel = setInterval(() => {
        this.executionInfo.timeCost += 1
      }, 1000)
    },
    getSelectedNodesAndHosts() {
      const hosts = this.selectHosts
      const nodes = []
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
      const isGtLimit = file.size / 1024 / 1024 > this.sizeLimitMb
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
    formatSpeed(bps) {
      return `${this.formatFileSize(bps)}/s`
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

      const payload = {
        assets: hosts,
        nodes: nodes,
        module: 'shell',
        type: 'upload_file',
        runas: this.runas,
        runas_policy: this.runasPolicy
      }
      this.$axios.post('/api/v1/ops/classified-hosts/', payload).then((data) => {
        this.classifiedAssets = data
        if (data.error.length === 0) {
          this.onConfirmRunAsset(hosts)
        } else {
          this.showConfirmRunAssetsDialog = true
        }
      })
    },
    onConfirmRunAsset(assets) {
      if (assets.length === 0) {
        this.$message.error(this.$tc('RequiredAssetOrNode'))
        return
      }

      this.setButtonLoading()
      this.showProgress = true
      this.progressLength = 0

      const data = {
        assets: assets,
        nodes: [],
        module: 'shell',
        args: JSON.stringify({ dst_path: this.dstPath }),
        type: 'upload_file',
        runas: this.runas,
        runas_policy: this.runasPolicy,
        instant: false,
        is_periodic: false,
        timeout: -1
      }
      if (this.chdir) {
        data.chdir = this.chdir
      }
      createJob(data)
        .then((res) => {
          this.executionInfo.timeCost = 0
          this.speedText = ''
          const form = new FormData()
          const start = Date.now()
          for (const file of this.uploadFileList) {
            form.append('files', file.raw)
            form.append('job_id', res.id)
          }
          this.upload_interval = setInterval(() => {
            if (this.progressLength >= 99) {
              clearInterval(this.upload_interval)
              return
            }
          }, 100)
          JobUploadFile(form, {
            onUploadProgress: (e) => {
              if (!e.total) return
              const percent = Math.floor((e.loaded / e.total) * 100)
              this.progressLength = Math.min(percent, 100)
              this.loadedSize = formatFileSize(e.loaded)
              this.totalSize = formatFileSize(e.total)
              const elapsedSec = (Date.now() - start) / 1000
              if (elapsedSec > 0) {
                const speed = e.loaded / elapsedSec
                this.speedText = this.formatSpeed(speed)
              }
            }
          })
            .then((res) => {
              this.showProgress = true
              this.executionInfo.status = 'running'
              this.currentTaskId = res.task_id
              this.xtermConfig = { taskId: this.currentTaskId, type: 'shortcut_cmd' }
              this.setCostTimeInterval()
              this.writeExecutionOutput()
            })
            .catch(() => {
              this.execute_stop()
            })
        })
        .catch(() => {
          this.execute_stop()
        })
    },
    execute_stop() {
      this.progressLength = 0
      this.showProgress = false
      this.resetButtonState()
      clearInterval(this.upload_interval)
    },
    handleSelectAssets(assets) {
      this.selectHosts = assets
    },
    clearAllFiles() {
      this.$refs.upload.clearFiles()
      this.uploadFileList = []
    }
  }
}
</script>

<style lang="scss" scoped>
.job-container {
  display: flex;

  .select-assets {
    width: 23.6%;
  }
}

.transition-box {
  flex: 1;
  min-width: 0;
  margin-left: 30px;
}

/* 顶部工具条：传输按钮 + 账号 + 上传目录 */
.transfer-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;

  // el-autocomplete 根节点是 ElTooltip(多根 fragment),拿不到 scoped data-v,
  // 普通 scoped class 选不中,需用 :deep 才能定宽;el-input 单根节点则两者皆可。
  // 统一用 :deep 保证两个输入框宽度一致生效。
  :deep(.account-field) {
    height: 30px;
    width: 280px;
  }

  :deep(.dstpath-field) {
    height: 30px;
    width: 360px;
  }

  .policy-field {
    display: flex;
    height: 30px;

    .field-label {
      display: inline-flex;
      align-items: center;
      padding: 0 12px;
      color: var(--color-text-secondary);
      background: var(--el-fill-color-light);
      border: 1px solid var(--el-border-color);
      border-right: 0;
      border-radius: 4px 0 0 4px;
      white-space: nowrap;
    }

    :deep(.el-select) {
      width: 160px;

      .el-select__wrapper {
        min-height: 30px;
        border-radius: 0 4px 4px 0;
      }
    }
  }

  // 让 prepend 里的必填星号与文字对齐
  .required-mark {
    color: var(--color-danger);
    margin-right: 2px;
  }

  :deep(.el-button) {
    height: 30px;
  }
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

.file-uploader {
  margin-bottom: 16px;

  .file-uploader-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    .clear-icon {
      cursor: pointer;
      color: var(--color-text-secondary);

      &:hover {
        color: var(--color-danger);
      }
    }
  }

  // 拖拽区（左）与文件列表（右）并排
  .uploader-body {
    position: relative;

    // el-upload 根节点是无 class 的 div，仅它直接包含 .el-upload-list
    :deep(div:has(> .el-upload-list)) {
      display: flex;
      gap: 16px;
      width: 100%;
    }

    :deep(.el-upload) {
      flex: 0 0 auto;
    }

    :deep(.el-upload-dragger) {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 260px;
      height: 180px;
      padding: 0 16px;
    }

    .uploader-icon {
      font-size: 28px;
      color: var(--color-text-secondary);
      margin-bottom: 8px;
    }

    :deep(.el-upload__text) {
      margin-bottom: 6px;
    }

    .uploader-limit {
      font-size: 12px;
      color: var(--color-text-secondary);
    }

    :deep(.el-upload-list) {
      flex: 1;
      min-width: 0;
      height: 180px;
      margin: 0;
      padding: 8px 10px;
      border: 1px dashed var(--color-border);
      border-radius: 4px;
      overflow-y: auto;
      font-weight: 500;

      .el-upload-list__item {
        margin-top: 0;

        .el-upload-list__item-name {
          display: flex;
          align-items: center;
          gap: 4px;

          .file-size {
            margin-left: auto;
            color: var(--color-primary);
            font-weight: normal;
          }

          .remove-icon {
            margin-left: 8px;
            cursor: pointer;
            color: var(--color-danger);
          }
        }
      }
    }

    .empty-file-tip {
      position: absolute;
      top: 0;
      bottom: 0;
      left: calc(260px + 16px);
      right: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      color: var(--color-disabled);
      pointer-events: none;
    }
  }

  :deep(.el-progress-bar) {
    padding-right: 0;
  }

  :deep(.el-progress__text) {
    display: none;
  }

  .status-info {
    display: flex;
    justify-content: space-between;
    width: 100%;
    margin-top: 6px;
  }
}

.output-box {
  .output-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;

    .output-title {
      font-weight: 500;
    }

    .output-summary {
      display: inline-flex;
      gap: 16px;
      font-weight: normal;
    }
  }

  .output {
    width: 100%;
  }

  .output :deep(#terminal) {
    border: dashed 1px var(--color-border);
  }
}
</style>
