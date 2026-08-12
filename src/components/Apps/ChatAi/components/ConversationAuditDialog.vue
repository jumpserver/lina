<template>
  <el-dialog
    append-to-body
    class="audit-dialog-shell"
    :close-on-click-modal="false"
    destroy-on-close
    :model-value="modelValue"
    width="min(980px, calc(100vw - 24px))"
    @closed="reset"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <template #header>
      <div class="audit-dialog__heading">
        <span class="audit-dialog__heading-icon">
          <el-icon><DocumentChecked /></el-icon>
        </span>
        <div>
          <h2>{{ t('ChatAIConversationAudit') }}</h2>
          <p>{{ t('ChatAIAuditSubtitle') }}</p>
        </div>
      </div>
    </template>

    <div class="audit-dialog">
      <section class="audit-security-notice">
        <span class="audit-security-notice__icon">
          <el-icon><Lock /></el-icon>
        </span>
        <div class="audit-security-notice__content">
          <strong>{{ t('ChatAIAuditSecurityTitle') }}</strong>
          <p>{{ t('ChatAIConversationAuditNotice') }}</p>
        </div>
        <span class="audit-security-notice__badge">
          {{ t('ChatAIAuditReadOnly') }}
        </span>
      </section>

      <template v-if="selected">
        <div class="audit-detail__toolbar">
          <el-button class="audit-back-button" @click="selected = null">
            <el-icon><ArrowLeft /></el-icon>
            {{ t('ChatAIAuditBackToList') }}
          </el-button>
          <span class="audit-access-logged">
            <el-icon><Check /></el-icon>
            {{ t('ChatAIAuditAccessLogged') }}
          </span>
        </div>

        <el-skeleton v-if="detailLoading" :rows="8" animated />
        <section v-else class="audit-detail">
          <header>
            <span class="audit-owner__avatar is-large">
              {{ userInitial(selected.user) }}
            </span>
            <div class="audit-detail__identity">
              <h3>{{ selected.title || t('ChatAIUntitledConversation') }}</h3>
              <p>{{ userDisplay(selected.user) }}</p>
              <div class="audit-detail__metadata">
                <span class="audit-assistant-badge">
                  {{ assistantLabel(selected.assistant) }}
                </span>
                <span>{{ formatDate(selected.date_updated) }}</span>
              </div>
            </div>
            <el-tag class="audit-readonly-tag" effect="plain" size="small" type="info">
              {{ t('ChatAIAuditReadOnly') }}
            </el-tag>
          </header>

          <el-empty
            v-if="!selected.messages?.length"
            :description="t('ChatAIAuditNoMessages')"
            :image-size="72"
          />
          <div v-else class="audit-message-list">
            <article
              v-for="item in selected.messages"
              :key="item.id"
              :class="['audit-message', `is-${item.role}`]"
            >
              <div class="audit-message__meta">
                <strong>{{ roleLabel(item.role) }}</strong>
                <span>{{ formatDate(item.date_created) }}</span>
              </div>
              <div class="audit-message__content">
                {{ item.content || item.error || '—' }}
              </div>
              <div v-if="attachmentCount(item)" class="audit-message__attachments">
                <span>{{ t('ChatAIAuditAttachmentMetadata') }}</span>
                <el-tag
                  v-for="file in [...(item.images || []), ...(item.files || [])]"
                  :key="file.id"
                  effect="plain"
                  size="small"
                >
                  {{ file.name }} · {{ formatFileSize(file.size) }}
                </el-tag>
              </div>
            </article>
          </div>
        </section>
      </template>

      <template v-else>
        <div class="audit-list__toolbar">
          <div class="audit-list__heading">
            <strong>{{ t('ChatAIAuditConversationList') }}</strong>
            <span>{{ t('ChatAIAuditConversationCount', { count: total }) }}</span>
          </div>
          <div class="audit-list__search">
            <el-input
              v-model="search"
              clearable
              :placeholder="t('ChatAIAuditSearchPlaceholder')"
              @clear="handleSearch"
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <el-button :loading="loading" type="primary" @click="handleSearch">
              <el-icon><Search /></el-icon>
              {{ t('Search') }}
            </el-button>
          </div>
        </div>

        <section v-if="loadError" class="audit-load-error" role="alert">
          <strong>{{ t('ChatAILoadFailedTitle') }}</strong>
          <p>{{ loadError }}</p>
          <el-button type="primary" @click="load">{{ t('ChatAIRetryLoad') }}</el-button>
        </section>

        <div v-else class="audit-table-card">
          <el-table
            v-loading="loading"
            :data="conversations"
            max-height="430"
            row-class-name="audit-table-row"
            @row-click="openDetail"
          >
            <el-table-column :label="t('ChatAIAuditOwner')" min-width="185">
              <template #default="{ row }">
                <div class="audit-owner">
                  <span class="audit-owner__avatar">{{ userInitial(row.user) }}</span>
                  <span class="audit-owner__identity">
                    <strong>{{ row.user?.name || row.user?.username || '—' }}</strong>
                    <small v-if="row.user?.name && row.user?.username">
                      {{ row.user.username }}
                    </small>
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column :label="t('ChatAIConversationTitle')" min-width="260">
              <template #default="{ row }">
                <span
                  class="audit-conversation-title"
                  :title="row.title || t('ChatAIUntitledConversation')"
                >
                  {{ row.title || t('ChatAIUntitledConversation') }}
                </span>
              </template>
            </el-table-column>
            <el-table-column :label="t('ChatAIAssistant')" min-width="125">
              <template #default="{ row }">
                <span class="audit-assistant-badge">
                  {{ assistantLabel(row.assistant) }}
                </span>
              </template>
            </el-table-column>
            <el-table-column align="center" :label="t('ChatAIAuditQuestions')" width="88">
              <template #default="{ row }">
                <span class="audit-question-count">{{ questionCount(row) }}</span>
              </template>
            </el-table-column>
            <el-table-column :label="t('ChatAIAuditUpdated')" min-width="158">
              <template #default="{ row }">
                <span class="audit-date">{{ formatDate(row.date_updated) }}</span>
              </template>
            </el-table-column>
            <el-table-column align="right" width="88">
              <template #default="{ row }">
                <el-button
                  class="audit-open-button"
                  link
                  type="primary"
                  @click.stop="openDetail(row)"
                >
                  {{ t('View') }}
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </template>
            </el-table-column>
            <template #empty>
              <el-empty :description="t('ChatAIAuditNoConversations')" :image-size="72" />
            </template>
          </el-table>
        </div>

        <footer v-if="total > pageSize" class="audit-list__footer">
          <span>{{ t('ChatAIAuditConversationCount', { count: total }) }}</span>
          <el-pagination
            background
            layout="prev, pager, next"
            :current-page="page"
            :page-size="pageSize"
            :total="total"
            @current-change="handlePageChange"
          />
        </footer>
      </template>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  DocumentChecked,
  Lock,
  Search
} from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'

