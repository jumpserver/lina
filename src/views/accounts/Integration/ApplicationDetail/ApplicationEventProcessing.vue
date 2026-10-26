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
      <DataTable v-loading="loading" :config="tableConfig" />
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

<script lang="jsx">
import { ElTag } from 'element-plus'
import IBox from '@/components/Common/IBox'
import DataActions from '@/components/Common/DataActions'
import DataTable from '@/components/Table/DataTable'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { eventLabels } from '../AccountRotationDetail/rotationEventTimeline'
import ApplicationEventSendDialog from '../components/ApplicationEventSendDialog.vue'
import { createApplicationEventHistory } from './applicationEventHistory'

export default {
  name: 'ApplicationEventProcessing',
  components: { IBox, DataActions, DataTable, ApplicationEventSendDialog },
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
      columns: [
        {
          prop: 'published_at',
          label: this.$t('RotationEventPublishedAt'),
          minWidth: 135,
          formatter: (row) => (
            <div>
              <div>{this.formatDate(row.published_at)}</div>
              {row.operator && <div class="secondary-text">{row.operator}</div>}
            </div>
          )
        },
        {
          prop: 'source',
          label: this.$t('Source'),
          minWidth: 80,
          formatter: (row) =>
            this.$t(row.source === 'manual' ? 'ApplicationManualEvents' : 'ApplicationPolicyEvents')
        },
        {
          prop: 'event',
          label: this.$t('AppAuditEvent'),
          minWidth: 155,
          formatter: (row) => {
            const label = this.$t(this.eventLabels[row.event] || 'AppAuditEvent')
            const context = [row.credential, row.account].filter(Boolean).join(' · ')
            return (
              <div>
                <div class="event-text" title={label}>
                  {label}
                </div>
                {context && (
                  <div class="secondary-text event-text" title={context}>
                    {context}
                  </div>
                )}
              </div>
            )
          }
        },
        {
          prop: 'instance_id',
          label: this.$t('InstanceID'),
          minWidth: 110,
          showOverflowTooltip: true,
          formatter: (row) => row.instance_id || '-'
        },
        {
          prop: 'status',
          label: this.$t('Status'),
          minWidth: 90,
          formatter: (row) => (
            <div>
              <ElTag type={row.statusType}>{this.$t(row.statusLabel || 'Unknown')}</ElTag>
              {row.error_code && (
                <div class="secondary-text">
                  {this.$t(this.errorLabels[row.error_code] || 'ApplicationCommandExecutionFailed')}
                </div>
              )}
            </div>
          )
        },
        {
          prop: 'received_at',
          label: this.$t('RotationEventReceivedAt'),
          minWidth: 135,
          formatter: (row) => this.formatDate(row.received_at)
        },
        {
          prop: 'finished_at',
          label: this.$t('ApplicationCommandFinishedAt'),
          minWidth: 135,
          formatter: (row) => this.formatDate(row.finished_at)
        }
      ],
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
    tableConfig() {
      return {
        totalData: this.rows,
        columns: this.columns,
        hasSelection: false,
        hasPagination: false,
        hasOperation: false,
        hasEdit: false,
        hasDelete: false,
        tableAttrs: { border: true, rowKey: 'key' }
      }
    },
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

.event-table :deep(.secondary-text) {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.event-table :deep(.event-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.application-events :deep(.el-pagination) {
  padding: 12px;
  justify-content: flex-end;
}

.load-error {
  margin-bottom: 12px;
}
</style>
