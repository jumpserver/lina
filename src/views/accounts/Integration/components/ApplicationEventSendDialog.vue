<template>
  <Dialog
    v-model:visible="shown"
    :title="$t('SendApplicationEvent')"
    width="850px"
    :close-on-click-modal="!sending"
    :close-on-press-escape="!sending"
    :show-close="!sending"
  >
    <div v-loading="loading" class="event-send-content">
      <p class="event-application">{{ application.name }}</p>
      <el-alert
        v-if="loadFailed"
        :title="$t('ApplicationEventOptionsLoadFailed')"
        type="error"
        :closable="false"
      />
      <template v-else-if="result">
        <el-alert
          :title="$t('ApplicationEventSentHelp')"
          type="success"
          :closable="false"
          show-icon
        />
        <ApplicationCommandResults :commands="[result]" />
        <el-button :loading="refreshing" @click="refreshResult">{{ $t('Refresh') }}</el-button>
      </template>
      <el-form v-else label-position="top">
        <el-form-item :label="$t('ApplicationEventType')">
          <el-select v-model="event" class="full-width">
            <el-option
              :label="$t('ApplicationAccountSwitchRequest')"
              value="credential.switch.requested"
              :disabled="!canSwitch"
            />
            <el-option
              :label="$t('ApplicationRestartRequest')"
              value="application.restart.requested"
            />
          </el-select>
        </el-form-item>
        <template v-if="switching">
          <el-form-item :label="$t('CredentialPolicies')">
            <el-select v-model="credentialId" class="full-width" filterable>
              <el-option
                v-for="item in credentials"
                :key="item.id"
                :value="item.id"
                :label="`${item.name} · ${item.asset} / ${item.account}`"
              />
            </el-select>
          </el-form-item>
          <p class="event-help">{{ $t('ApplicationAccountSwitchRequestHelp') }}</p>
        </template>
        <p v-else class="event-help">{{ $t('ApplicationRestartRequestHelp') }}</p>
        <el-form-item :label="$t('ApplicationEventTargets')">
          <el-select
            v-model="clientIds"
            multiple
            class="full-width"
            :placeholder="$t('ApplicationSelectEventTargets')"
          >
            <el-option
              v-for="client in clients"
              :key="client.id"
              :value="client.id"
              :disabled="!eligible(client)"
              :label="`${client.instance_id} · ${client.type === 'sdk' ? 'SDK' : 'Agent'} · ${$t(client.online ? 'Online' : 'Offline')}`"
            />
          </el-select>
        </el-form-item>
        <p class="event-help">{{ $t('ApplicationEventTargetsHelp') }}</p>
        <el-alert
          v-if="!loading && !clients.length"
          :title="$t('ApplicationNoEventConnections')"
          type="info"
          :closable="false"
        />
        <el-form-item :label="$t('ApplicationEventTimeoutMinutes')">
          <el-input-number v-model="timeoutMinutes" :min="1" :max="1440" :precision="0" />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <el-button :disabled="sending" @click="shown = false">{{
        $t(result ? 'Close' : 'Cancel')
      }}</el-button>
      <el-button
        v-if="!result"
        type="primary"
        :loading="sending"
        :disabled="!canSend"
        @click="send"
        >{{ $t('Send') }}</el-button
      >
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import ApplicationCommandResults from './ApplicationCommandResults.vue'

export default {
  components: { Dialog, ApplicationCommandResults },
  props: {
    visible: { type: Boolean, default: false },
    application: { type: Object, required: true }
  },
  emits: ['update:visible', 'sent'],
  data() {
    return {
      loading: false,
      sending: false,
      refreshing: false,
      loadFailed: false,
      clients: [],
      credentials: [],
      event: 'credential.switch.requested',
      credentialId: '',
      clientIds: [],
      timeoutMinutes: 30,
      result: null
    }
  },
  computed: {
    shown: {
      get() {
        return this.visible
      },
      set(value) {
        this.$emit('update:visible', value)
      }
    },
    switching() {
      return this.event === 'credential.switch.requested'
    },
    canSwitch() {
      return this.$hasPerm('accounts.change_applicationcredential')
    },
    canSend() {
      return (
        !this.loading &&
        !this.loadFailed &&
        this.clientIds.length > 0 &&
        (!this.switching || (this.canSwitch && this.credentialId))
      )
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        if (value) this.load()
      }
    },
    event() {
      this.selectEligible()
    },
    credentialId() {
      this.selectEligible()
    }
  },
  methods: {
    eligible(client) {
      return this.switching
        ? client.credential_ids.includes(this.credentialId)
        : client.restart_supported
    },
    selectEligible() {
      this.clientIds = this.clients.filter(this.eligible).map((item) => item.id)
    },
    async load() {
      this.result = null
      this.loading = true
      this.loadFailed = false
      this.clients = []
      this.credentials = []
      this.clientIds = []
      this.timeoutMinutes = 30
      try {
        const data = await this.$axios.get(
          `/api/v1/accounts/integration-applications/${this.application.id}/send-event-options/`
        )
        this.clients = data.clients
        this.credentials = data.credentials
        this.credentialId = data.credentials[0]?.id || ''
        this.event =
          this.canSwitch && this.credentialId
            ? 'credential.switch.requested'
            : 'application.restart.requested'
        this.selectEligible()
      } catch {
        this.loadFailed = true
      } finally {
        this.loading = false
      }
    },
    async send() {
      if (!this.canSend || this.sending) return
      this.sending = true
      try {
        this.result = await this.$axios.post(
          `/api/v1/accounts/integration-applications/${this.application.id}/send-event/`,
          {
            event: this.event,
            client_ids: this.clientIds,
            timeout_minutes: this.timeoutMinutes,
            ...(this.switching ? { credential_id: this.credentialId } : {})
          }
        )
        this.$emit('sent', this.result)
      } finally {
        this.sending = false
      }
    },
    async refreshResult() {
      this.refreshing = true
      try {
        const data = await this.$axios.get(
          `/api/v1/accounts/integration-applications/${this.application.id}/manual-events/`,
          { params: { command_id: this.result.command_id } }
        )
        this.result =
          data.results.find((item) => item.command_id === this.result.command_id) || this.result
      } finally {
        this.refreshing = false
      }
    }
  }
}
</script>

<style scoped>
.event-send-content {
  padding: 20px 24px;
}
.event-application {
  margin-top: 0;
  font-weight: 600;
}
.event-help {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  line-height: 1.6;
}
.full-width {
  width: 100%;
}
</style>
