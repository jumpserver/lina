<template>
  <div class="event-recipients">
    <el-empty
      v-if="!row.recipientRows.length"
      :description="$t(row.statusLabel)"
      :image-size="48"
    />
    <el-table v-else :data="row.recipientRows" size="small">
      <el-table-column prop="instance_id" :label="$t('InstanceID')" min-width="140" />
      <el-table-column prop="type" :label="$t('Type')" width="90" />
      <el-table-column :label="$t('Status')" min-width="130">
        <template #default="{ row: recipient }">
          <el-tag :type="recipient.statusType">{{ $t(recipient.statusLabel || 'Unknown') }}</el-tag>
          <div v-if="recipient.error_code" class="error-code">{{ recipient.error_code }}</div>
        </template>
      </el-table-column>
      <el-table-column
        v-for="column in timeColumns"
        :key="column.prop"
        :label="$t(column.label)"
        min-width="160"
      >
        <template #default="{ row: recipient }">{{ date(recipient[column.prop]) }}</template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { toSafeLocalDateStr } from '@/composables/useDateTime'
defineProps({ row: { type: Object, required: true }, col: { type: Object, required: true } })
const timeColumns = [
  { prop: 'received_at', label: 'RotationEventReceivedAt' },
  { prop: 'fetched_at', label: 'ApplicationCredentialFetchedAt' },
  { prop: 'delivered_at', label: 'ApplicationCredentialDeliveredAt' },
  { prop: 'finished_at', label: 'ApplicationCommandFinishedAt' }
]
const date = (value) => (value ? toSafeLocalDateStr(value) : '-')
</script>

<style scoped>
.event-recipients {
  padding: 12px 16px;
}
.error-code {
  color: var(--el-color-danger);
  margin-top: 4px;
}
</style>
