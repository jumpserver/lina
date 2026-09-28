<template>
  <IBox :title="$t('CredentialEventReception')" class="event-browser">
    <template #header>
      <div class="browser-heading">
        <h5>{{ $t('PolicyEventCycles') }}</h5>
        <div class="browser-actions">
          <slot name="actions" :cycle="detail" />
          <el-button :loading="cyclesLoading || detailLoading" @click="loadCycles(cyclePage)">{{
            $t('Refresh')
          }}</el-button>
        </div>
      </div>
    </template>
    <p class="event-help">{{ $t('PolicyEventCyclesHelp') }}</p>
    <el-alert
      v-if="cyclesFailed"
      :title="$t('PolicyCyclesLoadFailed')"
      type="error"
      :closable="false"
      show-icon
    />
    <el-skeleton v-else-if="cyclesLoading" :rows="8" animated />
    <el-empty v-else-if="!cycles.length" :description="$t('PolicyCyclesEmpty')" :image-size="64" />
    <template v-else>
      <div class="cycle-selector">
        <label>{{ $t('PolicyEventCycle') }}</label>
        <el-select v-model="cycleId" :aria-label="$t('PolicyEventCycle')" @change="loadCycle">
          <el-option
            v-for="cycle in cycles"
            :key="cycle.id"
            :value="cycle.id"
            :label="cycleLabel(cycle)"
          />
        </el-select>
        <el-pagination
          size="small"
          layout="total, prev, next"
          :page-size="10"
          :total="cycleCount"
          :current-page="cyclePage"
          :disabled="detailLoading"
          @current-change="loadCycles"
        />
      </div>
      <el-alert
        v-if="detailFailed"
        :title="$t('PolicyCycleDetailLoadFailed')"
        type="error"
        :closable="false"
        show-icon
      />
      <el-skeleton v-else-if="detailLoading" :rows="8" animated />
      <template v-else-if="detail">
        <header class="cycle-heading">
          <div>
            <h3>
              {{ cycleKind(detail) }}
              <el-tag :type="cycleStatusType(detail.status)">{{
                cycleStatus(detail.status)
              }}</el-tag>
            </h3>
            <p>
              {{ formatDate(detail.date_started) }} ·
              {{ $t('PolicyCycleEventCount', { count: detail.event_count }) }}
            </p>
            <p v-if="detail.accounts?.length > 1">
              {{ detail.accounts.map(accountLabel).join(' · ') }}
            </p>
            <p v-else-if="detail.account">{{ accountLabel(detail.account) }}</p>
          </div>
          <code :title="detail.id">{{ detail.id }}</code>
        </header>
        <el-alert
          v-if="detail.kind === 'legacy'"
          :title="$t('PolicyCycleLegacyHelp')"
          type="warning"
          :closable="false"
          show-icon
        />
        <el-alert
          v-if="detail.kind === 'rotation' && !detail.preparation"
          :title="$t('RotationLegacyPreparationMissing')"
          type="info"
          :closable="false"
          show-icon
        />
        <section
          v-if="detail.preparation"
          class="standby-observation"
          :aria-label="$t('RotationStandbyWaitingEvent')"
        >
          <h4>
            {{ $t('RotationStandbyWaitingEvent') }}
            <el-tag :type="detail.preparation.status === 'waiting_standby' ? 'warning' : 'info'">
              {{ observationStatus }}
            </el-tag>
          </h4>
          <p>{{ observationHelp }}</p>
          <dl>
            <div v-for="item in observationItems" :key="item.label">
              <dt>{{ $t(item.label) }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </section>
        <div v-if="stages.length" class="cycle-stages" :aria-label="$t('PolicyCycleStages')">
          <div
            v-for="stage in stages"
            :key="stage.label"
            :class="[
              'cycle-stage',
              {
                emitted: stage.event,
                current: stage.current,
                failed: stage.event?.event.endsWith('.failed')
              }
            ]"
          >
            <el-icon
              ><component
                :is="
                  stage.current
                    ? 'Clock'
                    : stage.event
                      ? stage.event.event.endsWith('.failed')
                        ? 'CircleClose'
                        : 'Check'
                      : 'Clock'
                "
            /></el-icon>
            <span>{{ $t(stage.label) }}</span>
            <small>{{
              $t(
                stage.current
                  ? 'StandbyObservationInProgress'
                  : stage.event
                    ? 'PolicyStageEmitted'
                    : stage.skipped
                      ? 'PolicyStageSkipped'
                      : 'PolicyStageNotEmitted'
              )
            }}</small>
          </div>
        </div>
        <p v-if="stages.length" class="stage-help">{{ $t('PolicyCycleStagesHelp') }}</p>
        <div class="event-workspace">
          <section class="policy-timeline" :aria-label="$t('PolicyCycleTimeline')">
            <h4>{{ $t('PolicyCycleTimeline') }}</h4>
            <div class="timeline-scroll">
              <el-timeline>
                <el-timeline-item
                  v-for="event in detail.events"
                  :key="event.id"
                  hide-timestamp
                  :type="
                    event.event.endsWith('.failed')
                      ? 'danger'
                      : selectedEventId === event.id
                        ? 'primary'
                        : 'info'
                  "
                  :hollow="selectedEventId !== event.id"
                >
                  <button
                    type="button"
                    class="event-option"
                    :class="{ selected: selectedEventId === event.id }"
                    :aria-pressed="selectedEventId === event.id"
                    @click="selectEvent(event)"
                  >
                    <span class="event-option-heading"
                      ><strong>{{ eventName(event) }}</strong
                      ><span>{{ formatDate(event.published_at) }}</span></span
                    >
                    <code>{{ event.event }}</code>
                    <span v-if="detail.accounts?.length > 1 && event.account">{{
                      accountLabel(event.account)
                    }}</span>
                    <span
                      v-if="event.event === 'rotation.standby.waiting' && event.preparation"
                      class="event-observation"
                    >
                      <span>{{
                        $t('StandbyObservationRequirement', {
                          days: event.preparation.standby_no_traffic_days
                        })
                      }}</span>
                      <span
                        >{{ $t('StandbyObservationEventEligibleAt') }}：{{
                          formatDate(event.preparation.eligible_at)
                        }}</span
                      >
                    </span>
                    <span class="event-meta"
                      ><span v-if="event.revision != null"
                        >{{ $t('AppAuditRevision') }} {{ event.revision }}</span
                      ><span>{{
                        $t('RotationEventReceiptCount', {
                          received: event.received_count,
                          total: event.recipient_count
                        })
                      }}</span
                      ><span v-if="event.requires_confirmation">{{
                        $t('PolicyEventConfirmCount', {
                          confirmed: event.confirmed_count,
                          total: event.recipient_count
                        })
                      }}</span></span
                    >
                  </button>
                </el-timeline-item>
              </el-timeline>
            </div>
          </section>
          <aside class="event-recipients" :aria-label="$t('PolicyEventRecipients')">
            <template v-if="selectedEvent">
              <h4>{{ $t('PolicyEventRecipients') }}</h4>
              <div class="recipient-event">
                <strong>{{ eventName(selectedEvent) }}</strong
                ><code>{{ selectedEvent.event }}</code
                ><span>{{ formatDate(selectedEvent.published_at) }}</span>
              </div>
              <p class="recipient-help">
                {{
                  $t(
                    selectedEvent.requires_confirmation
                      ? 'PolicyEventConfirmationHelp'
                      : 'PolicyEventReceiptHelp'
                  )
                }}
              </p>
              <div class="recipient-filters" role="group" :aria-label="$t('RotationReceiptFilter')">
                <button
                  v-for="filter in receiptFilters"
                  :key="filter.value"
                  type="button"
                  :aria-pressed="receiptFilter === filter.value"
                  @click="receiptFilter = filter.value"
                >
                  {{ $t(filter.label) }} <strong>{{ filter.count }}</strong>
                </button>
              </div>
              <el-input
                v-model="search"
                :placeholder="$t('PolicyEventClientSearch')"
                :aria-label="$t('PolicyEventClientSearch')"
                clearable
              />
              <el-empty
                v-if="!selectedEvent.recipients.length"
                :description="$t('PolicyEventNoRecipients')"
                :image-size="48"
              />
              <el-empty
                v-else-if="!filteredRecipients.length"
                :description="$t('EventNoMatchingClients')"
                :image-size="48"
              />
              <div v-else class="recipient-list">
                <div
                  v-for="client in visibleRecipients"
                  :key="client.id"
                  class="recipient-card"
                  :class="{ preferred: initialClient?.id === client.id }"
                >
                  <div class="recipient-heading">
                    <strong>{{ client.instance_id }}</strong
                    ><el-tag size="small" effect="plain">{{
                      client.type === 'agent' ? 'Agent' : 'SDK'
                    }}</el-tag>
                  </div>
                  <p>{{ client.application.name }} · {{ stateLabel(client) }}</p>
                  <div class="recipient-status">
                    <span>{{ $t('PolicyEventReceipt') }}</span
                    ><el-tag :type="receiptType(client)">{{
                      $t(statusLabels[receiptStatus(client)])
                    }}</el-tag>
                  </div>
                  <small v-if="client.received_at">{{ formatDate(client.received_at) }}</small>
                  <small v-else-if="!client.supports_receipts">{{
                    $t('RotationEventUpgradeClient')
                  }}</small>
                  <template v-if="selectedEvent.requires_confirmation">
                    <div class="recipient-status">
                      <span>{{ $t('PolicyEventApplicationConfirmation') }}</span
                      ><el-tag :type="client.confirmed_at ? 'success' : 'warning'">{{
                        $t(client.confirmed_at ? 'PolicyEventApplied' : 'PolicyEventNotApplied')
                      }}</el-tag>
                    </div>
                    <small v-if="client.confirmed_at">{{ formatDate(client.confirmed_at) }}</small>
                  </template>
                </div>
              </div>
              <el-pagination
                v-if="filteredRecipients.length > 10"
                v-model:current-page="recipientPage"
                size="small"
                layout="prev, pager, next"
                :page-size="10"
                :total="filteredRecipients.length"
                :pager-count="5"
              />
            </template>
          </aside>
        </div>
      </template>
    </template>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import { getCredentialEventCycles } from '@/api/applicationCredential'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { subscribedAccountLabel } from '../components/subscriptionAccount'
