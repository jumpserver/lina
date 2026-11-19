<template>
  <TicketFileTransferAccess
    v-if="result.version !== 2"
    :object="object"
    :request-items="requestItems"
  />
  <Details v-else :detail-card-items="detailItems" :title="$t('ApplyInfo')">
    <div class="transfer-summary">
      <div role="status" aria-live="polite">
        <strong>{{ resultSummary }}</strong>
        <p v-if="resultHelp">{{ resultHelp }}</p>
        <p v-if="canExecute">{{ $t('TicketTransferExecutionHelp') }}</p>
        <p v-if="result.expires_at">
          {{ $t('DateExpired') }}: {{ toSafeLocalDateStr(result.expires_at)
          }}<span v-if="expired"> · {{ $t('TicketTransferState_expired') }}</span>
        </p>
      </div>
      <el-button v-if="canExecute" type="primary" :loading="submitting" @click="execute">
        {{
          $t(
            result.direction === 'upload'
              ? 'TicketTransferExecuteUpload'
              : 'TicketTransferFetchFiles'
          )
        }}
      </el-button>
    </div>
    <el-table :data="result.files || []" class="transfer-file-table">
      <el-table-column :label="$t('TicketTransferFileName')" min-width="180">
        <template #default="{ row }">
          <span>{{ row.name }}</span>
          <small v-if="row.size !== undefined" class="file-size">{{
            formatFileSize(row.size)
          }}</small>
        </template>
      </el-table-column>
      <el-table-column prop="path" :label="$t('TicketTransferFilePath')" min-width="220" />
      <el-table-column :label="$t('Status')" min-width="150">
        <template #default="{ row }">
          <span :class="['file-state', row.state]">{{
            $t('TicketTransferFileState_' + (row.state || 'pending'))
          }}</span>
          <p v-if="row.error" class="file-error">{{ $t('TicketTransferError_' + row.error) }}</p>
        </template>
      </el-table-column>
      <el-table-column :label="$t('Actions')" width="110">
        <template #default="{ row }">
          <el-link
            v-if="fileUrl(row)"
            :href="fileUrl(row)"
            target="_blank"
            rel="noopener"
            type="primary"
            underline="hover"
          >
            {{ $t(result.direction === 'upload' ? 'TicketTransferReviewFile' : 'Download') }}
          </el-link>
          <span v-else>—</span>
        </template>
      </el-table-column>
    </el-table>
    <p v-if="result.date_finished" class="transfer-result-help">
      {{ $t('DateFinished') }}: {{ toSafeLocalDateStr(result.date_finished) }}
    </p>
  </Details>
