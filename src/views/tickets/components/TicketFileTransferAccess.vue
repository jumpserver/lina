<template>
  <Details :detail-card-items="detailItems" :title="$t('ApplyInfo')">
    <p class="transfer-hint">
      {{
        $t(accessState === 'approval_only' ? 'TicketApprovalOnlyHint' : 'TicketTransferScopeHelp')
      }}
      <template v-if="accessState === 'available'">
        {{ $t('TicketTransferReconnectHelp') }}</template
      >
      <template v-else-if="accessState === 'unavailable'">
        {{ $t('TicketTransferUnavailableHelp') }}
      </template>
    </p>
  </Details>
</template>

<script>
import { h } from 'vue'
import Details from './Details'
import { useDateTime } from '@/composables/useDateTime'

export default {
  name: 'TicketFileTransferAccess',
  components: { Details },
  props: {
    object: { type: Object, required: true },
    requestItems: { type: Array, default: () => [] }
  },
  setup: useDateTime,
  data: () => ({ now: Date.now(), expiryTimer: null }),
  computed: {
    detailItems() {
      const items = [
        ...this.requestItems,
        {
          key: this.$t('TicketTransferStatus'),
          value: this.$t(this.statusMessage),
          formatter: (item, value) => h('span', { role: 'status' }, value)
        }
      ]
      if (this.accessState !== 'approval_only') {
        items.push({
          key: this.$t('Protocols'),
          value: (this.access.protocols || []).join(', ') || '-'
        })
        const state = this.object.state?.value || this.object.state
        if (state === 'approved' && this.access.starts_at && this.access.expires_at) {
          items.push(
            {
              key: this.$t('TicketTransferStartsAt'),
              value: this.toSafeLocalDateStr(this.access.starts_at)
            },
            {
              key: this.$t('TicketTransferExpiresAt'),
              value: this.toSafeLocalDateStr(this.access.expires_at)
            }
          )
        }
      }
      return items
    },
    ticketKey() {
      return `${this.object.org_id || ''}:${this.object.id || ''}`
    },
    access() {
      return this.object.result || {}
    },
    direction() {
      return ['upload', 'download'].includes(this.access.direction) ? this.access.direction : ''
    },
    accessState() {
      if (this.object.execution_mode === 'approval_only' || this.access.state === 'approval_only') {
        return 'approval_only'
      }
      const state = this.object.state?.value || this.object.state
      if (state === 'pending') return 'pending'
      if (state !== 'approved') return 'unavailable'
      if (this.access.state !== 'available') {
        return this.access.state === 'expired' ? 'expired' : 'unavailable'
      }
      const start = Date.parse(this.access.starts_at)
      const expires = Date.parse(this.access.expires_at)
      if (!this.direction || !Number.isFinite(start) || !Number.isFinite(expires)) {
        return 'unavailable'
      }
      if (expires <= this.now) return 'expired'
      return start <= this.now ? 'available' : 'unavailable'
    },
    statusMessage() {
      return {
        pending: 'TicketTransferPending',
        available: 'TicketTransferAvailable',
        expired: 'TicketTransferExpired',
        unavailable: 'TicketTransferUnavailable',
        approval_only: 'TicketTransferLegacy'
      }[this.accessState]
    },
    expiryKey() {
      return `${this.access.starts_at || ''}:${this.access.expires_at || ''}`
    }
  },
  watch: {
    ticketKey() {
      this.scheduleExpiry()
    },
    expiryKey: {
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
      const deadlines = [this.access.starts_at, this.access.expires_at]
        .map((value) => Date.parse(value) - this.now)
        .filter((remaining) => remaining > 0)
      if (deadlines.length) {
        this.expiryTimer = setTimeout(
          () => this.scheduleExpiry(),
          Math.min(...deadlines, 2147483647)
        )
      }
    }
  }
}
</script>

<style scoped>
.transfer-hint {
  margin: 8px 0 0;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  overflow-wrap: anywhere;
}
</style>
