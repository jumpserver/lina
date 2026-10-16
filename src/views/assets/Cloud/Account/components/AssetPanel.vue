<template>
  <div class="asset-panel">
    <el-alert :center="false" :closable="true" style="margin-bottom: 6px">
      <el-link :icon="linkIcon" :type="linkType" underline="never"> {{ tip }}</el-link>
    </el-alert>
    <el-descriptions v-if="executionId" :column="6" border size="small" class="phase-stats">
      <el-descriptions-item :label="$t('Phase')">{{ phaseLabel }}</el-descriptions-item>
      <el-descriptions-item :label="$t('ScannedRegions')">
        {{ stats.regions_scanned || 0 }}/{{ stats.regions_total || 0 }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('DiscoveredCount')">
        {{ stats.discovered || 0 }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('CandidateCount')">
        {{ stats.candidates || 0 }}
      </el-descriptions-item>
      <el-descriptions-item :label="$t('SkipCount')">{{ stats.skipped || 0 }}</el-descriptions-item>
      <el-descriptions-item :label="$t('FailedCount')">{{
        displayedFailedCount
      }}</el-descriptions-item>
    </el-descriptions>
    <ImportTable
      v-bind="tableSettings"
      ref="importTable"
      origin="cloudSync"
      @cancel="closeDialog"
      @finish="showResult"
    />
  </div>
</template>

<script>
import ImportTable from '@/components/Table/ListTable/TableAction/ImportTable'
import { createWsUrl } from '@/utils/common/index'

const EXECUTION_IN_PROGRESS_STATUSES = [2, 3]
const RECOVERY_TIMEOUT_MS = 65 * 60 * 1000
const RECOVERY_INITIAL_DELAY_MS = 1000
const RECOVERY_MAX_DELAY_MS = 15000

export default {
  name: 'AssetPanel',
  components: {
    ImportTable
  },
  emits: ['update:active', 'update:visible'],
  props: {
    active: {
      type: Number,
      default: null
    },
    object: {
      type: Object,
      required: true
    },
    visible: {
      type: Boolean,
      default: () => false
    }
  },
  data() {
    return {
      ws: null,
      importRequests: {},
      tip: this.$tc('PrepareSyncTask'),
      linkType: 'primary',
      linkIcon: 'Loading',
      alreadySync: [],
      finishing: false,
      executionId: null,
      phase: 'scan',
      stats: {},
      scanComplete: false,
      scanStatus: null,
      intentionalClose: false,
      finalReceived: false,
      recovering: false,
      recoveryFailed: false,
      recoveryRunId: 0,
      recoveryTimer: null,
      recoveryWaitResolve: null,
      settings: {
        importOption: 'create',
        showButtons: true,
        canEdit: false,
        config: {
          url: '',
          hasSelection: true,
          persistSelection: false,
          hasPagination: false,
          tableAttrs: {
            height: '300px'
          }
        },
        jsonData: {
          title: [
            [this.$tc('Name'), 'name'],
            [this.$tc('Address'), 'address'],
            [this.$tc('Platform'), 'platform'],
            [this.$tc('Node'), 'node'],
            [this.$tc('Protocol'), 'protocols'],
            [this.$tc('Region'), 'region_name']
          ],
          data: []
        },
        performUploadObject: (item) => this.importAsset(item)
      }
    }
  },
  computed: {
    displayedFailedCount() {
      const failed = this.stats.failed || 0
      // Before the terminal event, stats contains discovery failures only.
      // Imported row errors are reactive and disappear after a successful retry.
      return this.finalReceived ? failed : failed + (this.$refs.importTable?.failedCount || 0)
    },
    phaseLabel() {
      return this.phase === 'import' ? this.$t('ImportPhase') : this.$t('DiscoveryPhase')
    },
    importing() {
      return (
        Object.keys(this.importRequests).length > 0 ||
        this.$refs.importTable?.importTaskStatus === 'started'
      )
    },
    tableSettings() {
      const terminal = this.finalReceived || this.recoveryFailed
      const table = this.$refs.importTable
      const canImport =
        this.scanComplete &&
        [1, 4].includes(this.scanStatus) &&
        !terminal &&
        !this.finishing &&
        !this.recovering &&
        Boolean(table?.pendingCount || table?.failedCount)
      return {
        ...this.settings,
        showCancel: !this.active && !terminal,
        disableImportBtn: !canImport,
        moreButtons: [
          {
            title: this.$t(
              terminal
                ? this.finalReceived && this.active !== null
                  ? 'Next'
                  : 'Close'
                : 'Finished'
            ),
            type: 'primary',
            disabled: terminal
              ? false
              : !this.scanComplete || this.finishing || this.recovering || this.importing,
            loading: this.finishing,
            callback: () => {
              if (terminal) {
                this.advanceOrClose()
              } else {
                table?.performFinish()
              }
            }
          }
        ]
      }
    }
  },
  watch: {
    visible: {
      handler(v, oldV) {
        if (v === oldV) return
        if (!v) {
          this.intentionalClose = true
          this.stopRecovery()
          this.closeWebSocket()
          return
        }
        this.intentionalClose = false
        this.enableWS()
      },
      immediate: true
    }
  },
  beforeUnmount() {
    this.intentionalClose = true
    this.stopRecovery()
    this.settleImports(this.$t('Cancelled'))
    this.closeWebSocket()
  },
  methods: {
    enableWS() {
      if (this.ws) {
        return
      }
      const wsURL = createWsUrl('/ws/xpack/cloud/')
      this.ws = new WebSocket(wsURL)
      this.ws.onopen = () => {
        this.ws.send(
          JSON.stringify({
            action: 'sync_task',
            account_id: this.object.id
          })
        )
      }
      this.ws.onerror = () => {
        this.$message.error(this.$tc('ConnectWebSocketError'))
      }
      this.ws.onclose = () => {
        this.ws = null
        this.settleImports(this.$t('ExecutionStatusRecovering'))
        if (!this.intentionalClose && !this.finalReceived) {
          if (this.executionId) {
            this.recoverExecutionStatus()
          } else {
            this.handleRecoveryFailure()
          }
        }
      }
      this.ws.onmessage = (e) => this.handleMessage(JSON.parse(e.data))
    },
    handleMessage(data) {
      if (this.finalReceived) return
      switch (data.action) {
        case 'execution_started':
          this.executionId = data.execution_id
          this.phase = data.phase || 'scan'
          this.tip = this.$t('DiscoveringCloudAssets')
          break
        case 'sync_region':
          this.addRegion(data.id, data.name)
          break
        case 'import':
          data['@status'] = 'pending'
          this.$refs.importTable.addTableItem(data)
          break
        case 'imported':
          this.completeImport(data.asset_id)
          break
        case 'import_failed':
          this.completeImport(data.asset_id, data.reason || this.$t('Failed'))
          break
        case 'scan_finished': {
          this.executionId = data.execution_id || this.executionId
          this.phase = 'scan'
          this.stats = { ...this.stats, ...data }
          this.scanComplete = true
          this.scanStatus = data.status
          const canImport = [1, 4].includes(data.status)
          const tipKey = canImport
            ? data.status === 4
              ? this.$t('DiscoveryCompletedWithIssues')
              : this.$t(data.candidates ? 'DiscoveryCompleted' : 'NoCloudImportCandidates')
            : this.$t('DiscoveryFailed')
          this.setStatusDisplay(data.status, tipKey)
          break
        }
        case 'import_finished':
          this.completeExecution(data)
          break
        default:
          if (data.msg) this.$message.error(data.msg)
      }
    },
    importAsset(item) {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN || this.finalReceived) {
        item['@status'] = { name: 'error', error: this.$t('ExecutionStatusRecoveryFailed') }
        return Promise.resolve()
      }
      this.phase = 'import'
      return new Promise((resolve) => {
        this.importRequests[item.id] = { item, resolve }
        this.ws.send(JSON.stringify({ action: 'sync_import', asset_id: item.id }))
      })
    },
    completeImport(assetId, error = '') {
      const request = this.importRequests[assetId]
      if (!request) return
      request.item['@status'] = error ? { name: 'error', error } : 'ok'
      delete this.importRequests[assetId]
      request.resolve()
    },
    settleImports(error) {
      for (const assetId of Object.keys(this.importRequests)) {
        this.completeImport(assetId, error)
      }
      this.$refs.importTable?.performStop()
    },
    setStatusDisplay(status, tip) {
      this.linkType = status === 1 ? 'success' : status === 4 ? 'warning' : 'danger'
      this.linkIcon = status === 1 ? 'SuccessFilled' : 'CircleCloseFilled'
      this.tip = tip
    },
    async recoverExecutionStatus() {
      if (this.recovering) return
      const taskId = this.object.task?.id
      if (!taskId || !this.executionId) {
        this.handleRecoveryFailure()
        return
      }

      this.recovering = true
      this.tip = this.$t('ExecutionStatusRecovering')
      this.linkType = 'warning'
      this.linkIcon = 'Loading'
      const runId = ++this.recoveryRunId
      const deadline = Date.now() + RECOVERY_TIMEOUT_MS
      const url = `/api/v1/xpack/cloud/sync-instance-tasks/${taskId}/history/${this.executionId}/`
      let delay = RECOVERY_INITIAL_DELAY_MS

      while (this.isRecoveryActive(runId) && Date.now() < deadline) {
        try {
          const data = await this.$axios.get(url, { disableFlashErrorMsg: true })
          if (!this.isRecoveryActive(runId)) return
          if (!EXECUTION_IN_PROGRESS_STATUSES.includes(data.status)) {
            this.completeExecution(data)
            return
          }
        } catch (error) {
          if ([400, 401, 403, 404].includes(error.response?.status)) {
            this.handleRecoveryFailure()
            return
          }
          // Transient REST failures are retried until the bounded deadline.
        }

        const remaining = deadline - Date.now()
        if (remaining <= 0) break
        const shouldContinue = await this.waitForRecoveryDelay(Math.min(delay, remaining), runId)
        if (!shouldContinue) return
        delay = Math.min(Math.round(delay * 1.5), RECOVERY_MAX_DELAY_MS)
      }

      if (this.isRecoveryActive(runId)) {
        this.handleRecoveryFailure()
      }
    },
    isRecoveryActive(runId) {
      return (
        runId === this.recoveryRunId &&
        this.visible &&
        !this.intentionalClose &&
        !this.finalReceived
      )
    },
    waitForRecoveryDelay(delay, runId) {
      return new Promise((resolve) => {
        if (!this.isRecoveryActive(runId)) {
          resolve(false)
          return
        }
        this.recoveryWaitResolve = resolve
        this.recoveryTimer = setTimeout(() => {
          this.recoveryTimer = null
          this.recoveryWaitResolve = null
          resolve(this.isRecoveryActive(runId))
        }, delay)
      })
    },
    stopRecovery() {
      this.recoveryRunId += 1
      if (this.recoveryTimer) {
        clearTimeout(this.recoveryTimer)
        this.recoveryTimer = null
      }
      if (this.recoveryWaitResolve) {
        const resolve = this.recoveryWaitResolve
        this.recoveryWaitResolve = null
        resolve(false)
      }
      this.recovering = false
    },
    completeExecution(data) {
      this.finalReceived = true
      this.stopRecovery()
      this.finishing = false
      this.executionId = data.execution_id || this.executionId
      this.phase = data.phase || this.phase
      const summary = data.summary || {}
      this.stats = {
        ...this.stats,
        ...summary,
        ...data,
        discovered: data.discovered ?? summary.scanned ?? this.stats.discovered,
        skipped: data.skipped ?? summary.skip ?? this.stats.skipped,
        regions_scanned:
          data.regions_scanned ??
          (summary.regions ? Object.keys(summary.regions).length : this.stats.regions_scanned)
      }
      let tipKey
      if (data.status === 5) {
        tipKey = 'Cancelled'
      } else if (data.status === 6) {
        tipKey = 'Timeout'
      } else if (this.phase === 'scan') {
        tipKey =
          data.status === 1
            ? 'NoCloudImportCandidates'
            : data.status === 4
              ? 'DiscoveryFinishedWithIssues'
              : 'DiscoveryFailed'
      } else {
        tipKey =
          data.status === 1 ? 'DiscoveryAndImportCompleted' : 'DiscoveryAndImportFinishedWithIssues'
      }
      this.setStatusDisplay(data.status, this.$t(tipKey))
      this.settleImports(this.tip)
      this.closeWebSocket()
    },
    handleRecoveryFailure() {
      this.stopRecovery()
      this.recoveryFailed = true
      this.finishing = false
      this.linkType = 'danger'
      this.linkIcon = 'CircleCloseFilled'
      this.tip = this.$t('ExecutionStatusRecoveryFailed')
      this.settleImports(this.tip)
      this.$message.error(this.tip)
    },
    closeWebSocket() {
      const socket = this.ws
      this.ws = null
      if (socket && socket.readyState < WebSocket.CLOSING) {
        socket.close()
      }
    },
    addRegion(regionId, regionName) {
      if (!this.alreadySync.includes(regionId)) {
        this.alreadySync.push(regionId)
        this.tip = `${this.$t('SyncRegion')}: ${regionName}`
      }
    },
    showResult() {
      if (!this.scanComplete || this.finishing || this.importing || this.finalReceived) return
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        this.recoverExecutionStatus()
        return
      }
      this.finishing = true
      this.phase = 'import'
      this.ws.send(JSON.stringify({ action: 'sync_finish' }))
    },
    advanceOrClose() {
      if (this.finalReceived && this.active !== null) {
        this.$emit('update:active', 3)
      } else {
        this.closeDialog()
      }
    },
    closeDialog() {
      this.intentionalClose = true
      this.stopRecovery()
      this.settleImports(this.$t('Cancelled'))
      this.closeWebSocket()
      this.$emit('update:visible', false)
    }
  }
}
</script>
<style lang="scss" scoped>
.asset-panel {
  display: block;
}

.phase-stats {
  margin-bottom: 12px;
}
</style>