import { getAuditedConversation, listAuditedConversations } from '@/api/chatAi'
import { message } from '@/utils/vue/message'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])
const { t } = useI18n()
const pageSize = 20
const conversations = ref([])
const total = ref(0)
const page = ref(1)
const search = ref('')
const selected = ref(null)
const loading = ref(false)
const loadError = ref('')
const detailLoading = ref(false)

function errorDetail(error) {
  return error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    const response = await listAuditedConversations({
      limit: pageSize,
      offset: (page.value - 1) * pageSize,
      search: search.value.trim() || undefined
    })
    conversations.value = Array.isArray(response) ? response : response?.results || []
    total.value = Array.isArray(response) ? response.length : Number(response?.count || 0)
  } catch (error) {
    loadError.value = errorDetail(error)
  } finally {
    loading.value = false
  }
}

async function openDetail(conversation) {
  selected.value = conversation
  detailLoading.value = true
  try {
    selected.value = await getAuditedConversation(conversation.id)
  } catch (error) {
    selected.value = null
    message.error(errorDetail(error))
  } finally {
    detailLoading.value = false
  }
}

function handleSearch() {
  page.value = 1
  load()
}

function handlePageChange(value) {
  page.value = value
  load()
}

function reset() {
  selected.value = null
  search.value = ''
  page.value = 1
}

function userDisplay(user) {
  if (!user) return '—'
  if (user.name && user.username) return `${user.name} (${user.username})`
  return user.name || user.username || '—'
}

function userInitial(user) {
  const value = user?.name || user?.username || '?'
  return String(value).trim().charAt(0).toUpperCase() || '?'
}

function questionCount(conversation) {
  if (conversation?.question_count == null) return '—'
  const value = Number(conversation.question_count)
  return Number.isFinite(value) ? value : '—'
}