</template>
<script>
import Details from './Details'
import TicketFileTransferAccess from './TicketFileTransferAccess.vue'
import { useDateTime } from '@/composables/useDateTime'
import { formatFileSize } from '@/utils/common'
export default {
  components: { Details, TicketFileTransferAccess },
  props: {
    object: { type: Object, required: true },
    requestItems: { type: Array, default: () => [] }
  },
  emits: ['refresh'],
  setup: useDateTime,
  data: () => ({ submitting: false, now: Date.now(), timer: null }),
  computed: {
    result() {
      return this.object.result || {}
    },
    fileCounts() {
      const counts = { success: 0, failed: 0, unverified: 0, pending: 0, running: 0 }
      for (const file of this.result.files || []) {
        const state = file.state || 'pending'
        if (Object.hasOwn(counts, state)) counts[state]++
      }
      return counts
    },
    resultSummary() {
      const state = this.$t('TicketTransferState_' + this.result.state)
      if (!['failed', 'unverified'].includes(this.result.state)) return state
      const counts = Object.entries(this.fileCounts)
        .filter(([, count]) => count > 0)
        .map(([state, count]) => this.$t('TicketTransferCount_' + state, { count }))
      if (!counts.length) return state
      const needsVerification = this.result.state === 'unverified' || this.fileCounts.unverified > 0
      const partial =
        this.fileCounts.success > 0 && this.fileCounts.success < this.result.files.length
      return this.$t('TicketTransferResultSummary', {
        state: needsVerification
          ? this.$t('TicketTransferState_unverified')
          : partial
            ? this.$t('TicketTransferPartialSuccess')
            : state,
        counts: counts.join(this.$t('TicketTransferCountSeparator'))
      })
    },
    resultHelp() {
      if (!['failed', 'unverified'].includes(this.result.state)) return ''
      const needsVerification = this.result.state === 'unverified' || this.fileCounts.unverified > 0
      const help = this.$t(
        needsVerification ? 'TicketTransferUnverifiedHelp' : 'TicketTransferFailedHelp'
      )
      const downloadable =
        this.result.direction === 'download' &&
        this.result.files?.some((file) => file.state === 'success' && this.fileUrl(file))
      return downloadable ? `${this.$t('TicketTransferSuccessfulDownloadHelp')} ${help}` : help
    },
    detailItems() {
      return this.result.files?.length
        ? this.requestItems.filter((item) => item.name !== 'paths')
        : this.requestItems
    },
    ticketKey() {
      return `${this.object.org_id}:${this.object.id}`
    },
    expired() {
      return this.result.expired || Date.parse(this.result.expires_at) <= this.now
    },
    canExecute() {
      return (
        !this.expired &&
        this.result.state === 'ready' &&
        this.result.actions?.some((a) => a.type === 'execute_transfer')
      )
    }
  },
  watch: {
    'result.expires_at': {
      immediate: true,
      handler() {
        this.scheduleExpiry()
      }
    },
    ticketKey() {
      this.submitting = false
      this.scheduleExpiry()
    }
  },
  beforeUnmount() {
    clearTimeout(this.timer)
  },
  methods: {
    formatFileSize,
    scheduleExpiry() {
      clearTimeout(this.timer)
      this.now = Date.now()
      const remaining = Date.parse(this.result.expires_at) - this.now
      if (remaining > 0) {
        this.timer = setTimeout(() => this.scheduleExpiry(), Math.min(remaining, 2147483647))
      }
    },
    fileUrl(file) {
      if (!file.id || !this.object.id || !this.object.org_id || this.expired) return ''
      let action = ''
      if (this.result.direction === 'upload' && this.result.reviewable_files?.includes(file.id)) {
        action = 'review_transfer_file'
      }
      if (
        this.result.direction === 'download' &&
        this.result.actions?.some(
          (a) => a.type === 'download_transfer_file' && a.file_id === file.id
        )
      ) {
        action = 'download_transfer_file'
      }
      return action
        ? `/api/v1/tickets/tickets/${encodeURIComponent(this.object.id)}/actions/${action}/?oid=${encodeURIComponent(this.object.org_id)}&file_id=${encodeURIComponent(file.id)}`
        : ''
    },
    async execute() {
      this.now = Date.now()
      if (!this.canExecute || this.submitting) return
      const key = this.ticketKey
      this.submitting = true
      try {
        await this.$axios.post(
          `/api/v1/tickets/tickets/${encodeURIComponent(this.object.id)}/actions/execute_transfer/?oid=${encodeURIComponent(this.object.org_id)}`,
          {}
        )
      } finally {
        if (key === this.ticketKey) {
          this.submitting = false
          this.$emit('refresh')
        }
      }
    }
  }
}
</script>
<style scoped>
.transfer-summary {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin: 16px 0;
}
.transfer-summary strong {
  color: var(--el-text-color-primary);
  font-weight: 600;
}
.transfer-summary p,
.transfer-result-help {
  color: var(--el-text-color-regular);
  line-height: 1.7;
  margin: 6px 0 0;
}
.file-size {
  display: block;
  color: var(--el-text-color-regular);
}
.file-error {
  margin: 4px 0 0;
  overflow-wrap: anywhere;
}
.file-state.success {
  color: var(--el-color-success-dark-2);
}
.file-state.failed,
.file-state.unverified {
  color: var(--el-color-danger-dark-2);
}
.transfer-file-table {
  width: 100%;
}
@media (max-width: 640px) {
  .transfer-summary {
    flex-direction: column;
  }
}
</style>
