<template>
  <el-dialog
    append-to-body
    class="scheduled-reports-dialog-shell"
    :close-on-click-modal="false"
    :close-on-press-escape="!saving"
    :before-close="handleBeforeClose"
    destroy-on-close
    :model-value="modelValue"
    width="min(820px, calc(100vw - 24px))"
    @closed="resetEditor"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="scheduled-reports-dialog__heading">
        <span class="scheduled-reports-dialog__heading-icon">
          <el-icon><Calendar /></el-icon>
        </span>
        <div>
          <h2>{{ t('ChatAIScheduledReports') }}</h2>
          <p>{{ t('ChatAIScheduledReportsDescription') }}</p>
        </div>
      </div>
    </template>

    <div ref="scrollContainer" class="scheduled-reports" :aria-busy="loading || saving">
      <div class="scheduled-reports__toolbar">
        <span class="scheduled-reports__count">
          <strong>{{ reports.length }}</strong>
          <small>{{ t('ChatAIScheduledReports') }}</small>
        </span>
        <el-button
          :disabled="editing || saving || Boolean(runningId)"
          type="primary"
          @click="beginCreate"
        >
          <el-icon><Plus /></el-icon>
          {{ t('ChatAINewScheduledReport') }}
        </el-button>
      </div>

      <form v-if="editing" class="report-editor" @submit.prevent="save">
        <header class="report-editor__heading">
          <strong>{{ editingId ? t('Edit') : t('ChatAINewScheduledReport') }}</strong>
          <button
            :aria-label="t('Close')"
            :disabled="saving"
            :title="t('Close')"
            type="button"
            @click="resetEditor"
          >
            <el-icon><Close /></el-icon>
          </button>
        </header>
        <div class="report-editor__grid">
          <label :class="{ 'has-error': attemptedSave && !form.name.trim() }">
            <span>{{ t('Name') }}</span>
            <el-input
              ref="nameInput"
              v-model="form.name"
              :aria-invalid="attemptedSave && !form.name.trim()"
              aria-describedby="scheduled-report-name-error"
              maxlength="128"
            />
            <small
              v-if="attemptedSave && !form.name.trim()"
              id="scheduled-report-name-error"
              class="report-field-error"
              role="alert"
            >
              {{ t('ChatAIFieldRequired') }}
            </small>
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

        <label :class="{ 'has-error': attemptedSave && !form.prompt.trim() }">
          <span>{{ t('ChatAIScheduledPrompt') }}</span>
          <el-input
            ref="promptInput"
            v-model="form.prompt"
            :aria-invalid="attemptedSave && !form.prompt.trim()"
            aria-describedby="scheduled-report-prompt-error"
            :autosize="{ minRows: 3, maxRows: 7 }"
            maxlength="32000"
            show-word-limit
            type="textarea"
          />
          <small
            v-if="attemptedSave && !form.prompt.trim()"
            id="scheduled-report-prompt-error"
            class="report-field-error"
            role="alert"
          >
            {{ t('ChatAIFieldRequired') }}
          </small>
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
          <label v-else :class="{ 'has-error': attemptedSave && !form.crontab.trim() }">
            <span>{{ t('Crontab') }}</span>
            <el-input
              ref="crontabInput"
              v-model="form.crontab"
              :aria-invalid="attemptedSave && !form.crontab.trim()"
              aria-describedby="scheduled-report-crontab-error"
              placeholder="0 8 * * *"
            />
            <small
              v-if="attemptedSave && !form.crontab.trim()"
              id="scheduled-report-crontab-error"
              class="report-field-error"
              role="alert"
            >
              {{ t('ChatAIFieldRequired') }}
            </small>
          </label>
        </div>

        <div class="report-editor__switches">
          <el-checkbox v-model="form.isActive">{{ t('ChatAIScheduleActive') }}</el-checkbox>
          <el-checkbox v-model="form.notify">{{ t('ChatAIScheduleNotify') }}</el-checkbox>
          <el-checkbox v-if="webSearchAvailable" v-model="form.webSearch">
            {{ t('ChatAIWebSearch') }}
          </el-checkbox>
        </div>

        <div class="report-editor__preview">
          <el-icon><Clock /></el-icon>
          <span>{{ t('ChatAISchedulePreview', { schedule: formSchedulePreview }) }}</span>
        </div>

        <div class="report-editor__actions">
          <el-button :disabled="saving" @click="resetEditor">{{ t('Cancel') }}</el-button>
          <el-button :loading="saving" native-type="submit" type="primary">
            {{ t('Save') }}
          </el-button>
        </div>
      </form>

      <div v-if="loading" class="reports-loading">
        <el-skeleton :rows="4" animated />
      </div>
      <section v-else-if="loadError" class="reports-load-error" role="alert">
        <strong>{{ t('ChatAILoadFailedTitle') }}</strong>
        <p>{{ loadError }}</p>
        <el-button type="primary" @click="load">{{ t('ChatAIRetryLoad') }}</el-button>
      </section>
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
              :disabled="editing || Boolean(runningId && runningId !== report.id)"
              :loading="runningId === report.id"
              size="small"
              type="primary"
              @click="run(report)"
            >
              <el-icon><VideoPlay /></el-icon>
              {{ t('ChatAIRunNow') }}
            </el-button>
            <el-button
              :disabled="editing || Boolean(runningId)"
              size="small"
              @click="beginEdit(report)"
            >
              <el-icon><EditPen /></el-icon>
              {{ t('Edit') }}
            </el-button>
            <el-button
              :disabled="editing || Boolean(runningId)"
              size="small"
              type="danger"
              @click="remove(report)"
            >
              <el-icon><Delete /></el-icon>
              {{ t('Delete') }}
            </el-button>
          </div>
        </article>
      </div>
    </div>
  </el-dialog>
