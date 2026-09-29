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
      <p v-if="entries.length > 1" class="event-help">{{ $t('ApplicationBatchEventHelp') }}</p>
      <el-form label-position="top" :disabled="sending" @submit.prevent>
        <el-form-item v-if="pendingEntries.length" :label="$t('ApplicationEventType')">
          <el-select v-model="event" class="full-width" :disabled="hasResults">
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
        <p v-if="pendingEntries.length" class="event-help">
          {{
            $t(switching ? 'ApplicationAccountSwitchRequestHelp' : 'ApplicationRestartRequestHelp')
          }}
        </p>
        <section v-for="entry in entries" :key="entry.application.id" class="event-application">
          <h4>{{ entry.application.name }}</h4>
          <template v-if="entry.result">
            <el-alert
              :title="$t('ApplicationEventSentHelp')"
              type="success"
              :closable="false"
              show-icon
            />
            <ApplicationCommandResults :commands="[entry.result]" />
            <el-button
              :loading="entry.refreshing"
              :disabled="sending"
              @click="refreshResult(entry)"
            >
              {{ $t('Refresh') }}
            </el-button>
          </template>
          <template v-else>
            <el-alert
              v-if="entry.loadFailed"
              :title="$t('ApplicationEventOptionsLoadFailed')"
              type="error"
              :closable="false"
            />
            <el-button
              v-if="entry.loadFailed"
              :loading="entry.loading"
              @click="loadEntry(entry, requestId)"
              >{{ $t('Retry') }}</el-button
            >
            <template v-else>
              <el-form-item v-if="switching" :label="$t('CredentialPolicies')">
                <el-select
                  v-model="entry.credentialId"
                  class="full-width"
                  filterable
                  @change="selectEligible(entry)"
                >
                  <el-option
                    v-for="item in entry.credentials"
                    :key="item.id"
                    :value="item.id"
                    :label="`${item.name} · ${item.asset} / ${item.account}`"
                  />
                </el-select>
              </el-form-item>
              <el-form-item :label="$t('ApplicationEventTargets')">
                <el-select
                  v-model="entry.clientIds"
                  multiple
                  class="full-width"
                  :placeholder="$t('ApplicationSelectEventTargets')"
                >
                  <el-option
                    v-for="client in entry.clients"
                    :key="client.id"
                    :value="client.id"
                    :disabled="!eligible(entry, client)"
                    :label="`${client.instance_id} · ${client.type === 'sdk' ? 'SDK' : 'Agent'} · ${$t(client.online ? 'Online' : 'Offline')}`"
                  />
                </el-select>
              </el-form-item>
              <p class="event-help">{{ $t('ApplicationEventTargetsHelp') }}</p>
              <el-alert
                v-if="!entry.loading && !entry.clients.length"
                :title="$t('ApplicationNoEventConnections')"
                type="info"
                :closable="false"
              />
              <el-alert
                v-if="entry.error"
                :title="$t('ApplicationEventSendFailed')"
                :description="entry.error"
                type="error"
                :closable="false"
              />
            </template>
          </template>
        </section>
        <el-form-item v-if="pendingEntries.length" :label="$t('ApplicationEventTimeoutMinutes')">
          <el-input-number
            v-model="timeoutMinutes"
            :min="1"
            :max="1440"
            :precision="0"
            :disabled="hasResults"
          />
        </el-form-item>
        <p v-if="hasResults && pendingEntries.length" class="event-help">
          {{ $t('ApplicationBatchEventRetryHelp') }}
        </p>
      </el-form>
    </div>
    <template #footer>
      <el-button :disabled="sending" @click="shown = false">{{
        $t(hasResults ? 'Close' : 'Cancel')
      }}</el-button>
      <el-button
        v-if="pendingEntries.length"
        type="primary"
        :loading="sending"
        :disabled="!canSend"
        @click="send"
        >{{ $t(hasSendErrors ? 'Retry' : 'Send') }}</el-button
      >
    </template>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { getErrorResponseMsg } from '@/utils/common/index'
import ApplicationCommandResults from './ApplicationCommandResults.vue'