import { eventLabels, statusLabels, receiptStatus } from './rotationEventTimeline'

const cycleKinds = {
  rotation: 'PolicyRotationCycle',
  subscription: 'PolicySubscriptionCycle',
  subscription_refresh: 'PolicySubscriptionRefreshCycle',
  update: 'PolicyCredentialUpdate',
  event: 'PolicyStandaloneEvent',
  legacy: 'PolicyLegacyEvent'
}
const cycleStatuses = {
  preparing: 'PolicyCyclePreparing',
  running: 'PolicyCycleRunning',
  success: 'PolicyCycleSuccess',
  failed: 'PolicyCycleFailed',
  cancelled: 'PolicyCycleCancelled',
  published: 'PolicyCyclePublished'
}
const subscriptionStages = [
  ['PolicyStageChangeStarted', ['credential.change.started']],
  ['PolicyStageChangeResult', ['credential.change.completed', 'credential.change.failed']],
  ['PolicyStageCredentialPublished', ['credential.updated']]
]
const rotationStages = [
  ['PolicyStageAccountPublished', ['rotation.started']],
  ['PolicyStageWaitingForApplication', ['rotation.waiting_for_application']],
  ['PolicyStageChangeStarted', ['credential.change.started']],
  ['PolicyStageChangeResult', ['credential.change.completed', 'credential.change.failed']],
  ['PolicyStageRotationResult', ['rotation.completed', 'rotation.failed']]
]