</template>

<script setup>
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { Calendar, Clock, Close, Delete, EditPen, Plus, VideoPlay } from '@element-plus/icons-vue'
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
const loadError = ref('')
const saving = ref(false)
const runningId = ref('')
const editing = ref(false)
const editingId = ref('')
const attemptedSave = ref(false)
const nameInput = ref(null)
const promptInput = ref(null)
const crontabInput = ref(null)
const scrollContainer = ref(null)
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
const formSchedulePreview = computed(() => {
  if (form.scheduleType === 'interval') {
    return t('ChatAIEveryHours', { count: Number(form.interval) || 1 })
  }
  return form.crontab.trim() || '—'
})

function pageResults(response) {
  return Array.isArray(response) ? response : response?.results || []
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    reports.value = pageResults(await listScheduledReports())
  } catch (error) {
    loadError.value =
      error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
  } finally {
    loading.value = false
  }
}

function resetEditor() {
  editing.value = false
  editingId.value = ''
  attemptedSave.value = false
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
  focusEditor()
}

function beginEdit(report) {
  attemptedSave.value = false
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
  focusEditor()
}

function focusEditor() {
  nextTick(() => {
    scrollContainer.value?.scrollTo({ top: 0, behavior: 'smooth' })
    nameInput.value?.focus()
  })
}

function handleBeforeClose(done) {
  if (!saving.value) done()
}

