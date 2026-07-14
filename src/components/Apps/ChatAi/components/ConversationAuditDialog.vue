<template>
  <el-dialog
    append-to-body
    destroy-on-close
    :model-value="modelValue"
    :title="t('ChatAIConversationAudit')"
    width="min(980px, calc(100vw - 24px))"
    @closed="reset"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <div class="audit-dialog">
      <el-alert
        :closable="false"
        :title="t('ChatAIConversationAuditNotice')"
        type="warning"
        show-icon
      />

      <template v-if="selected">
        <div class="audit-detail__toolbar">
          <el-button text @click="selected = null">
            <el-icon><ArrowLeft /></el-icon>
            {{ t('ChatAIAuditBackToList') }}
          </el-button>
          <span>{{ t('ChatAIAuditAccessLogged') }}</span>
        </div>

        <el-skeleton v-if="detailLoading" :rows="8" animated />
        <section v-else class="audit-detail">
          <header>
            <div>
              <h3>{{ selected.title || t('ChatAIUntitledConversation') }}</h3>
              <p>
                {{ userDisplay(selected.user) }} · {{ assistantLabel(selected.assistant) }} ·
                {{ formatDate(selected.date_updated) }}
              </p>
            </div>
            <el-tag size="small" type="info">
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
            {{ t('Search') }}
          </el-button>
        </div>

        <el-table
          v-loading="loading"
          :data="conversations"
          max-height="470"
          row-class-name="audit-table-row"
          @row-click="openDetail"
        >
          <el-table-column :label="t('ChatAIAuditOwner')" min-width="170">
            <template #default="{ row }">
              <div class="audit-owner">
                <strong>{{ row.user?.name || row.user?.username || '—' }}</strong>
                <small v-if="row.user?.name && row.user?.username">
                  {{ row.user.username }}
                </small>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            :label="t('ChatAIConversationTitle')"
            min-width="250"
            show-overflow-tooltip
          >
            <template #default="{ row }">
              {{ row.title || t('ChatAIUntitledConversation') }}
            </template>
          </el-table-column>
          <el-table-column :label="t('ChatAIAssistant')" min-width="130">
            <template #default="{ row }">
              {{ assistantLabel(row.assistant) }}
            </template>
          </el-table-column>
          <el-table-column
            align="right"
            prop="question_count"
            :label="t('ChatAIAuditQuestions')"
            width="100"
          />
          <el-table-column :label="t('ChatAIAuditUpdated')" min-width="170">
            <template #default="{ row }">
              {{ formatDate(row.date_updated) }}
            </template>
          </el-table-column>
          <el-table-column align="right" width="92">
            <template #default="{ row }">
              <el-button text type="primary" @click.stop="openDetail(row)">
                {{ t('View') }}
              </el-button>
            </template>
          </el-table-column>
          <template #empty>
            <el-empty :description="t('ChatAIAuditNoConversations')" :image-size="72" />
          </template>
        </el-table>

        <el-pagination
          v-if="total > pageSize"
          background
          layout="prev, pager, next"
          :current-page="page"
          :page-size="pageSize"
          :total="total"
          @current-change="handlePageChange"
        />
      </template>
    </div>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ArrowLeft, Search } from '@element-plus/icons-vue'
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
const detailLoading = ref(false)

function errorDetail(error) {
  return error?.detail || error?.response?.data?.detail || error?.message || t('ServerBusyRetry')
}

async function load() {
  loading.value = true
  try {
    const response = await listAuditedConversations({
      limit: pageSize,
      offset: (page.value - 1) * pageSize,
      search: search.value.trim() || undefined
    })
    conversations.value = Array.isArray(response) ? response : response?.results || []
    total.value = Array.isArray(response) ? response.length : Number(response?.count || 0)
  } catch (error) {
    message.error(errorDetail(error))
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
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString()
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
.audit-dialog {
  display: grid;
  gap: 16px;
  min-height: 360px;
}

.audit-list__toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 10px;

  :deep(.el-input) {
    width: min(360px, 100%);
  }
}

:deep(.audit-table-row) {
  cursor: pointer;
}

.audit-owner {
  display: grid;

  strong {
    color: #343946;
    font-size: 13px;
  }

  small {
    color: #8a909d;
    font-size: 11px;
  }
}

:deep(.el-pagination) {
  justify-content: flex-end;
}

.audit-detail__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #969ba7;
  font-size: 12px;
}

.audit-detail {
  display: grid;
  gap: 16px;

  > header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    padding-bottom: 14px;
    border-bottom: 1px solid #eceef2;

    h3 {
      margin: 0;
      color: #2f3441;
      font-size: 18px;
    }

    p {
      margin: 6px 0 0;
      color: #858b98;
      font-size: 12px;
    }
  }
}

.audit-message-list {
  display: grid;
  gap: 12px;
  max-height: 520px;
  overflow: auto;
}

.audit-message {
  max-width: 88%;
  padding: 13px 15px;
  border: 1px solid #e8eaef;
  border-radius: 10px;
  background: #fafbfc;

  &.is-user {
    margin-left: auto;
    border-color: #dce8fd;
    background: #f5f8ff;
  }
}

.audit-message__meta {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 8px;
  color: #8a909d;
  font-size: 11px;

  strong {
    color: #565c69;
    font-size: 12px;
  }
}

.audit-message__content {
  color: #343946;
  font-size: 13px;
  line-height: 1.7;
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
    color: #8a909d;
    font-size: 11px;
  }
}

@media (max-width: 720px) {
  .audit-list__toolbar {
    align-items: stretch;

    :deep(.el-input) {
      width: 100%;
    }
  }

  .audit-message {
    max-width: 100%;
  }
}
</style>
