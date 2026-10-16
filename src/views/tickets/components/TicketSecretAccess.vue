<template>
  <IBox title="TicketViewSecret" class="ticket-secret-access">
    <template v-if="accessState === 'available'">
      <div v-for="action in activeActions" :key="action.account_id" class="access-row">
        <div class="access-account">
          <strong>{{ action.name }}</strong>
          <span class="access-expiry">
            {{ $t('DateExpired') }}: {{ toSafeLocalDateStr(action.expires_at) }}
          </span>
        </div>
        <el-button
          type="primary"
          :disabled="!!loadingId"
          :loading="loadingId === action.account_id"
          @click="reveal(action)"
        >
          {{ $t('TicketViewPassword') }}
        </el-button>
      </div>
    </template>
    <div v-else class="access-status" role="status">
      <strong>{{ $t(statusMessage) }}</strong>
      <p v-if="accessState === 'expired' && expiresAt" class="access-expiry">
        {{ $t('DateExpired') }}: {{ toSafeLocalDateStr(expiresAt) }}
      </p>
      <p>{{ $t(statusMessage + 'Help') }}</p>
    </div>
    <Dialog
      v-model:visible="visible"
      :title="$t('TicketViewSecret')"
      :show-cancel="false"
      confirm-title="Confirm"
      width="540px"
      destroy-on-close
      @close="clear"
      @confirm="visible = false"
    >
      <dl class="secret-detail">
        <div class="secret-field">
          <dt class="secret-label">{{ $t('Account') }}</dt>
          <dd class="secret-value">{{ accountName }}</dd>
        </div>
        <div class="secret-field">
          <dt class="secret-label">{{ $t('Password') }}</dt>
          <dd class="secret-controls">
            <span class="secret-value secret-password">{{
              secretVisible ? secret : '******'
            }}</span>
            <div class="secret-actions">
              <el-button
                :aria-label="$t('TicketViewPassword')"
                :aria-pressed="secretVisible"
                :title="$t('TicketViewPassword')"
                text
                @click="secretVisible = !secretVisible"
              >
                <el-icon><Hide v-if="secretVisible" /><View v-else /></el-icon>
              </el-button>
              <el-button
                :aria-label="$t('Copy')"
                :title="$t('Copy')"
                :disabled="!secret"
                text
                @click="copy(secret)"
              >
                <el-icon><CopyDocument /></el-icon>
              </el-button>
            </div>
          </dd>
        </div>
      </dl>
    </Dialog>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import Dialog from '@/components/Dialog/index.vue'
import { copy } from '@/utils/common/index'
import { useDateTime } from '@/composables/useDateTime'

