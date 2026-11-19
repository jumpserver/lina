<template>
  <div>
    <el-alert
      v-if="loadFailed"
      :title="$t('EventHistoryLoadFailed')"
      type="error"
      :closable="false"
    />
    <ListTable
      :key="object.id || 'all'"
      :table-config="tableConfig"
      :header-actions="headerActions"
      :table-metadata-provider="getMetadata"
    />
  </div>
</template>

<script lang="jsx">
import { ElTag } from 'element-plus'
import { markRaw } from 'vue'
import { ListTable } from '@/components'
import request from '@/utils/request'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import ApplicationEventRecipients from '../ApplicationDetail/ApplicationEventRecipients.vue'
import { applicationEventGroups } from '../ApplicationDetail/applicationEventHistory'
import { eventLabels } from '../AccountRotationDetail/rotationEventTimeline'

export default {
  name: 'ApplicationEventLog',
  components: { ListTable },
  props: { object: { type: Object, default: () => ({}) } },
  data() {
    return {
      loadFailed: false,
      eventLabels: {
        ...eventLabels,
        'credential.switch.requested': 'ApplicationAccountSwitchRequest',
        'app.restart.requested': 'ApplicationRestartRequest'
      },
      headerActions: {
        hasLeftActions: false,
        hasImport: false,
        hasExport: false,
        hasDatePicker: true,
        searchConfig: { getUrlQuery: false }
      }
    }
  },
  computed: {
    tableConfig() {
      return {
        name: 'ApplicationEventLog',
        url: '/api/v1/accounts/application-event-logs/',
        extraQuery: this.object.id ? { application: this.object.id } : {},
        permissions: { view: 'audits.view_integrationapplicationlog' },
        hasSelection: false,
        columnsMeta: { actions: { has: false } },
        request: async (url, config) => {
          this.loadFailed = false
          try {
            const response = await request.get(url, config)
            response.data.results = response.data.results.map(
              (event) =>
                applicationEventGroups(
                  [{ ...event, occurred_at: event.published_at }],
                  event.event_source === 'manual' ? 'manual' : 'policy'
                )[0]
            )
            return response
          } catch (error) {
            if (!config.signal?.aborted) this.loadFailed = true
            throw error
          }
        },
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
            width: 170,
            formatter: (row) => toSafeLocalDateStr(row.published_at)
          },
          {
            prop: 'event',
            label: this.$t('ApplicationEventType'),
            minWidth: 170,
            formatter: (row) => (
              <span class="event-type" title={this.$t(this.eventLabels[row.event] || row.event)}>
                {this.$t(this.eventLabels[row.event] || row.event)}
              </span>
            )
          },
          {
            prop: 'event_code',
            label: this.$t('AppNotificationEventCode'),
            minWidth: 260,
            formatter: (row) => <code class="event-code">{row.event}</code>
          },
          {
            prop: 'service',
            label: this.$t('RelevantApp'),
            minWidth: 150,
            formatter: (row) =>
              row.service ||
              [
                ...new Set(
                  [
                    ...row.recipients.map((recipient) => recipient.application?.name),
                    ...row.webhooks.map((delivery) => delivery.application.name)
                  ].filter(Boolean)
                )
              ].join(' · ') ||
              '-'
          },
          { prop: 'credential', label: this.$t('ApplicationCredential'), minWidth: 150 },
          { prop: 'account', label: this.$t('Account'), minWidth: 130 },
          {
            prop: 'event_source',
            label: this.$t('Source'),
            minWidth: 110,
            formatter: (row) =>
              this.$t(
                row.event_source === 'manual'
                  ? 'ApplicationManualEvents'
                  : 'ApplicationAutomaticEvents'
              )
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            minWidth: 190,
            formatter: (row) => <ElTag type={row.statusType}>{this.$t(row.statusLabel)}</ElTag>
          }
        ]
      }
    }
  },
  methods: {
    async getMetadata(url) {
      const metadata = await this.$store.dispatch('common/getUrlMeta', { url })
      const choice = (label, entries) => ({
        label: this.$t(label),
        type: 'choice',
        multiple: false,
        operators: ['exact', 'in'],
        choices: Object.entries(entries).map(([value, key]) => ({ value, label: this.$t(key) }))
      })
      return {
        ...metadata,
        filters: {
          ...metadata.filters,
          event: choice('ApplicationEventType', this.eventLabels),
          event_source: {
            ...choice('Source', {
              manual: 'ApplicationManualEvents',
              automatic: 'ApplicationAutomaticEvents'
            }),
            operators: ['exact']
          }
        }
      }
    }
  }
}
</script>

<style scoped>
:deep(.event-type),
:deep(.event-code) {
  white-space: nowrap;
}
</style>
