<template>
  <div class="application-events">
    <div class="context-help">
      <el-alert
        :title="$t('ApplicationEventProcessingHelp')"
        type="info"
        :closable="false"
        show-icon
      />
    </div>
    <div class="event-toolbar">
      <DataActions
        v-if="$hasPerm('accounts.change_integrationapplication')"
        :actions="sendActions"
        size="small"
        class="header-action"
      />
      <el-button :loading="loading" @click="load">{{ $t('Refresh') }}</el-button>
    </div>
    <ApplicationEventSendDialog v-model:visible="sendVisible" :application="object" @sent="load" />
    <el-alert
      v-if="loadFailed"
      :title="$t('EventHistoryLoadFailed')"
      type="error"
      :closable="false"
      class="load-error"
    />
    <IBox class="event-table">
      <el-table v-loading="loading" :data="rows" row-key="key">
        <el-table-column :label="$t('RotationEventPublishedAt')" min-width="135">
          <template #default="{ row }">
            <div>{{ formatDate(row.published_at) }}</div>
            <div v-if="row.operator" class="secondary-text">{{ row.operator }}</div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('Source')" min-width="80">
          <template #default="{ row }">
            {{
              $t(row.source === 'manual' ? 'ApplicationManualEvents' : 'ApplicationPolicyEvents')
            }}
          </template>
        </el-table-column>
        <el-table-column :label="$t('AppAuditEvent')" min-width="155">
          <template #default="{ row }">
            <div>{{ $t(eventLabels[row.event] || 'AppAuditEvent') }}</div>
            <div v-if="row.credential || row.account || row.rotation_id" class="secondary-text">
              {{
                [row.credential, row.account, row.rotation_id?.slice(-8)]
                  .filter(Boolean)
                  .join(' · ')
              }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('InstanceID')" min-width="110" show-overflow-tooltip>
          <template #default="{ row }">{{ row.instance_id || '-' }}</template>
        </el-table-column>
        <el-table-column :label="$t('Status')" min-width="90">
          <template #default="{ row }">
            <el-tag :type="row.statusType">{{ $t(row.statusLabel || 'Unknown') }}</el-tag>
            <div v-if="row.error_code" class="secondary-text">
              {{ $t(errorLabels[row.error_code] || 'ApplicationCommandExecutionFailed') }}
            </div>
          </template>
        </el-table-column>
        <el-table-column :label="$t('RotationEventReceivedAt')" min-width="135">
          <template #default="{ row }">{{ formatDate(row.received_at) }}</template>
        </el-table-column>
        <el-table-column :label="$t('ApplicationCommandFinishedAt')" min-width="135">
          <template #default="{ row }">{{ formatDate(row.finished_at) }}</template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-if="page > 1 || hasNext"
        :current-page="page"
        :page-size="30"
        :total="page * 30 + (hasNext ? 1 : 0)"
        :disabled="loading"
        layout="prev, next"
        @current-change="loadPage"
      />
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox'
import DataActions from '@/components/Common/DataActions'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { eventLabels } from '../AccountRotationDetail/rotationEventTimeline'
import ApplicationEventSendDialog from '../components/ApplicationEventSendDialog.vue'
import { createApplicationEventHistory } from './applicationEventHistory'

export default {
  name: 'ApplicationEventProcessing',
  components: { IBox, DataActions, ApplicationEventSendDialog },
  props: {
    object: { type: Object, required: true }
  },
  data() {
    return {
      sendVisible: false,
      rows: [],
      loading: false,
      loadFailed: false,
      page: 1,
      hasNext: false,
      history: null,
      requestId: 0,
      eventLabels: {
        ...eventLabels,
        'credential.switch.requested': 'ApplicationAccountSwitchRequest',
        'application.restart.requested': 'ApplicationRestartRequest'
      },
      errorLabels: {
        superseded: 'ApplicationCommandSuperseded',
        execution_failed: 'ApplicationCommandExecutionFailed'
      }
    }
  },
  computed: {
    sendActions() {
      return [
        {
          name: 'sendApplicationEvent',
          title: this.$t('SendApplicationEvent'),
          type: 'primary',
          can: !!this.object.is_active,
          callback: () => (this.sendVisible = true)
        }
      ]
    }
  },
  watch: {
    'object.id': { immediate: true, handler: 'load' }
  },
  beforeUnmount() {
    this.requestId++
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    load() {
      const id = this.object.id
      this.requestId++
      this.rows = []
      this.page = 1
      this.hasNext = false
      this.loadFailed = false
      this.loading = false
      if (!id) return
      this.history = createApplicationEventHistory((source, params) => {
        const endpoint = source === 'manual' ? 'manual-events' : 'credential-events'
        return this.$axios.get(`/api/v1/accounts/integration-applications/${id}/${endpoint}/`, {
          params
        })
      })
      return this.loadPage(1)
    },
    async loadPage(page) {
      const requestId = ++this.requestId
      this.loading = true
      this.loadFailed = false
      try {
        const data = await this.history.getPage(page)
        if (requestId !== this.requestId) return
        this.rows = data.rows
        this.hasNext = data.hasNext
        this.page = page
      } catch (_error) {
        if (requestId === this.requestId) this.loadFailed = true
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application-events {
  min-width: 0;
}

.event-toolbar {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  flex-wrap: wrap;
  gap: 10px 4px;
  margin-bottom: 8px;
}

.event-toolbar > .el-button {
  margin-left: auto;
  min-height: 30px;
}

.event-toolbar :deep(.el-button:not(.is-circle)) {
  border-radius: var(--list-corner-radius, 4px);
}

.event-table {
  overflow: hidden;
}

.event-table :deep(.el-card__body) {
  padding: 0;
}

.context-help {
  margin: 0 0 12px;
}

.secondary-text {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.application-events :deep(.el-pagination) {
  padding: 12px;
  justify-content: flex-end;
}

.load-error {
  margin-bottom: 12px;
}
</style>
