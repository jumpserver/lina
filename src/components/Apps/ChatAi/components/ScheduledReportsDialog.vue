<template>
  <el-dialog
    append-to-body
    destroy-on-close
    :model-value="modelValue"
    :title="t('ChatAIScheduledReports')"
    width="min(760px, calc(100vw - 24px))"
    @closed="resetEditor"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="scheduled-reports">
      <div class="scheduled-reports__toolbar">
        <p>{{ t('ChatAIScheduledReportsDescription') }}</p>
        <el-button type="primary" @click="beginCreate">
          <el-icon><Plus /></el-icon>
          {{ t('ChatAINewScheduledReport') }}
        </el-button>
      </div>

      <section v-if="editing" class="report-editor">
        <div class="report-editor__grid">
          <label>
            <span>{{ t('Name') }}</span>
            <el-input v-model="form.name" maxlength="128" />
          </label>
          <label>
            <span>{{ t('ChatAIAssistant') }}</span>
            <el-select v-model="form.assistant">
              <el-option
                v-for="assistant in assistants"
                :key="assistant.key"
                :label="assistant.name"
                :value="assistant.key"
              />
            </el-select>
          </label>
        </div>

        <label>
          <span>{{ t('ChatAIScheduledPrompt') }}</span>
          <el-input
            v-model="form.prompt"
            :autosize="{ minRows: 3, maxRows: 7 }"
            maxlength="32000"
            show-word-limit
            type="textarea"
          />
        </label>

        <div class="report-editor__grid">
          <label>
            <span>{{ t('ChatAIScheduleType') }}</span>
            <el-radio-group v-model="form.scheduleType">
              <el-radio-button value="interval">{{ t('ChatAIInterval') }}</el-radio-button>
              <el-radio-button value="crontab">{{ t('Crontab') }}</el-radio-button>
            </el-radio-group>
          </label>
          <label v-if="form.scheduleType === 'interval'">
            <span>{{ t('ChatAIIntervalHours') }}</span>
            <el-input-number v-model="form.interval" :max="65535" :min="1" />
          </label>
          <label v-else>
            <span>{{ t('Crontab') }}</span>
            <el-input v-model="form.crontab" placeholder="0 8 * * *" />
          </label>
        </div>

        <div class="report-editor__switches">
          <el-checkbox v-model="form.isActive">{{ t('ChatAIScheduleActive') }}</el-checkbox>
          <el-checkbox v-model="form.notify">{{ t('ChatAIScheduleNotify') }}</el-checkbox>
          <el-checkbox v-if="webSearchAvailable" v-model="form.webSearch">
            {{ t('ChatAIWebSearch') }}
          </el-checkbox>
        </div>

        <div class="report-editor__actions">
          <el-button @click="resetEditor">{{ t('Cancel') }}</el-button>
          <el-button :loading="saving" type="primary" @click="save">
            {{ t('Save') }}
          </el-button>
        </div>
      </section>

      <div v-if="loading" class="reports-loading">
        <el-skeleton :rows="4" animated />
      </div>
      <el-empty
        v-else-if="!reports.length"
        :description="t('ChatAINoScheduledReports')"
        :image-size="72"
      />
      <div v-else class="report-list">
        <article v-for="report in reports" :key="report.id" class="report-item">
          <div class="report-item__main">
            <div class="report-item__title">
              <strong>{{ report.name }}</strong>
              <el-tag :type="report.is_active ? 'success' : 'info'" size="small">
                {{ report.is_active ? t('ChatAIScheduleEnabled') : t('ChatAIScheduleDisabled') }}
              </el-tag>
              <el-tag v-if="report.last_status" size="small" type="info">
                {{ statusLabel(report.last_status) }}
              </el-tag>
            </div>
            <p>{{ report.prompt }}</p>
            <small>
              {{ assistantName(report.assistant) }} ·
              {{ report.periodic_display || scheduleLabel(report) }}
              <template v-if="report.date_last_run">
                · {{ t('ChatAILastRun') }} {{ formatDate(report.date_last_run) }}
              </template>
            </small>
            <small v-if="report.last_error" class="report-item__error">
              {{ report.last_error }}
            </small>
          </div>
          <div class="report-item__actions">
            <el-button
              :loading="runningId === report.id"
              size="small"
              type="primary"
              @click="run(report)"
            >
              {{ t('ChatAIRunNow') }}
            </el-button>
            <el-button size="small" @click="beginEdit(report)">{{ t('Edit') }}</el-button>
            <el-button size="small" type="danger" @click="remove(report)">
              {{ t('Delete') }}
            </el-button>
          </div>
        </article>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, watch } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

import {
  createScheduledReport,
  deleteScheduledReport,
  listScheduledReports,
  runScheduledReport,
  updateScheduledReport
} from '@/api/chatAi'
import { message } from '@/utils/vue/message'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  assistants: {
    type: Array,
    default: () => []
  },
  webSearchAvailable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'open-conversation'])
const { t } = useI18n()
const reports = ref([])
const loading = ref(false)
const saving = ref(false)
const runningId = ref('')
const editing = ref(false)
const editingId = ref('')
const form = reactive({
  name: '',
  prompt: '',
  assistant: 'ops',
  scheduleType: 'interval',
  interval: 24,
  crontab: '0 8 * * *',
  isActive: true,
  notify: true,
  webSearch: false
})

