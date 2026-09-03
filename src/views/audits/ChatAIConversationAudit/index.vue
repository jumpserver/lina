<template>
  <Page
    :go-back="detailId ? goBack : undefined"
    :help-message="auditHelpMessage"
    help-alert-type="warning"
    :title="t('ChatAIConversationAudit')"
  >
    <div class="chat-ai-audit-page">
      <template v-if="detailId">
        <el-skeleton v-if="detailLoading" class="audit-skeleton-card" :rows="8" animated />
        <section v-else-if="detailError" class="audit-load-error" role="alert">
          <strong>{{ t('ChatAILoadFailedTitle') }}</strong>
          <p>{{ detailError }}</p>
          <el-button type="primary" @click="loadDetail">{{ t('ChatAIRetryLoad') }}</el-button>
        </section>
        <section v-else-if="selected" class="audit-detail">
          <header>
            <span class="audit-owner__avatar is-large">
              {{ userInitial(selected.user) }}
            </span>
            <div class="audit-detail__identity">
              <h3>{{ selected.title || t('ChatAIUntitledConversation') }}</h3>
              <p>{{ userDisplay(selected.user) }}</p>
              <div class="audit-detail__metadata">
                <span>{{ formatDate(selected.date_updated) }}</span>
              </div>
            </div>
            <el-tag class="audit-readonly-tag" effect="plain" size="small" type="info">
              {{ t('ChatAIAuditReadOnly') }}
            </el-tag>
            <span class="audit-access-logged">
              <el-icon><Check /></el-icon>
              {{ t('ChatAIAuditAccessLogged') }}
            </span>
          </header>

          <section class="audit-message-panel">
            <header class="audit-message-panel__header">
              <span class="audit-section-icon">
                <el-icon><ChatDotRound /></el-icon>
              </span>
              <div>
                <strong>{{ t('ChatAIAuditConversationList') }}</strong>
                <span>
                  {{ t('ChatAIAuditMessageCount', { count: selected.message_count || 0 }) }}
                </span>
              </div>
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
                  <MessageText v-if="item.content" :content="item.content" />
                  <span v-else>{{ item.error || '—' }}</span>
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
        </section>
      </template>

      <GenericListTable v-else :header-actions="headerActions" :table-config="tableConfig" />
    </div>
  </Page>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { ChatDotRound, Check } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

import { getAuditedConversation } from '@/api/chatAi'
import MessageText from '@/components/Apps/ChatAi/components/ChitChat/MessageText.vue'
import { ActionsFormatter, DateFormatter } from '@/components/Table/TableFormatters'
import GenericListTable from '@/layout/components/GenericListTable'
import Page from '@/layout/components/Page'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const selected = ref(null)
const detailLoading = ref(false)
const detailError = ref('')
const detailId = computed(() => String(route.params.id || ''))
const auditHelpMessage = computed(
  () => `${t('ChatAIAuditSecurityTitle')}: ${t('ChatAIConversationAuditNotice')}`
)
const headerActions = {
  hasLeftActions: false,
  hasImport: false,
  hasExport: false,
  hasDatePicker: false,
  searchConfig: {
    getUrlQuery: true,
    excludeFields: ['id'],
    fieldLabels: {
      title: t('ChatAIConversationTitle')
    }
  }
}
const tableConfig = computed(() => ({
  url: '/api/v1/chat-ai/audit/conversations/',
  permissions: {
    app: 'chat_ai',
    resource: 'conversation'
  },
  columnsShow: {
    min: ['user', 'title'],
    default: ['user', 'title', 'question_count', 'date_updated', 'actions']
  },
  columnsMeta: {
    user: {
      label: t('ChatAIAuditOwner'),
      minWidth: '180px',
      formatter: (row) => userDisplay(row.user)
    },
    title: {
      label: t('ChatAIConversationTitle'),
      minWidth: '260px',
      formatter: (row) => row.title || t('ChatAIUntitledConversation')
    },
    question_count: {
      label: t('ChatAIAuditQuestions'),
      width: '100px'
    },
    date_updated: {
      label: t('ChatAIAuditUpdated'),
      width: '180px',
      formatter: DateFormatter
    },
    actions: {
      width: '100px',
      formatter: ActionsFormatter,
      formatterArgs: {
        hasUpdate: false,
        hasDelete: false,
        hasClone: false,
        extraActions: [
          {
            name: 'view',
            title: t('View'),
            type: 'primary',
            can: true,
            callback: ({ row }) => openDetail(row)
          }
        ]
      }
    }
  }
}))

function errorDetail(error) {
  return error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
}

async function openDetail(conversation) {
  await router.push({
    name: 'ChatAIConversationAuditDetail',
    params: { id: conversation.id },
    query: { ...route.query }
  })
}

async function loadDetail() {
  if (!detailId.value) return
  selected.value = null
  detailError.value = ''
  detailLoading.value = true
  try {
    selected.value = await getAuditedConversation(detailId.value)
  } catch (error) {
    detailError.value = errorDetail(error)
  } finally {
    detailLoading.value = false
  }
}