export default {
  name: 'CredentialEventBrowser',
  components: { IBox },
  props: {
    credentialId: { type: String, default: '' },
    initialCycleId: { type: String, default: '' },
    subscription: Boolean,
    initialClient: { type: Object, default: null }
  },
  data() {
    return {
      cycles: [],
      cycleId: '',
      cycleCount: 0,
      cyclePage: 1,
      detail: null,
      selectedEventId: '',
      cyclesLoading: false,
      detailLoading: false,
      cyclesFailed: false,
      detailFailed: false,
      cycleRequest: 0,
      detailRequest: 0,
      search: this.initialClient?.instance_id || '',
      receiptFilter: '',
      recipientPage: 1,
      observationTimer: null,
      disposed: false,
      statusLabels
    }
  },
  computed: {
    selectedEvent() {
      return this.detail?.events.find((event) => event.id === this.selectedEventId)
    },
    observationStatus() {
      const labels = {
        preparing: 'StandbyObservationAwaitingAlignment',
        waiting_standby: 'StandbyObservationInProgress',
        ready_to_switch: 'StandbyObservationReady',
        completed: 'StandbyObservationCompleted',
        cancelled: 'PolicyCycleCancelled'
      }
      return this.$t(labels[this.detail.preparation.status] || 'StandbyObservationCompleted')
    },
    observationHelp() {
      const status = this.detail.preparation.status
      const key =
        status === 'preparing'
          ? 'StandbyObservationAlignmentHelp'
          : status === 'ready_to_switch'
            ? 'StandbyObservationReadyHelp'
            : 'StandbyObservationTrafficHelp'
      return this.$t(key)
    },
    observationItems() {
      const observation = this.detail.preparation
      const days = observation.standby_no_traffic_days
      const seconds = observation.remaining_seconds
      const minutes = seconds == null ? null : Math.ceil(seconds / 60)
      return [
        { label: 'StandbyAccount', value: this.accountLabel(observation.standby_account) },
        {
          label: 'StandbyNoTrafficDays',
          value: days == null ? '—' : this.$t('StandbyNoTrafficDaysValue', { days })
        },
        {
          label: 'StandbyLastSecretAccess',
          value: this.formatDate(observation.standby_last_access)
        },
        { label: 'StandbyIdleSince', value: this.formatDate(observation.standby_idle_since) },
        { label: 'RotationEligibleAt', value: this.formatDate(observation.eligible_at) },
        {
          label: 'StandbyObservationRemaining',
          value:
            minutes == null
              ? '—'
              : this.$t('StandbyObservationDuration', {
                  days: Math.floor(minutes / 1440),
                  hours: Math.floor((minutes % 1440) / 60),
                  minutes: minutes % 60
                })
        }
      ]
    },
    stages() {
      const definitions =
        this.detail?.kind === 'rotation'
          ? rotationStages
          : this.detail?.kind === 'subscription'
            ? subscriptionStages
            : this.detail?.kind === 'subscription_refresh'
              ? [['PolicyStageCredentialPublished', ['credential.updated']]]
              : []
      const preparationStages =
        this.detail?.preparation ||
        this.detail?.events.some((event) => event.event.startsWith('rotation.preparation.'))
          ? [
              ['RotationPreparationStartedEvent', ['rotation.preparation.started']],
              ['RotationAccountsAlignedEvent', ['rotation.accounts.aligned']],
              ['RotationStandbyWaitingEvent', ['rotation.standby.waiting']],
              ['RotationPreparationReadyEvent', ['rotation.preparation.ready']]
            ]
          : []
      return [...preparationStages, ...definitions].map(([label, codes]) => {
        const event = this.detail.events.findLast((event) => codes.includes(event.event))
        return {
          label,
          event,
          current:
            this.detail.preparation?.is_current &&
            ((label === 'RotationStandbyWaitingEvent' &&
              this.detail.preparation.status === 'waiting_standby') ||
              (label === 'RotationAccountsAlignedEvent' &&
                this.detail.preparation.status === 'preparing')),
          skipped:
            !event &&
            (this.detail.status === 'cancelled' ||
              (this.detail.kind === 'subscription' && this.detail.status === 'failed'))
        }
      })
    },
    receiptFilters() {
      const recipients = this.selectedEvent?.recipients || []
      const filters = [
        { value: '', label: 'PolicyEventAllRecipients', count: recipients.length },
        {
          value: 'received',
          label: 'RotationEventReceived',
          count: recipients.filter((client) => client.received_at).length
        },
        {
          value: 'pending',
          label: 'RotationReceiptPending',
          count: recipients.filter((client) => !client.received_at).length
        }
      ]
      if (this.selectedEvent?.requires_confirmation) {
        filters.push({
          value: 'confirmed',
          label: 'PolicyEventApplied',
          count: recipients.filter((client) => client.confirmed_at).length
        })
      }
      return filters
    },
    filteredRecipients() {
      const search = this.search.trim().toLowerCase()
      return (this.selectedEvent?.recipients || [])
        .filter(
          (client) =>
            (!search ||
              [client.instance_id, client.application.name].some((value) =>
                value.toLowerCase().includes(search)
              )) &&
            (!this.receiptFilter ||
              (this.receiptFilter === 'confirmed'
                ? client.confirmed_at
                : this.receiptFilter === 'received'
                  ? client.received_at
                  : !client.received_at))
        )
        .sort(
          (a, b) =>
            Number(!!a.received_at) - Number(!!b.received_at) ||
            a.application.name.localeCompare(b.application.name) ||
            a.instance_id.localeCompare(b.instance_id)
        )
    },
    visibleRecipients() {
      return this.filteredRecipients.slice((this.recipientPage - 1) * 10, this.recipientPage * 10)
    }
  },
  watch: {
    credentialId: {
      immediate: true,
      handler() {
        this.cycleId = this.initialCycleId
        this.detail = null
        this.loadCycles(1)
      }
    },
    search() {
      this.recipientPage = 1
    },
    receiptFilter() {
      this.recipientPage = 1
    }
  },
  beforeUnmount() {
    this.disposed = true
    clearTimeout(this.observationTimer)
    this.cycleRequest++
    this.detailRequest++
  },
  methods: {
    receiptStatus,
    accountLabel: subscribedAccountLabel,
    async loadCycles(page = 1) {
      clearTimeout(this.observationTimer)
      const request = ++this.cycleRequest
      this.detailRequest++
      this.detailLoading = false
      this.cyclePage = page
      this.cyclesLoading = true
      this.cyclesFailed = false
      if (!this.credentialId) {
        this.cyclesLoading = false
        return
      }
      try {
        const data = await getCredentialEventCycles(this.credentialId, {
          limit: 10,
          offset: (page - 1) * 10
        })
        if (request !== this.cycleRequest) return
        this.cycles = data.results
        this.cycleCount = data.count
        const preferred = data.results.find((cycle) => cycle.id === this.cycleId) || data.results[0]
        if (preferred) await this.loadCycle(preferred.id)
        else {
          this.cycleId = ''
          this.detail = null
          this.detailLoading = false
        }
      } catch {
        if (request === this.cycleRequest) this.cyclesFailed = true
      } finally {
        if (request === this.cycleRequest) this.cyclesLoading = false
      }
    },
    async loadCycle(id, { silent = false } = {}) {
      clearTimeout(this.observationTimer)
      const request = ++this.detailRequest
      this.cycleId = id
      this.detailLoading = !silent
      this.detailFailed = false
      try {
        const data = await getCredentialEventCycles(this.credentialId, { cycle_id: id })
        if (request !== this.detailRequest) return
        this.detail = data
        const previous = data.events.find((event) => event.id === this.selectedEventId)
        const targeted =
          this.initialClient &&
          data.events.findLast((event) =>
            event.recipients.some((client) => client.id === this.initialClient.id)
          )
        if (!silent || !previous) this.selectEvent(previous || targeted || data.events.at(-1))
      } catch {
        if (request === this.detailRequest && !silent) this.detailFailed = true
      } finally {
        if (request === this.detailRequest) {
          this.detailLoading = false
          this.scheduleObservationRefresh()
        }
      }
    },
    scheduleObservationRefresh() {
      clearTimeout(this.observationTimer)
      if (this.disposed || !this.detail?.preparation?.is_current) return
      this.observationTimer = setTimeout(
        () => this.loadCycle(this.cycleId, { silent: true }),
        30000
      )
    },
    selectEvent(event) {
      this.selectedEventId = event?.id || ''
      this.receiptFilter = ''
      this.recipientPage = 1
    },
    cycleKind(cycle) {
      return this.$t(cycleKinds[cycle.kind])
    },
    cycleLabel(cycle) {
      const account =
        cycle.accounts?.length > 1
          ? ` · ${this.$t('PolicyCycleAccountCount', { count: cycle.accounts.length })}`
          : cycle.account
            ? ` · ${this.accountLabel(cycle.account)}`
            : ''
      return `${this.cycleKind(cycle)}${account} · ${this.formatDate(cycle.date_started)} · ${this.cycleStatus(cycle.status)} · ${cycle.id.slice(-8)}`
    },
    cycleStatus(status) {
      return this.$t(cycleStatuses[status] || status)
    },
    cycleStatusType(status) {
      return { success: 'success', failed: 'danger', running: 'warning' }[status] || 'info'
    },
    eventName(event) {
      return this.$t(eventLabels[event.event] || event.event)
    },
    receiptType(client) {
      return client.received_at ? 'success' : client.publish_result === 'failed' ? 'danger' : 'info'
    },
    stateLabel(client) {
      return this.$t(
        !client.is_active ? 'RotationEventInactiveClient' : client.online ? 'Online' : 'Offline'
      )
    },
    formatDate(value) {
      return value ? toSafeLocalDateStr(value) : '—'
    }
  }
}
</script>