async function save() {
  attemptedSave.value = true
  if (!form.name.trim()) {
    await nextTick()
    nameInput.value?.focus()
    return
  }
  if (!form.prompt.trim()) {
    await nextTick()
    promptInput.value?.focus()
    return
  }
  if (form.scheduleType === 'crontab' && !form.crontab.trim()) {
    await nextTick()
    crontabInput.value?.focus()
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
    message.success(t('ChatAIScheduledReportDeleted'))
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
:global(.scheduled-reports-dialog-shell.el-dialog) {
  --reports-primary: var(--el-color-primary, #1ab394);
  --reports-primary-dark: var(--el-color-primary-dark-2, #148f76);
  --reports-primary-light: var(--el-color-primary-light-9, #e8f7f3);
  --reports-border: var(--color-border, #e9ecef);
  --reports-text: var(--color-text-primary, #292827);
  --reports-text-secondary: var(--color-text-secondary, #7c7c7c);
  display: flex;
  max-height: calc(100dvh - 40px);
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--reports-border);
  border-radius: 10px;
  box-shadow: 0 18px 48px rgb(23 43 38 / 20%);
}

:global(.scheduled-reports-dialog-shell .el-dialog__header) {
  flex: 0 0 auto;
  margin: 0;
  padding: 17px 22px;
  border-bottom: 1px solid var(--reports-border);
  background: #fff;
}

:global(.scheduled-reports-dialog-shell .el-dialog__headerbtn) {
  top: 18px;
  right: 18px;
  display: inline-flex;
  width: 32px;
  height: 32px;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  transition:
    color 0.16s ease,
    background 0.16s ease;
}

:global(.scheduled-reports-dialog-shell .el-dialog__headerbtn:hover) {
  background: var(--reports-primary-light);
}

:global(.scheduled-reports-dialog-shell .el-dialog__headerbtn .el-dialog__close) {
  color: #758078;
  font-size: 16px;
}

:global(.scheduled-reports-dialog-shell .el-dialog__headerbtn:hover .el-dialog__close) {
  color: var(--reports-primary-dark);
}

:global(.scheduled-reports-dialog-shell .el-dialog__body) {
  min-height: 0;
  flex: 1 1 auto;
  padding: 0;
  overflow: hidden;
}

.scheduled-reports-dialog__heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding-right: 44px;

  h2 {
    margin: 0;
    color: var(--reports-text, #292827);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.35;
  }

  p {
    margin: 3px 0 0;
    color: var(--reports-text-secondary, #7c7c7c);
    font-size: 11px;
    line-height: 1.45;
  }
}

.scheduled-reports-dialog__heading-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 8px;
  color: var(--reports-primary-dark, #148f76);
  background: var(--reports-primary-light, #e8f7f3);
  font-size: 18px;
}

.scheduled-reports {
  box-sizing: border-box;
  min-height: 360px;
  max-height: calc(100dvh - 112px);
  padding: 18px 20px 20px;
  overflow: auto;
  scrollbar-color: #cbd4cf transparent;
  scrollbar-width: thin;
}

.scheduled-reports__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;

  :deep(.el-button) {
    height: 34px;
    border-radius: 7px;
    font-weight: 600;
  }
}

.scheduled-reports__count {
  display: flex;
  align-items: baseline;
  gap: 6px;

  strong {
    color: var(--reports-text, #292827);
    font-size: 20px;
    font-variant-numeric: tabular-nums;
    font-weight: 600;
  }

  small {
    color: var(--reports-text-secondary, #7c7c7c);
    font-size: 11px;
  }
}

.report-editor {
  display: grid;
  gap: 14px;
  margin-bottom: 18px;
  padding: 16px;
  border: 1px solid var(--reports-border, #e9ecef);
  border-radius: 10px;
  background: #fafbfb;

  label {
    display: grid;
    gap: 7px;

    > span {
      color: #4d5260;
      font-size: 12px;
      font-weight: 600;
    }

    &.has-error {
      :deep(.el-input__wrapper),
      :deep(.el-textarea__inner) {
        box-shadow: 0 0 0 1px var(--el-color-danger, #f56c6c) inset;
      }
    }
  }
}

.report-field-error {
  color: var(--el-color-danger, #f56c6c);
  font-size: 10px;
  line-height: 1.35;
}

.report-editor__heading {
  display: flex;
  min-height: 30px;
  align-items: center;
  justify-content: space-between;
  padding-bottom: 2px;

  strong {
    color: var(--reports-text, #292827);
    font-size: 13px;
    font-weight: 600;
  }

  button {
    display: grid;
    width: 28px;
    height: 28px;
    padding: 0;
    place-items: center;
    border: 0;
    border-radius: 7px;
    color: #77817c;
    background: transparent;
    cursor: pointer;

    &:hover,
    &:focus-visible {
      color: var(--reports-primary-dark, #148f76);
      background: var(--reports-primary-light, #e8f7f3);
      outline: none;
    }

    &:disabled {
      cursor: not-allowed;
      opacity: 0.45;
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
  flex-wrap: wrap;
  gap: 16px;
}

.report-editor__preview {
  display: flex;
  min-height: 36px;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid #dcebe7;
  border-radius: 8px;
  color: #53736a;
  background: #f3faf8;
  font-size: 11px;

  .el-icon {
    color: var(--reports-primary-dark, #148f76);
    font-size: 14px;
  }
}

.report-editor__actions {
  justify-content: flex-end;

  :deep(.el-button) {
    min-width: 72px;
    border-radius: 7px;
  }
}

.reports-loading {
  padding: 22px 16px;
  border: 1px solid var(--reports-border, #e9ecef);
  border-radius: 10px;
}

.reports-load-error {
  display: flex;
  min-height: 220px;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border: 1px dashed #e2c5c8;
  border-radius: 10px;
  color: #8d5d64;
  background: #fff8f8;
  text-align: center;
  flex-direction: column;

  strong {
    color: #67484d;
    font-size: 13px;
  }

  p {
    max-width: 440px;
    margin: 7px 0 14px;
    font-size: 11px;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }
}

.report-list {
  display: grid;
  gap: 10px;
}

.report-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 14px;
  border: 1px solid var(--reports-border, #e9ecef);
  border-radius: 10px;
  background: #fff;
  transition:
    border-color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;

  &:hover {
    border-color: #cde6df;
    box-shadow: 0 7px 18px rgb(31 49 43 / 7%);
    transform: translateY(-1px);
  }
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
  flex-wrap: wrap;
  gap: 8px;

  strong {
    color: var(--reports-text, #292827);
    font-size: 13px;
    font-weight: 600;
  }

  :deep(.el-tag) {
    border-radius: 999px;
  }
}

.report-item__error {
  display: block;
  margin-top: 5px;
  color: #e55464 !important;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.report-item__actions {
  display: flex;
  flex-shrink: 0;

  :deep(.el-button) {
    margin-left: 6px;
    border-radius: 7px;
  }
}

:deep(.el-empty) {
  min-height: 260px;
  border: 1px dashed #dce3e0;
  border-radius: 10px;
  background: #fafbfb;
}

@media (max-width: 720px) {
  :global(.scheduled-reports-dialog-shell.el-dialog) {
    max-height: calc(100dvh - 20px);
    border-radius: 8px;
  }

  :global(.scheduled-reports-dialog-shell .el-dialog__header) {
    padding: 14px 16px;
  }

  :global(.scheduled-reports-dialog-shell .el-dialog__headerbtn) {
    top: 14px;
    right: 12px;
  }

  .scheduled-reports-dialog__heading p {
    display: none;
  }

  .scheduled-reports {
    max-height: calc(100dvh - 84px);
    padding: 14px;
  }

  .report-editor__grid {
    grid-template-columns: 1fr;
  }

  .report-item {
    display: grid;
  }

  .report-item__actions {
    display: grid;
    grid-template-columns: repeat(3, 1fr);

    :deep(.el-button) {
      width: 100%;
      margin-left: 0;
    }
  }
}
</style>