function goBack() {
  router.push({
    name: 'ChatAIConversationAudit',
    query: { ...route.query }
  })
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
  detailId,
  () => {
    if (detailId.value) {
      loadDetail()
    } else {
      selected.value = null
    }
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.chat-ai-audit-page {
  --audit-primary: var(--el-color-primary, #1ab394);
  --audit-primary-dark: var(--el-color-primary-dark-2, #148f76);
  --audit-primary-light: var(--el-color-primary-light-9, #e8f7f3);
  --audit-border: var(--color-border, #e9ecef);
  --audit-text: var(--color-text-primary, #292827);
  --audit-text-secondary: var(--color-text-secondary, #7c7c7c);
  box-sizing: border-box;
}

.audit-message-panel,
.audit-skeleton-card {
  overflow: hidden;
  border: 1px solid var(--audit-border, #e9ecef);
  border-radius: 12px;
  background: #fff;
  box-shadow: 0 4px 18px rgb(28 50 43 / 5%);
}

.audit-skeleton-card {
  box-sizing: border-box;
  padding: 24px;
}

.audit-section-icon {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border-radius: 10px;
  color: #4f6961;
  background: #edf3f1;
  font-size: 16px;
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

.audit-owner__avatar {
  display: grid;
  width: 36px;
  height: 36px;
  flex: 0 0 36px;
  place-items: center;
  border: 1px solid #cceae2;
  border-radius: 8px;
  color: var(--audit-primary-dark, #148f76);
  background: var(--audit-primary-light, #e8f7f3);
  font-size: 12px;
  font-weight: 700;

  &.is-large {
    width: 46px;
    height: 46px;
    flex-basis: 46px;
    border-radius: 12px;
    font-size: 16px;
  }
}

.audit-access-logged {
  display: inline-flex;
  flex: 0 0 auto;
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
  display: grid;
  gap: 18px;

  > header {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: 14px;
    padding: 18px 20px;
    border: 1px solid var(--audit-border, #e9ecef);
    border-radius: 12px;
    background: linear-gradient(110deg, #f6fcfa 0%, #fff 66%);
    box-shadow: 0 4px 18px rgb(28 50 43 / 5%);

    h3 {
      margin: 0;
      overflow: hidden;
      color: var(--audit-text, #292827);
      font-size: 17px;
      font-weight: 600;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    p {
      margin: 4px 0 0;
      color: var(--audit-text-secondary, #7c7c7c);
      font-size: 12px;
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
  margin-top: 9px;
  color: #78827d;
  font-size: 10px;
}

:deep(.audit-readonly-tag) {
  flex: 0 0 auto;
  border-radius: 999px;
}

.audit-message-panel__header {
  display: flex;
  min-height: 68px;
  align-items: center;
  gap: 11px;
  padding: 0 20px;
  border-bottom: 1px solid var(--audit-border, #e9ecef);
  background: #fbfcfc;

  > div {
    display: grid;
    gap: 3px;
  }

  strong {
    color: var(--audit-text, #292827);
    font-size: 14px;
    font-weight: 600;
  }

  span:not(.audit-section-icon) {
    color: var(--audit-text-secondary, #7c7c7c);
    font-size: 11px;
  }
}

.audit-message-panel > :deep(.el-empty) {
  min-height: 360px;
}

.audit-message-list {
  display: grid;
  align-content: start;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(180deg, #fbfcfc 0%, #fff 130px);
}

.audit-message {
  box-sizing: border-box;
  max-width: min(92%, 1080px);
  padding: 15px 17px;
  border: 1px solid var(--audit-border, #e9ecef);
  border-radius: 12px 12px 12px 4px;
  background: #fff;
  box-shadow: 0 3px 12px rgb(38 53 48 / 5%);

  &.is-user {
    max-width: min(78%, 760px);
    margin-left: auto;
    border-color: #cceae2;
    border-radius: 12px 12px 4px;
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
  line-height: 1.7;
  overflow-wrap: anywhere;

  > span {
    font-size: 13px;
    line-height: 1.65;
    white-space: pre-wrap;
  }
}

.audit-message__content :deep(.markdown-body) {
  max-width: 100%;
}

.audit-message__content :deep(table) {
  display: block;
  max-width: 100%;
  overflow-x: auto;
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
  .audit-detail > header {
    flex-wrap: wrap;
    align-items: flex-start;
    padding: 16px;
  }

  :deep(.audit-readonly-tag) {
    display: none;
  }

  .audit-access-logged {
    width: 100%;
    padding-left: 60px;
  }

  .audit-message-panel__header {
    min-height: 64px;
    padding: 0 16px;
  }

  .audit-message-list {
    gap: 12px;
    padding: 12px;
  }

  .audit-message {
    max-width: 100%;
    padding: 13px 14px;

    &.is-user {
      max-width: 100%;
    }
  }
}
</style>