export default {
  components: { Dialog, ApplicationCommandResults },
  props: {
    visible: { type: Boolean, default: false },
    application: { type: Object, default: null },
    applications: { type: Array, default: () => [] }
  },
  emits: ['update:visible', 'sent'],
  data() {
    return {
      loading: false,
      sending: false,
      entries: [],
      requestId: 0,
      event: 'credential.switch.requested',
      timeoutMinutes: 30
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
    sourceApplications() {
      return this.applications.length
        ? this.applications
        : this.application
          ? [this.application]
          : []
    },
    switching() {
      return this.event === 'credential.switch.requested'
    },
    canSwitch() {
      return this.$hasPerm('accounts.change_applicationcredential')
    },
    pendingEntries() {
      return this.entries.filter((entry) => !entry.result)
    },
    hasResults() {
      return this.entries.some((entry) => entry.result)
    },
    hasSendErrors() {
      return this.pendingEntries.some((entry) => entry.error)
    },
    canSend() {
      return (
        !this.loading &&
        this.$hasPerm('accounts.change_integrationapplication') &&
        (!this.switching || this.canSwitch) &&
        Number.isInteger(this.timeoutMinutes) &&
        this.timeoutMinutes >= 1 &&
        this.timeoutMinutes <= 1440 &&
        this.pendingEntries.length > 0 &&
        this.pendingEntries.every(
          (entry) =>
            !entry.loading &&
            !entry.loadFailed &&
            entry.clientIds.length > 0 &&
            (!this.switching || entry.credentialId) &&
            entry.clientIds.every((id) =>
              entry.clients.some((client) => client.id === id && this.eligible(entry, client))
            )
        )
      )
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        if (value) this.load()
        else this.requestId += 1
      }
    },
    event() {
      this.entries.filter((entry) => !entry.result).forEach(this.selectEligible)
    }
  },
  beforeUnmount() {
    this.requestId += 1
  },
  methods: {
    eligible(entry, client) {
      return this.switching
        ? client.credential_ids?.includes(entry.credentialId)
        : client.restart_supported
    },
    selectEligible(entry) {
      entry.clientIds = entry.clients
        .filter((client) => this.eligible(entry, client))
        .map((client) => client.id)
    },
    async loadEntry(entry, requestId) {
      entry.loading = true
      entry.loadFailed = false
      try {
        const data = await this.$axios.get(
          `/api/v1/accounts/integration-applications/${entry.application.id}/send-event-options/`
        )
        if (requestId !== this.requestId) return
        if (!Array.isArray(data.clients) || !Array.isArray(data.credentials)) {
          throw new TypeError('Invalid event options')
        }
        entry.clients = data.clients
        entry.credentials = data.credentials
        entry.credentialId = data.credentials[0]?.id || ''
        this.selectEligible(entry)
      } catch {
        if (requestId === this.requestId) entry.loadFailed = true
      } finally {
        if (requestId === this.requestId) entry.loading = false
      }
    },
    async load() {
      const requestId = ++this.requestId
      this.loading = true
      this.sending = false
      this.timeoutMinutes = 30
      this.entries = this.sourceApplications.map((application) => ({
        application: { ...application },
        clients: [],
        credentials: [],
        credentialId: '',
        clientIds: [],
        result: null,
        loading: true,
        loadFailed: false,
        refreshing: false,
        error: ''
      }))
      await Promise.all(this.entries.map((entry) => this.loadEntry(entry, requestId)))
      if (requestId !== this.requestId) return
      this.event =
        this.canSwitch && this.entries.every((entry) => entry.credentialId)
          ? 'credential.switch.requested'
          : 'application.restart.requested'
      this.entries.filter((entry) => !entry.loadFailed).forEach(this.selectEligible)
      this.loading = false
    },
    async send() {
      if (!this.canSend || this.sending) return
      const requestId = this.requestId
      const event = this.event
      const timeoutMinutes = this.timeoutMinutes
      this.sending = true
      try {
        for (const entry of this.pendingEntries) {
          if (requestId !== this.requestId) break
          entry.error = ''
          try {
            const result = await this.$axios.post(
              `/api/v1/accounts/integration-applications/${entry.application.id}/send-event/`,
              {
                event,
                client_ids: [...entry.clientIds],
                timeout_minutes: timeoutMinutes,
                ...(event === 'credential.switch.requested'
                  ? { credential_id: entry.credentialId }
                  : {})
              }
            )
            if (requestId !== this.requestId) break
            entry.result = result
            this.$emit('sent', result)
          } catch (error) {
            if (requestId !== this.requestId) break
            entry.error = getErrorResponseMsg(error) || this.$t('ApplicationEventSendFailed')
          }
        }
      } finally {
        if (requestId === this.requestId) this.sending = false
      }
    },
    async refreshResult(entry) {
      const requestId = this.requestId
      entry.refreshing = true
      try {
        const data = await this.$axios.get(
          `/api/v1/accounts/integration-applications/${entry.application.id}/manual-events/`,
          { params: { command_id: entry.result.command_id } }
        )
        if (requestId !== this.requestId) return
        entry.result =
          data.results.find((item) => item.command_id === entry.result.command_id) || entry.result
      } finally {
        if (requestId === this.requestId) entry.refreshing = false
      }
    }
  }
}
</script>

<style scoped>
.event-send-content {
  padding: 20px 24px;
}
.event-application + .event-application {
  margin-top: 20px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}
.event-application h4 {
  margin: 0 0 12px;
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
