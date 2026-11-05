<template>
  <Page :title="t('TaskMonitor')">
    <div class="task-monitor">
      <el-alert
        v-if="!canMonitor"
        :title="t('TaskMonitorNoPermission')"
        type="warning"
        :closable="false"
      />
      <template v-else>
        <div class="monitor-sampling" aria-live="polite">
          <span>{{ t('TaskMonitorSampledAt') }}: {{ formatTime(snapshot?.sampled_at) }}</span>
          <el-tag v-if="isStale" type="warning" effect="plain">{{ t('TaskMonitorStale') }}</el-tag>
          <span class="monitor-hint">{{ t('TaskMonitorPollingHelp') }}</span>
        </div>
        <el-alert
          v-if="loadError"
          :title="loadError"
          :description="snapshot ? t('TaskMonitorShowingLastSample') : ''"
          type="error"
          show-icon
          :closable="false"
        />
        <el-alert
          v-for="code in sampleErrors"
          :key="code"
          :title="errorLabel(code)"
          type="warning"
          show-icon
          :closable="false"
        />
        <div v-loading="loading && !snapshot" class="monitor-summary">
          <IBox v-for="metric in metrics" :key="metric.key" class="summary-card">
            <span class="summary-label">{{ t(metric.label) }}</span>
            <strong>{{ formatCount(snapshot?.summary?.[metric.key]) }}</strong>
          </IBox>
        </div>
        <IBox :title="t('TaskMonitorWorkers')">
          <el-table
            :data="workers"
            border
            row-key="name"
            highlight-current-row
            :empty-text="t('TaskMonitorNoWorkerData')"
          >
            <el-table-column
              prop="name"
              :label="t('TaskMonitorWorker')"
              min-width="220"
              show-overflow-tooltip
            >
              <template #default="{ row }">
                <el-link type="info" underline="never" @click="selectedWorkerName = row.name">{{
                  row.name
                }}</el-link>
              </template>
            </el-table-column>
            <el-table-column :label="t('Status')" width="125">
              <template #default="{ row }">
                <el-tag :type="row.status === 'online' ? 'success' : 'warning'" effect="plain">
                  {{ t(row.status === 'online' ? 'TaskMonitorOnline' : 'TaskMonitorUnavailable') }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column :label="t('TaskMonitorConcurrency')" width="100" align="right">
              <template #default="{ row }">{{ formatCount(row.concurrency) }}</template>
            </el-table-column>
            <el-table-column :label="t('TaskMonitorProcessed')" width="130" align="right">
              <template #default="{ row }">{{ formatCount(row.processed) }}</template>
            </el-table-column>
            <el-table-column
              v-for="state in taskStates"
              :key="state.key"
              :label="t(state.label)"
              width="115"
              align="right"
            >
              <template #default="{ row }">{{ formatCount(row[`${state.key}_count`]) }}</template>
            </el-table-column>
            <el-table-column :label="t('TaskMonitorQueues')" min-width="180" show-overflow-tooltip>
              <template #default="{ row }">{{ queueNames(row.queues) }}</template>
            </el-table-column>
          </el-table>
          <p class="monitor-hint">{{ t('TaskMonitorWorkerHelp') }}</p>
        </IBox>
        <IBox :title="t('TaskMonitorQueueDepth')">
          <el-table :data="queues" border :empty-text="t('NoData')">
            <el-table-column prop="name" :label="t('Queue')" min-width="220" />
            <el-table-column :label="t('TaskMonitorQueued')" min-width="150" align="right">
              <template #default="{ row }">{{ formatCount(row.pending) }}</template>
            </el-table-column>
          </el-table>
          <p class="monitor-hint">{{ t('TaskMonitorQueueHelp') }}</p>
        </IBox>
        <IBox :title="t('TaskMonitorWorkerTasks')">
          <div class="monitor-task-toolbar">
            <label for="monitor-worker">{{ t('TaskMonitorWorker') }}</label>
            <el-select
              id="monitor-worker"
              v-model="selectedWorkerName"
              :placeholder="t('TaskMonitorSelectWorker')"
              filterable
            >
              <el-option
                v-for="worker in workers"
                :key="worker.name"
                :label="worker.name"
                :value="worker.name"
              />
            </el-select>
            <span class="monitor-hint">{{ t('TaskMonitorTaskLimit', { count: taskLimit }) }}</span>
          </div>
          <el-tabs v-model="taskState">
            <el-tab-pane v-for="state in taskStates" :key="state.key" :name="state.key">
              <template #label
                >{{ t(state.label) }} ({{
                  formatCount(selectedWorker?.[`${state.key}_count`])
                }})</template
              >
            </el-tab-pane>
          </el-tabs>
          <el-alert
            v-if="listTruncated"
            :title="t('TaskMonitorTruncated', { count: taskLimit })"
            type="info"
            :closable="false"
          />
          <el-table :data="visibleTasks" border :empty-text="taskEmptyText">
            <el-table-column prop="id" :label="t('TaskID')" min-width="260" show-overflow-tooltip />
            <el-table-column prop="name" :label="t('Name')" min-width="260" show-overflow-tooltip />
            <el-table-column :label="t('TaskMonitorStartTime')" width="190">
              <template #default="{ row }">{{ formatTime(row.time_start) }}</template>
            </el-table-column>
            <el-table-column :label="t('TaskMonitorAcknowledged')" width="125">
              <template #default="{ row }">{{ booleanLabel(row.acknowledged) }}</template>
            </el-table-column>
            <el-table-column
              v-if="canViewLogs || canViewHistory || canStopTasks"
              :label="t('Actions')"
              min-width="190"
              fixed="right"
            >
              <template #default="{ row }">
                <div class="monitor-task-actions">
                  <el-link
                    v-if="canViewLogs && row.id"
                    type="info"
                    underline="never"
                    @click="openTaskPage(row.id)"
                    >{{ t('Output') }}</el-link
                  >
                  <el-link
                    v-if="canViewHistory && row.definition_id"
                    type="info"
                    underline="never"
                    @click="openHistory(row)"
                    >{{ t('ExecutionHistory') }}</el-link
                  >
                  <el-link
                    v-if="canStopTasks && row.id && row.routing_key === 'celery'"
                    type="danger"
                    underline="never"
                    :disabled="!canStopTask(row)"
                    :title="stopTaskHint(row)"
                    @click="stopTask(row)"
                    >{{ t(taskState === 'active' ? 'Stop' : 'TaskMonitorRevoke') }}</el-link
                  >
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-if="tasks.length > pageSize"
            v-model:current-page="taskPage"
            class="monitor-pagination"
            :page-size="pageSize"
            :total="tasks.length"
            layout="total, prev, pager, next"
            background
          />
          <p class="monitor-hint">{{ t('TaskMonitorHistoryHelp') }}</p>
        </IBox>
      </template>
    </div>
  </Page>
</template>

<script setup>
import { computed, onActivated, onBeforeUnmount, onDeactivated, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import Page from '@/layout/components/Page/index.vue'
import IBox from '@/components/Common/IBox/index.vue'
import request from '@/utils/request'
import { hasPermission, openTaskPage } from '@/utils/jms'

const { t, locale } = useI18n()
const router = useRouter()
const snapshot = ref(null)
const loading = ref(false)
const loadError = ref('')
const sampledNow = ref(Date.now())
const selectedWorkerName = ref('')
const taskState = ref('active')
const taskPage = ref(1)
const pageSize = 15
const pollInterval = 10000
const taskStates = [
  { key: 'active', label: 'TaskMonitorActive' },
  { key: 'reserved', label: 'TaskMonitorReserved' },
  { key: 'scheduled', label: 'TaskMonitorScheduled' }
]
const metrics = [
  { key: 'online_workers', label: 'TaskMonitorOnlineWorkers' },
  ...taskStates,
  { key: 'queued', label: 'TaskMonitorQueued' }
]
const canMonitor = computed(() => hasPermission('ops.view_taskmonitor'))
const canStopTasks = computed(() => hasPermission('ops.stop_taskmonitor'))
const stoppingTasks = ref(new Set())
const canViewTasks = computed(() => hasPermission('ops.view_celerytask'))
const canViewLogs = computed(() => hasPermission('ops.view_celerytaskexecution'))
const canViewHistory = computed(() => canViewTasks.value && canViewLogs.value)
const workers = computed(() => snapshot.value?.workers || [])
const queues = computed(() => snapshot.value?.queues || [])
const selectedWorker = computed(() =>
  workers.value.find((worker) => worker.name === selectedWorkerName.value)
)
const taskLimit = computed(() => snapshot.value?.task_limit || 100)
const tasks = computed(() =>
  (selectedWorker.value?.[taskState.value] || []).slice(0, taskLimit.value)
)
const visibleTasks = computed(() =>
  tasks.value.slice((taskPage.value - 1) * pageSize, taskPage.value * pageSize)
)
const taskEmptyText = computed(() =>
  typeof selectedWorker.value?.[`${taskState.value}_count`] === 'number'
    ? t('TaskMonitorNoTaskData')
    : t('TaskMonitorPartialData')
)
const listTruncated = computed(() => Boolean(selectedWorker.value?.truncated?.[taskState.value]))
const sampleErrors = computed(() => [...new Set(snapshot.value?.errors || [])])
const isStale = computed(() => {
  if (!snapshot.value) return false
  const timestamp = Date.parse(snapshot.value.sampled_at)
  return Boolean(
    loadError.value ||
    snapshot.value.stale ||
    !Number.isFinite(timestamp) ||
    sampledNow.value - timestamp > 30000
  )
})
let pollTimer = null
let requestController = null
let routeActive = false
let refreshRequested = false
let disposed = false

function formatCount(value) {
  return typeof value === 'number' && Number.isFinite(value) ? value.toLocaleString() : '—'
}

function formatTime(value) {
  if (value === null || value === undefined || value === '') return '—'
  const date = new Date(typeof value === 'number' ? value * 1000 : value)
  if (!Number.isFinite(date.getTime())) return '—'
  const language = locale.value.replace('_', '-')
  return date.toLocaleString(language, { hour12: false })
}

function booleanLabel(value) {
  return typeof value === 'boolean' ? t(value ? 'Yes' : 'No') : '—'
}

function queueNames(values) {
  return (
    (values || [])
      .map((value) => (typeof value === 'string' ? value : value.name))
      .filter(Boolean)
      .join(', ') || '—'
  )
}

function errorLabel(code) {
  const keys = {
    inspection_failed: 'TaskMonitorInspectionFailed',
    queue_depth_failed: 'TaskMonitorQueueFailed',
    no_workers: 'TaskMonitorNoWorkers',
    refresh_in_progress: 'TaskMonitorRefreshing'
  }
  return t(keys[code] || 'TaskMonitorPartialData')
}

function openHistory(task) {
  router.push({
    name: 'TaskDetail',
    params: { id: task.definition_id },
    query: { tab: 'TaskHistory' }
  })
}

function canStopTask(task) {
  return (
    selectedWorker.value?.status === 'online' &&
    !stoppingTasks.value.has(task.id) &&
    (taskState.value !== 'active' || selectedWorker.value?.pool === 'prefork')
  )
}

function stopTaskHint(task) {
  if (taskState.value === 'active' && selectedWorker.value?.pool !== 'prefork') {
    return t('TaskMonitorStopUnsupportedPool')
  }
  return ''
}

async function stopTask(task) {
  if (!canStopTask(task)) return
  const worker = selectedWorkerName.value
  const mode = taskState.value === 'active' ? 'running' : 'waiting'
  try {
    await ElMessageBox.confirm(
      t(mode === 'running' ? 'TaskMonitorStopConfirm' : 'TaskMonitorRevokeConfirm', {
        id: task.id
      }),
      t(mode === 'running' ? 'Stop' : 'TaskMonitorRevoke'),
      { type: 'warning', confirmButtonText: t('Confirm'), cancelButtonText: t('Cancel') }
    )
  } catch {
    return
  }
  stoppingTasks.value = new Set([...stoppingTasks.value, task.id])
  try {
    const result = await request.post(
      '/api/v1/ops/celery/monitor/stop/',
      {
        worker,
        task_id: task.id,
        mode
      },
      { timeout: 15000, disableFlashErrorMsg: true, 'axios-retry': { retries: 0 } }
    )
    ElMessage.success(
      t(result.status === 'revoked' ? 'TaskMonitorRevoked' : 'TaskMonitorStopRequested')
    )
    await loadSnapshot()
  } catch (error) {
    const keys = {
      already_running: 'TaskMonitorStopAlreadyRunning',
      not_running: 'TaskMonitorStopNotRunning',
      not_found: 'TaskMonitorStopNotFound',
      unsupported_queue: 'TaskMonitorStopUnsupportedQueue',
      unsupported_pool: 'TaskMonitorStopUnsupportedPool',
      unavailable: 'TaskMonitorStopUnavailable'
    }
    ElMessage.error(t(keys[error.response?.data?.status] || 'TaskMonitorStopUnavailable'))
    await loadSnapshot()
  } finally {
    const next = new Set(stoppingTasks.value)
    next.delete(task.id)
    stoppingTasks.value = next
  }
}

function canPoll() {
  return !disposed && routeActive && canMonitor.value && !document.hidden
}

function clearPollTimer() {
  window.clearTimeout(pollTimer)
  pollTimer = null
}

function pausePolling() {
  clearPollTimer()
  refreshRequested = false
  requestController?.abort()
}

async function loadSnapshot() {
  if (!canPoll()) return
  if (requestController) {
    refreshRequested = true
    return
  }
  clearPollTimer()
  const controller = new AbortController()
  requestController = controller
  loading.value = true
  try {
    const data = await request.get('/api/v1/ops/celery/monitor/', {
      signal: controller.signal,
      timeout: 15000,
      disableFlashErrorMsg: true,
      'axios-retry': { retries: 0 }
    })
    if (controller.signal.aborted || !canPoll()) return
    snapshot.value = data
    sampledNow.value = Date.now()
    loadError.value = ''
    if (!workers.value.some((worker) => worker.name === selectedWorkerName.value)) {
      selectedWorkerName.value = workers.value[0]?.name || ''
    }
  } catch (error) {
    if (controller.signal.aborted || !canPoll()) return
    sampledNow.value = Date.now()
    loadError.value = t(
      error.response?.status === 403 ? 'TaskMonitorNoPermission' : 'TaskMonitorLoadFailed'
    )
  } finally {
    requestController = null
    loading.value = false
    if (canPoll()) {
      pollTimer = window.setTimeout(loadSnapshot, refreshRequested ? 0 : pollInterval)
    }
    refreshRequested = false
  }
}

function activateRoute() {
  if (routeActive) return
  routeActive = true
  loadSnapshot()
}

function deactivateRoute() {
  routeActive = false
  pausePolling()
}

function onVisibilityChange() {
  if (document.hidden) pausePolling()
  else loadSnapshot()
}

watch([selectedWorkerName, taskState], () => {
  taskPage.value = 1
})
watch(
  () => tasks.value.length,
  (length) => {
    taskPage.value = Math.min(taskPage.value, Math.max(1, Math.ceil(length / pageSize)))
  }
)
watch(canMonitor, (allowed) => {
  if (allowed) loadSnapshot()
  else {
    pausePolling()
    snapshot.value = null
    selectedWorkerName.value = ''
  }
})
onMounted(() => {
  document.addEventListener('visibilitychange', onVisibilityChange)
  activateRoute()
})
onActivated(activateRoute)
onDeactivated(deactivateRoute)
onBeforeUnmount(() => {
  disposed = true
  deactivateRoute()
  document.removeEventListener('visibilitychange', onVisibilityChange)
})
</script>

<style scoped lang="scss">
.task-monitor {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.monitor-sampling,
.monitor-task-toolbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}
.monitor-sampling {
  font-size: 12px;
}
.monitor-hint {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  line-height: 1.6;
}
p.monitor-hint {
  margin: 12px 0 0;
}
.monitor-summary {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 16px;
}
.summary-card {
  min-width: 0;
  strong {
    margin-top: 8px;
    color: var(--el-text-color-primary);
    font-size: 26px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
}
.summary-label {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}
.monitor-task-toolbar {
  margin-bottom: 12px;
  label {
    margin: 0;
    font-size: 13px;
  }
  .el-select {
    width: 320px;
    max-width: 100%;
  }
}
.monitor-task-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.monitor-pagination {
  margin-top: 16px;
  justify-content: flex-end;
}
:deep(.el-alert + .el-table) {
  margin-top: 12px;
}
@media (max-width: 1000px) {
  .monitor-summary {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}
@media (max-width: 600px) {
  .monitor-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
