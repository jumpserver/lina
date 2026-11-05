<template>
  <div class="event-recipients">
    <div v-if="row.recipientRows.length || row.webhooks?.length" class="event-summary">
      <span v-if="row.recipientRows.length">
        {{
          $t(row.requires_confirmation ? 'ApplicationEventProgress' : 'RotationEventReceiptCount', {
            total: row.recipientRows.length,
            received: row.receivedCount,
            success: row.successCount
          })
        }}
      </span>
      <span v-if="row.skippedCount">
        {{
          $t('PolicyEventSkipCount', { skipped: row.skippedCount, total: row.recipientRows.length })
        }}
      </span>
      <span v-if="row.webhooks?.length">
        {{
          $t('ApplicationWebhookDeliveryCount', {
            delivered: row.webhooks.filter((delivery) => delivery.status === 'success').length,
            total: row.webhooks.length
          })
        }}
      </span>
    </div>
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
          <div v-if="recipient.error_code" class="error-code">
            {{ $t(applicationFailureLabel(recipient.error_code)) }}
            <code>{{ recipient.error_code }}</code>
          </div>
          <div v-if="recipient.failure_review?.id" class="failure-review">
            <el-tag :type="recipient.failure_review.review_required ? 'danger' : 'info'">
              {{
                $t(
                  recipient.failure_review.review_required
                    ? 'ApplicationFailureReviewRequired'
                    : 'ApplicationFailureApproved'
                )
              }}
            </el-tag>
            <small
              >{{ date(recipient.failure_review.failed_at) }} ·
              {{ $t(applicationFailureLabel(recipient.failure_review.error_code)) }}</small
            >
            <code v-if="recipient.failure_review.error_code">{{
              recipient.failure_review.error_code
            }}</code>
            <small v-if="recipient.failure_review.reviewed_at"
              >{{ recipient.failure_review.reviewed_by }} ·
              {{ date(recipient.failure_review.reviewed_at) }}</small
            >
            <small v-if="recipient.failure_review.reason">{{
              recipient.failure_review.reason
            }}</small>
          </div>
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
    <template v-if="row.webhooks?.length">
      <h5>{{ $t('ApplicationWebhookDeliveries') }}</h5>
      <el-table :data="row.webhooks" size="small">
        <el-table-column :label="$t('RelevantApp')" prop="application.name" min-width="140" />
        <el-table-column :label="$t('Status')" min-width="110">
          <template #default="{ row: delivery }">
            <el-tag
              :type="
                delivery.status === 'success'
                  ? 'success'
                  : delivery.status === 'failed'
                    ? 'danger'
                    : 'info'
              "
            >
              {{
                $t(
                  delivery.status === 'success'
                    ? 'ApplicationWebhookDelivered'
                    : delivery.status === 'failed'
                      ? 'Failed'
                      : 'Pending'
                )
              }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column :label="$t('AppAuditAttempt')" min-width="90">
          <template #default="{ row: delivery }">{{ delivery.attempts.length }}</template>
        </el-table-column>
        <el-table-column :label="$t('AppAuditHTTPStatus')" min-width="100">
          <template #default="{ row: delivery }">{{
            delivery.attempts.at(-1)?.status_code ?? '-'
          }}</template>
        </el-table-column>
      </el-table>
    </template>
  </div>
</template>

<script setup>
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { applicationFailureLabel } from '../components/applicationFailure'
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
.event-summary {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin-bottom: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.failure-review {
  display: grid;
  justify-items: start;
  gap: 6px;
  margin-top: 8px;
}
.error-code {
  color: var(--el-color-danger);
  margin-top: 4px;
}
.error-code code {
  display: block;
}
</style>