function pageResults(response) {
  return Array.isArray(response) ? response : response?.results || []
}

async function load() {
  loading.value = true
  try {
    reports.value = pageResults(await listScheduledReports())
  } catch (error) {
    message.error(
      error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
    )
  } finally {
    loading.value = false
  }
}

function resetEditor() {
  editing.value = false
  editingId.value = ''
  Object.assign(form, {
    name: '',
    prompt: '',
    assistant: 'ops',
    scheduleType: 'interval',
    interval: 24,
    crontab: '0 8 * * *',
    isActive: true,
    notify: true,
    webSearch: false
  })
}

function beginCreate() {
  resetEditor()
  editing.value = true
}

function beginEdit(report) {
  editing.value = true
  editingId.value = report.id
  Object.assign(form, {
    name: report.name,
    prompt: report.prompt,
    assistant: report.assistant || 'ops',
    scheduleType: report.crontab ? 'crontab' : 'interval',
    interval: report.interval || 24,
    crontab: report.crontab || '0 8 * * *',
    isActive: report.is_active,
    notify: report.notify,
    webSearch: report.web_search && props.webSearchAvailable
  })
}

async function save() {
  if (!form.name.trim() || !form.prompt.trim()) {
    message.warning(t('ChatAIScheduledReportRequired'))
    return
  }
  if (form.scheduleType === 'crontab' && !form.crontab.trim()) {
    message.warning(t('ChatAICrontabRequired'))
    return
  }
  const payload = {
    name: form.name.trim(),
    prompt: form.prompt,
    assistant: form.assistant,
    web_search: form.webSearch && props.webSearchAvailable,
    notify: form.notify,
    is_active: form.isActive,
    is_periodic: true,
    interval: form.scheduleType === 'interval' ? Number(form.interval) : null,
    crontab: form.scheduleType === 'crontab' ? form.crontab.trim() : ''
  }
  saving.value = true
  try {
    if (editingId.value) await updateScheduledReport(editingId.value, payload)
    else await createScheduledReport(payload)
    message.success(t('ChatAIScheduledReportSaved'))
    resetEditor()
    await load()
  } catch (error) {
    message.error(
      error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
    )
  } finally {
    saving.value = false
  }
}

async function run(report) {
  runningId.value = report.id
  try {
    const result = await runScheduledReport(report.id)
    message.success(t('ChatAIScheduledReportQueued'))
    await load()
    if (result?.conversation_id) emit('open-conversation', result.conversation_id)
  } catch (error) {
    message.error(
      error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
    )
  } finally {
    runningId.value = ''
  }
}

async function remove(report) {
  try {
    await ElMessageBox.confirm(
      t('ChatAIDeleteScheduledReportDescription', { name: report.name }),
      t('ChatAIDeleteScheduledReport'),
      {
        confirmButtonText: t('Delete'),
        cancelButtonText: t('Cancel'),
        type: 'warning',
        modalClass: 'chat-ai-message-box-overlay'
      }
    )
    await deleteScheduledReport(report.id)
    reports.value = reports.value.filter((item) => item.id !== report.id)
    if (editingId.value === report.id) resetEditor()
  } catch (error) {
    if (error === 'cancel' || error === 'close') return
    message.error(
      error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
    )
  }
}

function assistantName(key) {
  return props.assistants.find((item) => item.key === key)?.name || key
}

function scheduleLabel(report) {
  if (report.crontab) return report.crontab
  return t('ChatAIEveryHours', { count: report.interval || 24 })
}

function statusLabel(value) {
  const labels = {
    queued: t('ChatAIQueued'),
    running: t('ChatAIWorking'),
    completed: t('ChatAICompleted'),
    failed: t('ChatAIFailed'),
    cancelled: t('ChatAICancelled'),
    quota_exceeded: t('ChatAIQuotaExceeded')
  }
  return labels[value] || value
}

function formatDate(value) {
  if (!value) return '-'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  }
)
</script>

<style scoped lang="scss">
.scheduled-reports {
  min-height: 280px;
}

.scheduled-reports__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  p {
    margin: 0;
    color: #737987;
    font-size: 13px;
  }
}

.report-editor {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid #e6e8ed;
  border-radius: 10px;
  background: #fafbfc;

  label {
    display: grid;
    gap: 7px;

    > span {
      color: #4d5260;
      font-size: 12px;
      font-weight: 600;
    }
  }
}

.report-editor__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}

.report-editor__switches,
.report-editor__actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.report-editor__actions {
  justify-content: flex-end;
}

.reports-loading {
  padding: 18px 0;
}

.report-list {
  display: grid;
  gap: 10px;
  max-height: 440px;
  overflow: auto;
}

.report-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid #e7e9ee;
  border-radius: 10px;
}

.report-item__main {
  min-width: 0;

  p {
    display: -webkit-box;
    margin: 8px 0;
    overflow: hidden;
    color: #606675;
    font-size: 13px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  small {
    color: #8a909d;
  }
}

.report-item__title {
  display: flex;
  align-items: center;
  gap: 8px;
}

.report-item__error {
  display: block;
  margin-top: 5px;
  color: #e55464 !important;
}

.report-item__actions {
  display: flex;
  flex-shrink: 0;
}

@media (max-width: 720px) {
  .report-editor__grid {
    grid-template-columns: 1fr;
  }

  .report-item {
    display: grid;
  }
}
</style>
