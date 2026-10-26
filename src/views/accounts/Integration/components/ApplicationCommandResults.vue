<template>
  <DataTable class="command-results" :config="tableConfig" />
</template>

<script lang="jsx">
import { ElTag } from 'element-plus'
import DataTable from '@/components/Table/DataTable'
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  components: { DataTable },
  props: { commands: { type: Array, default: () => [] } },
  data() {
    return {
      columns: [
        {
          prop: 'occurred_at',
          label: this.$t('RotationEventPublishedAt'),
          minWidth: 155,
          formatter: (row) => (
            <div>
              <div>{this.formatDate(row.occurred_at)}</div>
              {row.operator && <div class="command-secondary">{row.operator}</div>}
            </div>
          )
        },
        {
          prop: 'event',
          label: this.$t('AppAuditEvent'),
          minWidth: 170,
          formatter: (row) => {
            const context = [row.credential, row.account].filter(Boolean).join(' · ')
            return (
              <div>
                <div>{this.$t(this.eventLabels[row.event])}</div>
                {context && (
                  <div class="command-secondary" title={context}>
                    {context}
                  </div>
                )}
              </div>
            )
          }
        },
        { prop: 'instance_id', label: this.$t('InstanceID'), minWidth: 140 },
        {
          prop: 'status',
          label: this.$t('Status'),
          minWidth: 100,
          formatter: (row) => (
            <div>
              <ElTag type={this.tagTypes[row.status]}>
                {this.$t(this.statusLabels[row.status])}
              </ElTag>
              {row.error_code && (
                <div class="command-secondary">
                  {this.$t(this.errorLabels[row.error_code] || 'ApplicationCommandExecutionFailed')}
                </div>
              )}
            </div>
          )
        },
        {
          prop: 'received_at',
          label: this.$t('RotationEventReceivedAt'),
          minWidth: 155,
          formatter: (row) => this.formatDate(row.received_at)
        },
        {
          prop: 'finished_at',
          label: this.$t('ApplicationCommandFinishedAt'),
          minWidth: 155,
          formatter: (row) => this.formatDate(row.finished_at)
        }
      ],
      eventLabels: {
        'credential.switch.requested': 'ApplicationAccountSwitchRequest',
        'application.restart.requested': 'ApplicationRestartRequest'
      },
      statusLabels: {
        pending: 'ApplicationCommandPending',
        received: 'RotationEventReceived',
        running: 'Running',
        success: 'Success',
        failed: 'Failed',
        timeout: 'Timeout'
      },
      tagTypes: {
        pending: 'info',
        received: 'success',
        running: 'warning',
        success: 'success',
        failed: 'danger',
        timeout: 'danger'
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
        tableAttrs: { border: true }
      }
    },
    rows() {
      return this.commands.flatMap((command) =>
        command.recipients.map((recipient) => ({ ...command, ...recipient }))
      )
    }
  },
  methods: {
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '-'
    }
  }
}
</script>

<style scoped>
.command-results :deep(.command-secondary) {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
