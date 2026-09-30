<template>
  <el-table :data="rows">
    <el-table-column :label="$t('RotationEventPublishedAt')" min-width="155">
      <template #default="{ row }">
        <div>{{ formatDate(row.occurred_at) }}</div>
        <div class="command-secondary">{{ row.operator }}</div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('AppAuditEvent')" min-width="170">
      <template #default="{ row }">
        <div>{{ $t(eventLabels[row.event]) }}</div>
        <div v-if="row.credential || row.account" class="command-secondary">
          {{ [row.credential, row.account].filter(Boolean).join(' · ') }}
        </div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('InstanceID')" prop="instance_id" min-width="140" />
    <el-table-column :label="$t('Status')" min-width="100">
      <template #default="{ row }">
        <el-tag :type="tagTypes[row.status]">{{ $t(statusLabels[row.status]) }}</el-tag>
        <div v-if="row.error_code" class="command-secondary">
          {{ $t(errorLabels[row.error_code] || 'ApplicationCommandExecutionFailed') }}
        </div>
      </template>
    </el-table-column>
    <el-table-column :label="$t('RotationEventReceivedAt')" min-width="155">
      <template #default="{ row }">{{ formatDate(row.received_at) }}</template>
    </el-table-column>
    <el-table-column :label="$t('ApplicationCommandFinishedAt')" min-width="155">
      <template #default="{ row }">{{ formatDate(row.finished_at) }}</template>
    </el-table-column>
  </el-table>
</template>

<script>
import { toSafeLocalDateStr } from '@/composables/useDateTime'

export default {
  props: { commands: { type: Array, default: () => [] } },
  data() {
    return {
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
        received: 'info',
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
.command-secondary {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}
</style>
