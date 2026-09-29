<template>
  <IBox title="DownloadReplay" class="ticket-replay-access">
    <div class="replay-access-row">
      <div class="replay-status" role="status">
        <strong>{{ $t(statusMessage) }}</strong>
        <span
          v-if="expiresAt && ['available', 'expired'].includes(accessState)"
          class="replay-expiry"
        >
          {{ $t('DateExpired') }}: {{ toSafeLocalDateStr(expiresAt) }}
        </span>
        <p v-if="accessState !== 'available'">{{ $t(statusMessage + 'Help') }}</p>
      </div>
      <el-button
        type="primary"
        :tag="downloadUrl ? 'a' : 'button'"
        :href="downloadUrl || undefined"
        :disabled="!downloadUrl"
        target="_blank"
        rel="noopener"
        @click="checkDownload"
      >
        {{ $t('DownloadReplay') }}
      </el-button>
    </div>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { useDateTime } from '@/composables/useDateTime'

export default {
  name: 'TicketReplayAccess',
  components: { IBox },
  props: { object: { type: Object, required: true } },
  setup: useDateTime,
  data: () => ({ now: Date.now(), expiryTimer: null }),
  computed: {
    ticketKey() {
      return `${this.object.org_id || ''}:${this.object.id || ''}`
    },
    action() {
      return (this.object.available_actions || []).find(
        (item) => item.type === 'download_replay' && item.session_id
      )
    },
    expiresAt() {
      return this.action?.expires_at || this.object.replay_access_status?.expires_at
    },
    accessState() {
      const state = this.object.replay_access_status?.state
      if (state && state !== 'available') return state
      const ticketState = this.object.state?.value || this.object.state
      if (ticketState === 'pending') return 'pending'
      if (ticketState && ticketState !== 'approved') return 'unapproved'
      if (ticketState !== 'approved' || !this.action) return 'unavailable'
      const expires = Date.parse(this.action.expires_at)
      if (!Number.isFinite(expires)) return 'unavailable'
      return expires > this.now ? 'available' : 'expired'
    },
    statusMessage() {
      return (
        {
          available: 'TicketReplayAvailable',
          expired: 'TicketReplayExpired',
          pending: 'TicketReplayPending',
          unapproved: 'TicketReplayUnapproved',
          not_applicant: 'TicketReplayApplicantOnly'
        }[this.accessState] || 'TicketReplayUnavailable'
      )
    },
    downloadUrl() {
      if (this.accessState !== 'available' || !this.object.id || !this.object.org_id) return ''
      return `/api/v1/tickets/tickets/${encodeURIComponent(this.object.id)}/replay/download/?oid=${encodeURIComponent(this.object.org_id)}`
    }
  },
  watch: {
    ticketKey() {
      this.scheduleExpiry()
    },
    expiresAt: {
      immediate: true,
      handler() {
        this.scheduleExpiry()
      }
    }
  },
  beforeUnmount() {
    clearTimeout(this.expiryTimer)
  },
  methods: {
    scheduleExpiry() {
      clearTimeout(this.expiryTimer)
      this.expiryTimer = null
      this.now = Date.now()
      const remaining = Date.parse(this.expiresAt) - this.now
      if (remaining > 0) {
        this.expiryTimer = setTimeout(() => this.scheduleExpiry(), Math.min(remaining, 2147483647))
      }
    },
    checkDownload(event) {
      this.now = Date.now()
      if (!this.downloadUrl) event.preventDefault()
    }
  }
}
</script>

<style scoped>
.ticket-replay-access {
  margin-bottom: 16px;
}
.replay-access-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.replay-status {
  min-width: 0;
  overflow-wrap: anywhere;
  line-height: 1.7;
}
.replay-status strong {
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.replay-expiry {
  margin-inline-start: 16px;
  color: var(--el-text-color-regular);
}
.replay-status p {
  margin: 6px 0 0;
  color: var(--el-text-color-regular);
}
@media (max-width: 480px) {
  .replay-expiry {
    display: block;
    margin-inline-start: 0;
  }
}
</style>
