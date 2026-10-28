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
import { markRaw } from 'vue'
import ApplicationEventRecipients from './ApplicationEventRecipients.vue'
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
          prop: 'recipients',
          type: 'expand',
          width: 48,
          formatter: markRaw(ApplicationEventRecipients)
        },
        {
          prop: 'published_at',
          label: this.$t('RotationEventPublishedAt'),
          minWidth: 150,
          formatter: (row) => this.formatDate(row.published_at)
        },
        {
          prop: 'source',
          label: this.$t('Source'),
          minWidth: 100,
          formatter: (row) =>
            this.$t(
              row.source === 'manual' ? 'ApplicationManualEvents' : 'ApplicationAutomaticEvents'
            )
        },
        {
          prop: 'event',
          label: this.$t('AppAuditEvent'),
          minWidth: 200,
          formatter: (row) => (
            <div>
              <div>{this.$t(this.eventLabels[row.event] || 'AppAuditEvent')}</div>
              <div class="secondary-text">
                {[row.account, row.credential].filter(Boolean).join(' · ')}
              </div>
            </div>
          )
        },
        { prop: 'revision', label: this.$t('Revision'), minWidth: 70 },
        {
          prop: 'status',
          label: this.$t('Status'),
          minWidth: 170,
          formatter: (row) => (
            <div>
              <ElTag type={row.statusType}>{this.$t(row.statusLabel)}</ElTag>
              {!!row.recipientRows.length && (
                <div class="secondary-text">
                  {this.$t('ApplicationEventProgress', {
                    total: row.recipientRows.length,
                    received: row.receivedCount,
                    success: row.successCount
                  })}
                </div>
              )}
            </div>
          )
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
        // Merge both event streams before deciding whether another page exists.
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
        this.history = createApplicationEventHistory(
          (source, query, options) => {
            const endpoint = source === 'manual' ? 'manual-events' : 'credential-events'
            return this.$axios.get(`/api/v1/accounts/integration-applications/${id}/${endpoint}/`, {
              ...options,
              params: query
            })
          },
          30,
          true
        )
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
