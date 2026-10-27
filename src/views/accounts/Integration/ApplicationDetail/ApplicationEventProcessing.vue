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
    <ApplicationEventSendDialog v-model:visible="sendVisible" :application="object" @sent="load" />
    <el-alert
      v-if="loadFailed"
      :title="$t('EventHistoryLoadFailed')"
      type="error"
      :closable="false"
      class="load-error"
    />
    <ListTable
      v-if="object.id"
      ref="eventTable"
      :key="object.id"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :table-metadata-provider="getEventMetadata"
      activation-refresh="never"
    />
  </div>
</template>

<script lang="jsx">
import { ElTag } from 'element-plus'
import ListTable from '@/components/Table/ListTable'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { eventLabels } from '../AccountRotationDetail/rotationEventTimeline'
import ApplicationEventSendDialog from '../components/ApplicationEventSendDialog.vue'
import { createApplicationEventHistory } from './applicationEventHistory'

export default {
  name: 'ApplicationEventProcessing',
  components: { ListTable, ApplicationEventSendDialog },
  props: {
    object: { type: Object, required: true }
  },
  data() {
    return {
      sendVisible: false,
      loadFailed: false,
      history: null,
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
        name: 'ApplicationEventProcessing',
        url: `/api/v1/accounts/integration-applications/${this.object.id}/manual-events/`,
        request: this.requestEvents,
        permissions: { view: 'accounts.view_integrationapplication' },
        columns: this.columns,
        columnsMeta: { actions: { has: false } },
        hasSelection: false,
        hasPagination: true,
        // The APIs count events, while the table shows one row per recipient.
        // Only the next page is known until both event streams are exhausted.
        paginationLayout: 'sizes, prev, next',
        hasOperation: false,
        hasEdit: false,
        hasDelete: false,
        tableAttrs: { rowKey: 'key' }
      }
    },
    headerActions() {
      return {
        hasCreate: false,
        hasBulkDelete: false,
        hasMoreActions: false,
        hasImport: false,
        hasExport: false,
        hasSearch: false,
        handleRefreshClick: () => this.load(),
        extraActions: [
          {
            name: 'sendApplicationEvent',
            title: this.$t('SendApplicationEvent'),
            type: 'primary',
            has: this.$hasPerm('accounts.change_integrationapplication'),
            can: !!this.object.is_active,
            callback: () => (this.sendVisible = true)
          }
        ]
      }
    }
  },
  watch: {
    'object.id'() {
      this.history = null
      this.loadFailed = false
    }
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    },
    getEventMetadata() {
      return Promise.resolve({ actions: { GET: {} }, filters: {}, ordering: { fields: [] } })
    },
    load() {
      this.history = null
      this.loadFailed = false
      return this.$refs.eventTable?.dataTable?.search({}, true)
    },
    async requestEvents(url, config) {
      const params = new URL(url, window.location.origin).searchParams
      const size = Number(params.get('limit')) || 15
      const offset = Number(params.get('offset')) || 0
      const id = this.object.id
      const { signal } = config
      this.loadFailed = false
      if (!this.history) {
        this.history = createApplicationEventHistory((source, query, options) => {
          const endpoint = source === 'manual' ? 'manual-events' : 'credential-events'
          return this.$axios.get(`/api/v1/accounts/integration-applications/${id}/${endpoint}/`, {
            ...options,
            params: query
          })
        })
      }
      try {
        const data = await this.history.getPage(offset / size + 1, size, { signal })
        return {
          data: {
            results: data.rows,
            count: offset + data.rows.length + (data.hasNext ? 1 : 0)
          }
        }
      } catch (error) {
        if (!signal?.aborted && id === this.object.id) this.loadFailed = true
        throw error
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.application-events {
  min-width: 0;
}

.context-help {
  margin: 0 0 12px;
}

.application-events :deep(.secondary-text) {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  margin-top: 2px;
  overflow-wrap: anywhere;
}

.application-events :deep(.event-text) {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.load-error {
  margin-bottom: 12px;
}
</style>
