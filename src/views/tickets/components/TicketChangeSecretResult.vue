<template>
  <IBox v-if="object.execution_mode === 'automatic'" title="TicketChangeSecretExecution">
    <template #header>
      <div class="execution-heading">
        <strong>{{ $t('TicketChangeSecretExecution') }}</strong>
        <el-button link @click="$emit('refresh')">
          <el-icon><Refresh /></el-icon>{{ $t('Refresh') }}
        </el-button>
      </div>
    </template>
    <div class="execution-result" role="status" aria-live="polite">
      <div class="execution-overview">
        <div class="execution-conclusion">
          <el-icon class="execution-icon" :class="`is-${tone}`" aria-hidden="true">
            <component :is="statusIcon" />
          </el-icon>
          <div class="execution-message">
            <strong class="execution-status">{{ $t(statusMessage) }}</strong>
            <p v-if="helpMessage" class="execution-help">{{ $t(helpMessage) }}</p>
          </div>
        </div>
        <el-button v-if="result.log_task_id" class="execution-log" @click="openExecutionLog">
          <el-icon aria-hidden="true"><Document /></el-icon>
          <span>{{ $t('ExecutionLog') }}</span>
        </el-button>
      </div>
      <el-progress
        v-if="state === 'running' && result.counts"
        class="execution-progress"
        :percentage="progress"
        :stroke-width="4"
      />
      <dl v-if="resultCounts.length" class="execution-counts">
        <div v-for="item in resultCounts" :key="item.key" class="execution-count">
          <dt>{{ $t(item.label) }}</dt>
          <dd :class="`is-${item.tone}`">{{ item.value }}</dd>
        </div>
      </dl>
      <p v-if="result.date_finished" class="execution-finished">
        {{ $t('DateFinished') }}
        <time :datetime="result.date_finished">{{ toSafeLocalDateStr(result.date_finished) }}</time>
      </p>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { useDateTime } from '@/composables/useDateTime'
import { openTaskPage } from '@/utils/jms/index'

export default {
  name: 'TicketChangeSecretResult',
  components: { IBox },
  props: { object: { type: Object, required: true } },
  emits: ['refresh'],
  setup: useDateTime,
  methods: {
    openExecutionLog() {
      if (this.result.log_task_id) openTaskPage(this.result.log_task_id)
    }
  },
  computed: {
    result() {
      return this.object.result || {}
    },
    state() {
      const state = this.object.state?.value || this.object.state
      if (state === 'pending') return 'pending'
      if (state !== 'approved') return 'unapproved'
      return this.result.state || 'unavailable'
    },
    statusMessage() {
      return (
        {
          pending: 'TicketChangeSecretPending',
          queued: 'TicketChangeSecretQueued',
          running: 'TicketChangeSecretRunning',
          success: 'TicketChangeSecretSuccess',
          failed: 'TicketChangeSecretFailed',
          unverified: 'TicketChangeSecretUnverified',
          unapproved: 'TicketChangeSecretUnapproved'
        }[this.state] || 'TicketChangeSecretUnavailable'
      )
    },
    tone() {
      return (
        { success: 'success', failed: 'danger', unverified: 'warning', running: 'primary' }[
          this.state
        ] || 'info'
      )
    },
    statusIcon() {
      return {
        success: 'CircleCheckFilled',
        danger: 'CircleCloseFilled',
        warning: 'WarningFilled',
        primary: 'Loading',
        info: 'InfoFilled'
      }[this.tone]
    },
    helpMessage() {
      if (this.state === 'unverified') return 'TicketChangeSecretVerificationHelp'
      if (this.state === 'failed') {
        return this.result.log_task_id
          ? 'TicketChangeSecretLogHelp'
          : 'TicketChangeSecretFailureHelp'
      }
      return this.state === 'unavailable' ? 'TicketChangeSecretUnavailableHelp' : ''
    },
    resultCounts() {
      const counts = this.result.counts
      if (!counts || ['pending', 'unapproved'].includes(this.state)) return []
      return [
        { key: 'total', label: 'TicketChangeSecretTotal', tone: 'info' },
        { key: 'success', label: 'Success', tone: 'success' },
        { key: 'failed', label: 'Failed', tone: 'danger' },
        { key: 'unverified', label: 'TicketChangeSecretNeedsVerification', tone: 'warning' },
        { key: 'pending', label: 'TicketChangeSecretUnfinished', tone: 'info' }
      ]
        .filter((item) => item.key === 'total' || counts[item.key] > 0)
        .map((item) => ({ ...item, value: counts[item.key] }))
    },
    progress() {
      const counts = this.result.counts
      if (!counts?.total) return 0
      return Math.min(
        100,
        Math.round((100 * (counts.success + counts.failed + counts.unverified)) / counts.total)
      )
    }
  }
}
</script>

<style scoped>
.execution-heading,
.execution-overview {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.execution-result {
  --execution-danger: color-mix(in srgb, var(--el-color-danger) 70%, var(--el-text-color-primary));
  --execution-warning: color-mix(
    in srgb,
    var(--el-color-warning) 50%,
    var(--el-text-color-primary)
  );
  --execution-success: color-mix(
    in srgb,
    var(--el-color-success) 70%,
    var(--el-text-color-primary)
  );
  color: var(--el-text-color-primary);
}
.execution-conclusion {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  min-width: 0;
}
.execution-icon {
  flex: none;
  margin-top: 1px;
  font-size: 20px;
}
.execution-message {
  min-width: 0;
  overflow-wrap: anywhere;
}
.execution-status {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}
.execution-help {
  margin: 4px 0 0;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 20px;
}
.execution-log {
  flex: none;
  margin: 0;
}
.execution-counts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 24px;
  margin: 16px 0 0 30px;
}
.execution-count {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 13px;
  line-height: 20px;
}
.execution-count dt {
  color: var(--el-text-color-regular);
  font-weight: 400;
}
.execution-count dd {
  margin: 0;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.execution-finished {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 8px;
  margin: 10px 0 0 30px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 20px;
}
.execution-finished time {
  font-variant-numeric: tabular-nums;
}
.execution-progress {
  margin: 14px 0 0 30px;
}
.is-danger {
  color: var(--execution-danger);
}
.is-warning {
  color: var(--execution-warning);
}
.is-success {
  color: var(--execution-success);
}
.is-primary {
  color: var(--el-color-primary);
}
.execution-icon.is-info {
  color: var(--el-text-color-secondary);
}
@media (max-width: 640px) {
  .execution-overview {
    align-items: flex-start;
    flex-direction: column;
    gap: 12px;
  }
  .execution-log {
    margin-left: 30px;
  }
  .execution-counts {
    gap: 8px 16px;
  }
}
</style>