function assistantLabel(value) {
  const labels = {
    general: t('ChatAIAssistantGeneral'),
    asset: t('ChatAIAssistantAsset'),
    session_audit: t('ChatAIAssistantAudit'),
    ops: t('ChatAIAssistantOps')
  }
  return labels[value] || value || '—'
}

function roleLabel(value) {
  return value === 'user' ? t('ChatAIAuditUserMessage') : t('ChatAIAuditAssistantMessage')
}

function formatDate(value) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  }).format(date)
}

function formatFileSize(size) {
  const value = Number(size || 0)
  if (value < 1024) return `${value} B`
  if (value < 1024 * 1024) return `${Math.ceil(value / 1024)} KiB`
  return `${(value / (1024 * 1024)).toFixed(1)} MiB`
}

function attachmentCount(item) {
  return (item.images?.length || 0) + (item.files?.length || 0)
}

watch(
  () => props.modelValue,
  (open) => {
    if (open) load()
  }
)
</script>

<style scoped lang="scss">
:global(.audit-dialog-shell.el-dialog) {
  --audit-primary: var(--el-color-primary, #1ab394);
  --audit-primary-dark: var(--el-color-primary-dark-2, #148f76);
  --audit-primary-light: var(--el-color-primary-light-9, #e8f7f3);
  --audit-border: var(--color-border, #e9ecef);
  --audit-text: var(--color-text-primary, #292827);
  --audit-text-secondary: var(--color-text-secondary, #7c7c7c);
  display: flex;
  max-height: calc(100dvh - 40px);
  flex-direction: column;
  padding: 0;
  overflow: hidden;
  border: 1px solid var(--audit-border);
  border-radius: 10px;
  box-shadow: 0 18px 48px rgb(23 43 38 / 20%);
}

:global(.audit-dialog-shell .el-dialog__header) {
  flex: 0 0 auto;
  margin: 0;
  padding: 17px 22px;
  border-bottom: 1px solid var(--audit-border);
  background: #fff;
}

:global(.audit-dialog-shell .el-dialog__headerbtn) {
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

:global(.audit-dialog-shell .el-dialog__headerbtn:hover) {
  background: var(--audit-primary-light);
}

:global(.audit-dialog-shell .el-dialog__headerbtn .el-dialog__close) {
  color: #758078;
  font-size: 16px;
}

:global(.audit-dialog-shell .el-dialog__headerbtn:hover .el-dialog__close) {
  color: var(--audit-primary-dark);
}

:global(.audit-dialog-shell .el-dialog__body) {
  min-height: 0;
  flex: 1 1 auto;
  padding: 0;
  overflow: hidden;
}

.audit-dialog__heading {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 12px;
  padding-right: 44px;

  h2 {
    margin: 0;
    color: var(--audit-text, #292827);
    font-size: 16px;
    font-weight: 600;
    line-height: 1.35;
  }

  p {
    margin: 3px 0 0;
    color: var(--audit-text-secondary, #7c7c7c);
    font-size: 11px;
    line-height: 1.45;
  }
}

.audit-dialog__heading-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 8px;
  color: var(--audit-primary-dark, #148f76);
  background: var(--audit-primary-light, #e8f7f3);
  font-size: 18px;
}

.audit-dialog {
  box-sizing: border-box;
  display: flex;
  height: min(600px, calc(100dvh - 112px));
  min-height: 0;
  flex-direction: column;
  gap: 14px;
  padding: 18px 20px 20px;
  overflow: hidden;
}

.audit-security-notice {
  display: flex;
  min-height: 56px;
  flex: 0 0 auto;
  align-items: center;
  gap: 12px;
  padding: 10px 13px;
  border: 1px solid #f2dfc5;
  border-radius: 8px;
  background: #fffaf3;
}

.audit-security-notice__icon {
  display: grid;
  width: 30px;
  height: 30px;
  flex: 0 0 30px;
  place-items: center;
  border-radius: 7px;
  color: #c77824;
  background: #ffefd9;
  font-size: 15px;
}

.audit-security-notice__content {
  min-width: 0;
  flex: 1;

  strong {
    display: block;
    margin-bottom: 2px;
    color: #8b561e;
    font-size: 12px;
    font-weight: 600;
  }

  p {
    margin: 0;
    color: #9a6a39;
    font-size: 11px;
    line-height: 1.45;
  }
}

.audit-security-notice__badge {
  flex: 0 0 auto;
  padding: 4px 9px;
  border: 1px solid #efd4af;
  border-radius: 999px;
  color: #a96825;
  background: rgb(255 255 255 / 68%);
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
}

.audit-list__toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-top: 2px;
}

.audit-list__heading {
  display: grid;
  gap: 3px;

  strong {
    color: var(--audit-text, #292827);
    font-size: 14px;
    font-weight: 600;
  }

  span {
    color: var(--audit-text-secondary, #7c7c7c);
    font-size: 11px;
  }
}

.audit-list__search {
  display: flex;
  align-items: center;
  gap: 8px;

  :deep(.el-input) {
    width: min(330px, 42vw);
  }

  :deep(.el-input__wrapper) {
    border-radius: 6px;
    box-shadow: 0 0 0 1px var(--color-input-border, #bbbfc4) inset;
  }

  :deep(.el-input__wrapper.is-focus) {
    box-shadow: 0 0 0 1px var(--audit-primary, #1ab394) inset;
  }

  :deep(.el-button) {
    min-width: 74px;
    border-radius: 6px;
  }
}

.audit-load-error {
  display: flex;
  min-height: 240px;
  flex: 1;
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

.audit-table-card {
  min-height: 0;
  flex: 1 1 auto;
  overflow: hidden;
  border: 1px solid var(--audit-border, #e9ecef);
  border-radius: 8px;
  background: #fff;

  :deep(.el-table) {
    --el-table-border-color: var(--audit-border, #e9ecef);
    --el-table-header-bg-color: #f7f9f8;
    --el-table-row-hover-bg-color: #f1faf7;
    color: var(--audit-text, #292827);
  }

  :deep(.el-table::before) {
    display: none;
  }

  :deep(.el-table__header th.el-table__cell) {
    height: 42px;
    padding: 0;
    color: #69736d;
    background: #f7f9f8;
    font-size: 11px;
    font-weight: 600;
  }

  :deep(.el-table__body td.el-table__cell) {
    height: 64px;
    padding: 0;
  }

  :deep(.el-table__cell .cell) {
    padding-right: 12px;
    padding-left: 12px;
  }

  :deep(.audit-table-row) {
    cursor: pointer;
    transition: background 0.16s ease;
  }

  :deep(.audit-table-row:hover > td.el-table__cell) {
    background: #f1faf7 !important;
  }
}

.audit-owner {
  display: flex;
  min-width: 0;
  align-items: center;
  gap: 10px;
}

.audit-owner__avatar {
  display: grid;
  width: 32px;
  height: 32px;
  flex: 0 0 32px;
  place-items: center;
  border: 1px solid #cceae2;
  border-radius: 8px;
  color: var(--audit-primary-dark, #148f76);
  background: var(--audit-primary-light, #e8f7f3);
  font-size: 12px;
  font-weight: 700;

  &.is-large {
    width: 40px;
    height: 40px;
    flex-basis: 40px;
    border-radius: 10px;
    font-size: 14px;
  }
}

.audit-owner__identity {
  display: grid;
  min-width: 0;
  gap: 2px;

  strong {
    overflow: hidden;
    color: var(--audit-text, #292827);
    font-size: 13px;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  small {
    overflow: hidden;
    color: var(--audit-text-secondary, #7c7c7c);
    font-size: 11px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.audit-conversation-title {
  display: block;
  overflow: hidden;
  color: #343b37;
  font-size: 12px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audit-assistant-badge {
  display: inline-flex;
  max-width: 100%;
  align-items: center;
  padding: 4px 8px;
  overflow: hidden;
  border: 1px solid #d8ebe6;
  border-radius: 999px;
  color: #367064;
  background: #f3faf8;
  font-size: 10px;
  font-weight: 500;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.audit-question-count {
  display: inline-grid;
  min-width: 28px;
  height: 24px;
  place-items: center;
  padding: 0 7px;
  border-radius: 999px;
  color: #4e5a54;
  background: #f0f2f1;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
}

.audit-date {
  color: #69736d;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}

:deep(.audit-open-button.el-button.is-link) {
  gap: 2px;
  padding: 5px 6px;
  border-radius: 5px;
  color: var(--audit-primary-dark, #148f76) !important;
  font-size: 11px;
  font-weight: 600;

  &:hover,
  &:focus {
    color: var(--audit-primary-dark, #148f76) !important;
    background: #dff4ee;
  }
}

:deep(.audit-open-button.el-button.is-link > span),
:deep(.audit-open-button.el-button.is-link .el-icon) {
  color: var(--audit-primary-dark, #148f76) !important;
}

.audit-list__footer {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  color: var(--audit-text-secondary, #7c7c7c);
  font-size: 11px;

  :deep(.el-pagination) {
    justify-content: flex-end;
  }
}

.audit-detail__toolbar {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

:deep(.audit-back-button.el-button) {
  height: 32px;
  margin: 0;
  border-color: var(--audit-border, #e9ecef);
  border-radius: 6px;
  color: #55615b;

  &:hover,
  &:focus {
    border-color: #b9ddd3;
    color: var(--audit-primary-dark, #148f76);
    background: #f3faf8;
  }
}

.audit-access-logged {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #78827d;
  font-size: 11px;

  .el-icon {
    display: grid;
    width: 18px;
    height: 18px;
    place-items: center;
    border-radius: 50%;
    color: var(--audit-primary-dark, #148f76);
    background: var(--audit-primary-light, #e8f7f3);
    font-size: 10px;
  }
}

.audit-detail {
  display: flex;
  min-height: 0;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 14px;
  overflow: hidden;

  > header {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 12px;
    padding: 13px 14px;
    border: 1px solid var(--audit-border, #e9ecef);
    border-radius: 8px;
    background: #fafbfb;

    h3 {
      margin: 0;
      overflow: hidden;
      color: var(--audit-text, #292827);
      font-size: 15px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin: 3px 0 0;
      color: var(--audit-text-secondary, #7c7c7c);
      font-size: 11px;
    }
  }
}

.audit-detail__identity {
  min-width: 0;
  flex: 1;
}

.audit-detail__metadata {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 7px;
  color: #78827d;
  font-size: 10px;
}

:deep(.audit-readonly-tag) {
  flex: 0 0 auto;
  border-radius: 999px;
}

.audit-message-list {
  display: grid;
  min-height: 0;
  flex: 1 1 auto;
  align-content: start;
  gap: 12px;
  padding: 3px 6px 3px 2px;
  overflow: auto;
  scrollbar-color: #cbd4cf transparent;
  scrollbar-width: thin;
}

.audit-message {
  box-sizing: border-box;
  max-width: min(86%, 720px);
  padding: 13px 15px;
  border: 1px solid var(--audit-border, #e9ecef);
  border-radius: 10px 10px 10px 3px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(38 53 48 / 5%);

  &.is-user {
    margin-left: auto;
    border-color: #cceae2;
    border-radius: 10px 10px 3px;
    background: #f0faf7;
  }
}

.audit-message__meta {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 8px;
  color: #8a938e;
  font-size: 11px;

  strong {
    color: #4e5a54;
    font-size: 12px;
    font-weight: 600;
  }
}

.audit-message__content {
  color: #303733;
  font-size: 13px;
  line-height: 1.65;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}

.audit-message__attachments {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin-top: 10px;

  > span {
    color: #7f8983;
    font-size: 11px;
  }

  :deep(.el-tag) {
    border-radius: 5px;
  }
}

@media (max-width: 720px) {
  :global(.audit-dialog-shell.el-dialog) {
    max-height: calc(100dvh - 20px);
    border-radius: 8px;
  }

  :global(.audit-dialog-shell .el-dialog__header) {
    padding: 14px 16px;
  }

  :global(.audit-dialog-shell .el-dialog__headerbtn) {
    top: 14px;
    right: 12px;
  }

  .audit-dialog__heading p,
  .audit-security-notice__badge {
    display: none;
  }

  .audit-dialog {
    min-height: 0;
    max-height: calc(100dvh - 84px);
    padding: 14px;
  }

  .audit-security-notice {
    align-items: flex-start;
  }

  .audit-list__toolbar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .audit-list__search {
    width: 100%;

    :deep(.el-input) {
      width: 100%;
    }
  }

  .audit-table-card {
    overflow-x: auto;

    :deep(.el-table) {
      min-width: 820px;
    }
  }

  .audit-detail > header {
    align-items: flex-start;
  }

  .audit-readonly-tag {
    display: none;
  }

  .audit-message {
    max-width: 100%;
  }
}
</style>