export default {
  name: 'TicketSecretAccess',
  components: { IBox, Dialog },
  props: { object: { type: Object, required: true } },
  setup: useDateTime,
  data: () => ({
    visible: false,
    loadingId: '',
    accountName: '',
    revealedAccountId: '',
    secret: '',
    secretVisible: false,
    now: Date.now(),
    expiryTimer: null,
    requestId: 0
  }),
  computed: {
    ticketKey() {
      return `${this.object.org_id || ''}:${this.object.id || ''}`
    },
    actions() {
      return (this.object.available_actions || []).filter((item) => item.type === 'view_secret')
    },
    activeActions() {
      return this.actions.filter((action) => Date.parse(action.expires_at) > this.now)
    },
    accessState() {
      const state = this.object.secret_access_status?.state
      if (state && state !== 'available') return state
      if (this.actions.length) return this.activeActions.length ? 'available' : 'expired'
      const ticketState = this.object.state?.value || this.object.state
      if (ticketState === 'pending') return 'pending'
      if (ticketState && ticketState !== 'approved') return 'unapproved'
      return 'unavailable'
    },
    expiresAt() {
      if (this.accessState === 'expired' && this.actions.length) {
        const latest = Math.max(...this.actions.map((action) => Date.parse(action.expires_at)))
        if (Number.isFinite(latest)) return new Date(latest).toISOString()
      }
      return this.object.secret_access_status?.expires_at
    },
    statusMessage() {
      return (
        {
          expired: 'TicketSecretExpired',
          pending: 'TicketSecretPending',
          unapproved: 'TicketSecretUnapproved',
          not_applicant: 'TicketSecretApplicantOnly',
          disabled: 'TicketSecretDisabled'
        }[this.accessState] || 'TicketSecretUnavailable'
      )
    }
  },
  watch: {
    ticketKey() {
      this.visible = false
      this.clear()
    },
    actions: {
      immediate: true,
      handler() {
        this.scheduleExpiry()
      }
    },
    activeActions(actions) {
      if (
        this.revealedAccountId &&
        !actions.some((item) => item.account_id === this.revealedAccountId)
      ) {
        this.visible = false
        this.clear()
      }
    },
    accessState(state) {
      if (state !== 'available') {
        this.visible = false
        this.clear()
      }
    }
  },
  beforeUnmount() {
    clearTimeout(this.expiryTimer)
    this.clear()
  },
  methods: {
    copy,
    scheduleExpiry() {
      clearTimeout(this.expiryTimer)
      this.now = Date.now()
      const next = Math.min(
        ...this.actions
          .map((action) => Date.parse(action.expires_at))
          .filter((time) => time > this.now)
      )
      if (Number.isFinite(next)) {
        this.expiryTimer = setTimeout(() => this.scheduleExpiry(), next - this.now + 20)
      }
    },
    async reveal(action) {
      this.now = Date.now()
      if (
        this.loadingId ||
        this.accessState !== 'available' ||
        !this.activeActions.some((item) => item.account_id === action.account_id)
      ) {
        return
      }
      const requestId = ++this.requestId
      const ticketKey = this.ticketKey
      this.loadingId = action.account_id
      try {
        const result = await this.$axios.post(
          `/api/v1/accounts/accounts/${action.account_id}/reveal-by-ticket/`,
          { ticket_id: this.object.id },
          { params: { oid: this.object.org_id } }
        )
        this.now = Date.now()
        if (
          requestId !== this.requestId ||
          ticketKey !== this.ticketKey ||
          this.accessState !== 'available' ||
          !this.activeActions.some((item) => item.account_id === action.account_id)
        ) {
          return
        }
        this.accountName = result.name
        this.revealedAccountId = action.account_id
        this.secret = result.secret
        this.visible = true
      } finally {
        if (requestId === this.requestId) this.loadingId = ''
      }
    },
    clear() {
      this.requestId++
      this.loadingId = ''
      this.secret = ''
      this.secretVisible = false
      this.accountName = ''
      this.revealedAccountId = ''
    }
  }
}
</script>

<style scoped>
.ticket-secret-access {
  margin-bottom: 16px;
}
.access-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px 20px;
}
.access-account {
  min-width: 0;
  overflow-wrap: anywhere;
}
.access-row + .access-row {
  margin-top: 16px;
}
.access-status {
  line-height: 1.7;
}
.access-status strong {
  color: var(--el-text-color-primary);
  font-weight: 500;
}
.access-status p {
  margin: 6px 0 0;
  color: var(--el-text-color-regular);
}
.access-expiry {
  display: block;
  color: var(--el-text-color-regular);
  margin-top: 4px;
}
.secret-detail {
  margin: 0;
}
.secret-field {
  display: flex;
  align-items: center;
  gap: 16px;
  min-width: 0;
  min-height: 56px;
  padding: 14px 0;
}
.secret-field + .secret-field {
  border-top: 1px solid var(--el-border-color-lighter);
}
.secret-label {
  flex: 0 0 96px;
  color: var(--el-text-color-primary);
  font-weight: 400;
}
.secret-value {
  flex: 1;
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
}
.secret-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
  margin: 0;
}
.secret-password {
  white-space: pre-wrap;
}
.secret-actions {
  display: flex;
  flex-shrink: 0;
}
.secret-actions .el-button {
  width: 28px;
  height: 28px;
  margin: 0;
  padding: 0;
}
@media (max-width: 480px) {
  .secret-field {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .secret-label {
    flex-basis: auto;
  }
}
</style>