<style lang="scss" scoped>
.event-browser {
  color: var(--el-text-color-primary);
}
.browser-heading,
.cycle-selector,
.cycle-heading,
.event-option-heading,
.recipient-heading,
.recipient-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.browser-heading h5 {
  margin: 0;
}
.browser-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.event-help,
.stage-help,
.recipient-help {
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.7;
  margin: 0 0 18px;
}
.cycle-selector {
  margin-bottom: 20px;
}
.cycle-selector label {
  flex-shrink: 0;
}
.cycle-selector :deep(.el-select) {
  flex: 1;
  min-width: 0;
}
.cycle-heading {
  align-items: flex-start;
  margin-bottom: 18px;
}
.cycle-heading h3 {
  margin: 0 0 8px;
  font-size: 16px;
}
.cycle-heading h3 :deep(.el-tag) {
  margin-left: 8px;
}
.cycle-heading p {
  margin: 6px 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.cycle-heading > code {
  font-size: 11px;
  overflow-wrap: anywhere;
  max-width: 40%;
  color: var(--el-text-color-secondary);
}
.cycle-stages {
  display: flex;
  gap: 8px;
  margin: 18px 0 10px;
  flex-wrap: wrap;
}
.cycle-stage {
  flex: 1;
  min-width: 110px;
  padding: 10px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  display: grid;
  grid-template-columns: 16px 1fr;
  gap: 5px 8px;
  align-items: center;
  font-size: 12px;
}
.cycle-stage small {
  grid-column: 2;
}
.cycle-stage.emitted {
  border-style: solid;
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.cycle-stage.failed {
  border-color: var(--el-color-danger-light-5);
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
.cycle-stage.current {
  border-style: solid;
  border-color: var(--el-color-warning);
  color: var(--el-color-warning-dark-2);
  background: var(--el-color-warning-light-9);
}
.standby-observation {
  margin: 18px 0;
  padding: 16px 0;
  border-top: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.standby-observation h4 {
  margin: 0 0 10px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.standby-observation p {
  color: var(--el-text-color-regular);
  font-size: 12px;
  margin: 0 0 14px;
  line-height: 1.7;
}
.standby-observation dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 14px 20px;
  font-size: 12px;
}
.standby-observation dt {
  color: var(--el-text-color-secondary);
  margin-bottom: 5px;
}
.standby-observation dd {
  margin: 0;
  overflow-wrap: anywhere;
}
.event-observation {
  display: grid;
  gap: 5px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.event-workspace {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(300px, 2fr);
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 18px;
  min-height: 420px;
}
.event-workspace h4 {
  margin: 0 0 18px;
  font-size: 14px;
}
.policy-timeline {
  min-width: 0;
  padding-right: 22px;
}
.timeline-scroll {
  max-height: 680px;
  overflow-y: auto;
  padding: 8px 10px 0 2px;
}
.timeline-scroll :deep(.el-timeline) {
  padding-left: 6px;
}
.event-option {
  box-sizing: border-box;
  display: grid;
  gap: 9px;
  width: 100%;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: transparent;
  color: inherit;
  padding: 14px;
  text-align: left;
  font: inherit;
  cursor: pointer;
}
.event-option:hover,
.event-option.selected {
  background: var(--el-color-primary-light-9);
  border-color: var(--el-color-primary-light-5);
}
.event-option-heading {
  flex-wrap: wrap;
  font-size: 13px;
}
.event-option-heading > span,
.event-meta {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.event-option code,
.recipient-event code {
  font-size: 12px;
  overflow-wrap: anywhere;
}
.event-meta {
  display: flex;
  gap: 6px 14px;
  flex-wrap: wrap;
}
.event-recipients {
  padding-left: 22px;
  border-left: 1px solid var(--el-border-color-lighter);
  min-width: 0;
}
.recipient-event {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}
.recipient-event > span {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.recipient-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 12px;
}
.recipient-filters button {
  border: 1px solid var(--el-border-color);
  border-radius: 4px;
  padding: 6px 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
}
.recipient-filters button[aria-pressed='true'] {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
  background: var(--el-color-primary-light-9);
}
.recipient-list {
  margin: 12px 0;
  max-height: 560px;
  overflow-y: auto;
}
.recipient-card {
  padding: 14px 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.recipient-card.preferred {
  background: var(--el-fill-color-light);
}
.recipient-heading strong {
  overflow-wrap: anywhere;
  min-width: 0;
  font-size: 13px;
}
.recipient-card p,
.recipient-card small {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin: 8px 0;
  display: block;
}
.recipient-status {
  margin-top: 12px;
  font-size: 12px;
}
.event-option:focus-visible,
.recipient-filters button:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
@media (max-width: 800px) {
  .cycle-selector {
    flex-wrap: wrap;
  }
  .cycle-selector :deep(.el-select) {
    min-width: 220px;
  }
  .cycle-heading {
    flex-wrap: wrap;
  }
  .cycle-heading > code {
    max-width: 100%;
  }
  .event-workspace {
    grid-template-columns: minmax(0, 1fr);
    gap: 20px;
  }
  .policy-timeline {
    padding-right: 0;
  }
  .event-recipients {
    padding: 20px 0 0;
    border-left: 0;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}
</style>
