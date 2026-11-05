<template>
  <div>
    <section v-if="!latest" class="event-browser">
      <el-alert type="info" :closable="false" show-icon>
        <template #title>
          <div class="retention-help">
            <span>{{
              retentionDays == null
                ? $t('PolicyCycleRetentionHelp')
                : $t('PolicyCycleRetentionDays', { days: retentionDays })
            }}</span>
            <router-link
              v-if="
                $hasPerm('settings.change_clean') &&
                $hasPerm('ops.view_celerytask') &&
                $hasPerm('settings.change_ops')
              "
              :to="{ name: 'TaskList', query: { tab: 'Clean' } }"
              >{{ $t('PolicyCycleCleaningSettings') }}</router-link
            >
          </div>
        </template>
      </el-alert>
      <el-alert
        v-if="cyclesFailed"
        :title="$t('PolicyCyclesLoadFailed')"
        type="error"
        :closable="false"
        show-icon
      />
      <ListTable
        ref="cycleTable"
        :key="credentialId"
        :table-config="tableConfig"
        :header-actions="headerActions"
        :table-metadata-provider="getCycleMetadata"
        activation-refresh="never"
        @loaded="handleCyclesLoaded"
      >
        <template #search-after>
          <div class="cycle-filters">
            <el-date-picker
              v-model="dateRange"
              type="datetimerange"
              :start-placeholder="$t('DateStart')"
              :end-placeholder="$t('DateEnd')"
              :aria-label="$t('DateStart')"
              @change="loadCycles(1)"
            />
            <el-select
              v-model="kindFilter"
              clearable
              :placeholder="$t('PolicyCycleType')"
              :aria-label="$t('PolicyCycleType')"
              @change="loadCycles(1)"
            >
              <el-option
                v-for="(label, value) in cycleKinds"
                :key="value"
                :value="value"
                :label="$t(label)"
              />
            </el-select>
            <el-select
              v-model="statusFilter"
              clearable
              :placeholder="$t('Status')"
              :aria-label="$t('Status')"
              @change="loadCycles(1)"
            >
              <el-option
                v-for="(label, value) in cycleStatuses"
                :key="value"
                :value="value"
                :label="$t(label)"
              />
            </el-select>
          </div>
        </template>
      </ListTable>
    </section>
    <component
      :is="latest ? 'IBox' : 'el-drawer'"
      v-bind="detailContainerProps"
      @update:model-value="drawerVisible = $event"
      @close="stopDetailRefresh"
      @closed="loadCycles()"
    >
      <template v-if="latest" #header>
        <div class="latest-run-heading">
          <h5>{{ $t('CredentialPolicyLatestRun') }}</h5>
          <div class="browser-actions">
            <slot name="actions" :cycle="detail" />
            <el-button :loading="detailLoading" @click="loadLatestCycle()">{{
              $t('Refresh')
            }}</el-button>
          </div>
        </div>
      </template>
      <div class="cycle-detail">
        <div v-if="!latest" class="browser-actions detail-actions">
          <el-button :loading="detailLoading" @click="loadCycle(cycleId)">{{
            $t('Refresh')
          }}</el-button>
        </div>
        <el-alert
          v-if="detailFailed"
          :title="$t('PolicyCycleDetailLoadFailed')"
          type="error"
          :closable="false"
          show-icon
        />
        <el-skeleton v-else-if="detailLoading" :rows="8" animated />
        <el-empty
          v-else-if="latest && !detail"
          :description="$t('PolicyCyclesEmpty')"
          :image-size="64"
        />
        <template v-else-if="detail">
          <section class="cycle-summary record-section" :aria-label="$t('PolicyCycleSummary')">
            <div class="cycle-heading">
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
                <template v-if="detail.rotation_accounts">
                  <p>{{ rotationDirection(detail.rotation_accounts) }}</p>
                  <p>
                    {{ $t('RotationChangeAccount') }}：{{
                      accountLabel(detail.rotation_accounts.change)
                    }}
                  </p>
                </template>
                <p v-else-if="detail.accounts?.length > 1">
                  {{ detail.accounts.map(accountLabel).join(' · ') }}
                </p>
                <p v-else-if="detail.account">{{ accountLabel(detail.account) }}</p>
              </div>
              <details class="cycle-identifier">
                <summary>{{ $t('PolicyCycleID') }}</summary>
                <code>{{ detail.id }}</code>
              </details>
            </div>
          </section>

          <section
            v-if="stages.length"
            class="cycle-progress record-section"
            :aria-label="$t('PolicyCycleStages')"
          >
            <h4 class="record-heading">
              <el-icon><Guide /></el-icon>{{ $t('PolicyCycleStages') }}
              <el-tooltip
                :content="$t('PolicyCycleStagesHelp')"
                :popper-style="{ maxWidth: '360px' }"
              >
                <button
                  type="button"
                  class="section-help"
                  :aria-label="$t('PolicyCycleStagesHelp')"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </button>
              </el-tooltip>
            </h4>
            <div class="progress-content">
              <div
                class="cycle-stages"
                role="region"
                :aria-label="$t('PolicyCycleStages')"
                tabindex="0"
              >
                <button
                  v-for="stage in stages"
                  type="button"
                  :disabled="!stage.event"
                  :aria-pressed="!!stage.event && selectedEventId === stage.event.id"
                  @click="selectEvent(stage.event)"
                  :key="stage.label"
                  :class="[
                    'cycle-stage',
                    {
                      emitted: stage.event,
                      current: stage.current,
                      completed: stage.completed,
                      failed:
                        stage.event?.event.endsWith('.failed') ||
                        stage.statusLabel === 'ApplicationFailureReviewRequired'
                    }
                  ]"
                >
                  <el-icon><component :is="stage.icon" /></el-icon>
                  <span>{{ $t(stage.label) }}</span>
                  <small>{{ $t(stage.statusLabel) }}</small>
                </button>
              </div>
            </div>
          </section>

          <section
            v-if="detail.source_traffic"
            class="standby-observation record-section"
            :aria-label="$t('RotationSourceWaitingEvent')"
          >
            <h4 class="record-heading">
              <el-icon><Timer /></el-icon>
              {{ $t('RotationSourceWaitingEvent') }}
              <el-tooltip
                :content="$t('SourceNoTrafficDaysHelp')"
                :popper-style="{ maxWidth: '360px' }"
              >
                <button
                  type="button"
                  class="section-help"
                  :aria-label="$t('SourceNoTrafficDaysHelp')"
                >
                  <el-icon><QuestionFilled /></el-icon>
                </button>
              </el-tooltip>
              <el-tag :type="detail.source_traffic.ready ? 'success' : 'warning'">
                {{
                  $t(
                    detail.source_traffic.ready
                      ? 'RotationSourceReadyEvent'
                      : 'StandbyObservationInProgress'
                  )
                }}
              </el-tag>
            </h4>
            <div class="observation-content">
              <dl>
                <div>
                  <dt>{{ $t('SourceNoTrafficDays') }}</dt>
                  <dd>
                    {{
                      $t('StandbyNoTrafficDaysValue', {
                        days: detail.source_traffic.no_traffic_days
                      })
                    }}
                  </dd>
                </div>
                <div>
                  <dt>{{ $t('SourceLastSecretAccess') }}</dt>
                  <dd>{{ formatDate(detail.source_traffic.last_secret_access) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('SourceIdleSince') }}</dt>
                  <dd>{{ formatDate(detail.source_traffic.idle_since) }}</dd>
                </div>
                <div>
                  <dt>{{ $t('SourceChangeEligibleAt') }}</dt>
                  <dd>{{ formatDate(detail.source_traffic.eligible_at) }}</dd>
                </div>
              </dl>
            </div>
          </section>
          <div class="event-workspace">
            <section class="policy-timeline record-section" :aria-label="$t('PolicyCycleTimeline')">
              <h4 class="record-heading">
                <el-icon><List /></el-icon>{{ $t('PolicyCycleTimeline') }}
              </h4>
              <div class="timeline-scroll">
                <el-timeline>
                  <el-timeline-item
                    v-for="{
                      event,
                      type,
                      hollow,
                      trail,
                      statusLabel,
                      confirmationEvent
                    } in timelineEvents"
                    :key="event.id"
                    hide-timestamp
                    :class="['event-timeline-item', `trail-${trail}`]"
                    :type="type"
                    :hollow="hollow"
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
                      <span
                        v-if="
                          !event.rotation_accounts && detail.accounts?.length > 1 && event.account
                        "
                      >
                        {{ accountLabel(event.account) }}
                      </span>
                      <span class="event-footer">
                        <span class="event-meta"
                          ><span class="event-progress is-info">{{ $t('PolicyStageEmitted') }}</span
                          ><span
                            v-if="
                              statusLabel !== 'PolicyStageEmitted' &&
                              !(confirmationEvent && event.event === 'rotation.waiting_for_app')
                            "
                            :class="['event-progress', `is-${type}`]"
                            >{{ $t(statusLabel) }}</span
                          ><span>{{
                            $t('RotationEventReceiptCount', {
                              received: event.received_count,
                              total: event.recipient_count
                            })
                          }}</span
                          ><span v-if="confirmationEvent">{{
                            $t('PolicyEventConfirmCount', {
                              confirmed: confirmationEvent.confirmed_count,
                              total: confirmationEvent.recipient_count
                            })
                          }}</span
                          ><span v-if="confirmationEvent?.skipped_count">{{
                            $t('PolicyEventSkipCount', {
                              skipped: confirmationEvent.skipped_count,
                              total: confirmationEvent.recipient_count
                            })
                          }}</span
                          ><span v-if="confirmationEvent?.review_required_count"
                            >{{ $t('ApplicationFailureReviewRequired') }}
                            {{ confirmationEvent.review_required_count }}</span
                          ><span v-if="confirmationEvent?.admin_approved_count"
                            >{{ $t('ApplicationFailureApproved') }}
                            {{ confirmationEvent.admin_approved_count }}</span
                          ></span
                        >
                        <code class="event-code">{{ event.event }}</code>
                      </span>
                    </button>
                  </el-timeline-item>
                </el-timeline>
              </div>
            </section>
            <aside
              class="event-recipients record-section"
              :aria-label="$t('PolicyEventRecipients')"
            >
              <h4 class="record-heading">
                <el-icon><Connection /></el-icon>{{ $t('PolicyEventRecipients') }}
              </h4>
              <div class="recipient-content">
                <template v-if="recipientEvent">
                  <div class="recipient-event">
                    <strong>{{ eventName(recipientEvent) }}</strong>
                    <span>{{ formatDate(recipientEvent.published_at) }}</span>
                    <details :key="recipientEvent.id" class="event-details">
                      <summary>{{ $t('Details') }}</summary>
                      <dl>
                        <div v-if="recipientEvent.revision != null">
                          <dt>{{ $t('AppAuditRevision') }}</dt>
                          <dd>{{ recipientEvent.revision }}</dd>
                        </div>
                        <div v-if="recipientEvent.published_account">
                          <dt>{{ $t('RotationPublishedAccount') }}</dt>
                          <dd>{{ accountLabel(recipientEvent.published_account) }}</dd>
                        </div>
                        <div v-if="recipientEvent.rotation_accounts?.change">
                          <dt>{{ $t('RotationChangeAccount') }}</dt>
                          <dd>{{ accountLabel(recipientEvent.rotation_accounts.change) }}</dd>
                        </div>
                        <div v-if="recipientEvent.source_traffic">
                          <dt>{{ $t('SourceNoTrafficDays') }}</dt>
                          <dd>
                            {{
                              $t('StandbyNoTrafficDaysValue', {
                                days: recipientEvent.source_traffic.no_traffic_days
                              })
                            }}
                          </dd>
                        </div>
                        <div v-if="recipientEvent.source_traffic">
                          <dt>{{ $t('SourceChangeEligibleAt') }}</dt>
                          <dd>{{ formatDate(recipientEvent.source_traffic.eligible_at) }}</dd>
                        </div>
                      </dl>
                      <p class="recipient-help">
                        {{
                          $t(
                            recipientEvent.requires_confirmation
                              ? 'PolicyEventConfirmationHelp'
                              : 'PolicyEventReceiptHelp'
                          )
                        }}
                      </p>
                    </details>
                  </div>
                  <div
                    class="recipient-filters"
                    role="group"
                    :aria-label="$t('RotationReceiptFilter')"
                  >
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
                    v-if="!recipientEvent.recipients.length"
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
                          client.type === 'agent' ? $t('PAMAgent') : 'SDK'
                        }}</el-tag>
                      </div>
                      <p>{{ client.application.name }} · {{ stateLabel(client) }}</p>
                      <div class="recipient-status-block">
                        <div class="recipient-status">
                          <span>{{ $t('PolicyEventReceipt') }}</span
                          ><el-tag :type="receiptType(client)">{{
                            $t(statusLabels[receiptStatus(client)])
                          }}</el-tag>
                        </div>
                        <small v-if="client.received_at">{{
                          formatDate(client.received_at)
                        }}</small>
                        <small v-else-if="!client.supports_receipts">{{
                          $t('RotationEventUpgradeClient')
                        }}</small>
                      </div>
                      <div
                        v-if="recipientEvent.requires_confirmation"
                        class="recipient-status-block"
                      >
                        <div class="recipient-status">
                          <span>{{ $t('PolicyEventApplicationConfirmation') }}</span
                          ><el-tag
                            :type="
                              client.confirmed_at
                                ? 'success'
                                : client.skipped_at
                                  ? 'info'
                                  : client.status === 'failed'
                                    ? 'danger'
                                    : 'warning'
                            "
                            >{{
                              $t(
                                client.confirmed_at
                                  ? 'PolicyEventApplied'
                                  : client.skipped_at
                                    ? 'Skipped'
                                    : client.status === 'failed'
                                      ? applicationFailureLabel(client.error_code)
                                      : 'PolicyEventNotApplied'
                              )
                            }}</el-tag
                          >
                        </div>
                        <small v-if="client.confirmed_at || client.skipped_at">{{
                          formatDate(client.confirmed_at || client.skipped_at)
                        }}</small>
                      </div>
                      <div v-if="client.failure_review?.id" class="failure-review">
                        <el-tag :type="client.failure_review.review_required ? 'danger' : 'info'">
                          {{
                            $t(
                              client.failure_review.review_required
                                ? 'ApplicationFailureReviewRequired'
                                : 'ApplicationFailureApproved'
                            )
                          }}
                        </el-tag>
                        <small
                          >{{ formatDate(client.failure_review.failed_at) }} ·
                          {{ $t(applicationFailureLabel(client.failure_review.error_code)) }}</small
                        >
                        <code v-if="client.failure_review.error_code">{{
                          client.failure_review.error_code
                        }}</code>
                        <el-button
                          v-if="
                            client.failure_review.review_required &&
                            client.failure_review.can_review &&
                            $hasPerm('accounts.change_applicationcredential')
                          "
                          size="small"
                          type="warning"
                          :loading="reviewingClientId === client.id"
                          @click="reviewFailure(client)"
                          >{{ $t('ApplicationFailureContinue') }}</el-button
                        >
                        <template v-else-if="client.failure_review.reviewed_at">
                          <small
                            >{{ client.failure_review.reviewed_by }} ·
                            {{ formatDate(client.failure_review.reviewed_at) }}</small
                          >
                          <small>{{ client.failure_review.reason }}</small>
                        </template>
                      </div>
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
              </div>
            </aside>
          </div>
        </template>
      </div>
    </component>
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'
import IBox from '@/components/Common/IBox/index.vue'
import {
  ActionsFormatter,
  DateFormatter,
  DetailFormatter,
  TagChoicesFormatter
} from '@/components/Table/TableFormatters'
import request from '@/utils/request'
import {
  credentialUrl,
  getCredentialEventCycles,
  reviewApplicationFailure
} from '@/api/applicationCredential'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { subscribedAccountLabel } from '../components/subscriptionAccount'
import { applicationFailureLabel } from '../components/applicationFailure'
import {
  statusLabels,
  receiptStatus,
  rotationEventTitle,
  buildCycleEventTimeline
} from './rotationEventTimeline'

const cycleKinds = {
  rotation: 'PolicyRotationCycle',
  subscription: 'PolicySubscriptionCycle',
  subscription_refresh: 'PolicySubscriptionRefreshCycle',
  update: 'PolicyCredentialUpdate',
  event: 'PolicyStandaloneEvent'
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
  ['PolicyStageCredentialPublished', ['credential.secret.updated']]
]
const rotationStages = [
  ['RotationVerificationStartedEvent', ['rotation.verify.started', 'rotation.verify.skipped']],
  ['PolicyStageAccountPublished', ['credential.switch.published']],
  ['PolicyStageWaitingForApplication', ['rotation.waiting_for_app']],
  ['RotationSourceWaitingEvent', ['rotation.source.waiting']],
  ['RotationSourceReadyEvent', ['rotation.source.ready']],
  ['PolicyStageChangeStarted', ['credential.change.started']],
  ['PolicyStageChangeResult', ['credential.change.completed', 'credential.change.failed']],
  ['PolicyStageRotationResult', ['rotation.completed', 'rotation.failed']]
]

export default {
  name: 'CredentialEventBrowser',
  components: { ListTable, IBox },
  props: {
    credentialId: { type: String, default: '' },
    initialCycleId: { type: String, default: '' },
    subscription: Boolean,
    latest: Boolean,
    initialClient: { type: Object, default: null }
  },
  emits: ['cycle-opened'],
  data() {
    return {
      cycleKinds,
      cycleStatuses,
      kindFilter: '',
      statusFilter: '',
      dateRange: null,
      drawerVisible: false,
      currentCycle: null,
      retentionDays: null,
      cycleId: '',
      reviewingClientId: '',
      detail: null,
      selectedEventId: '',
      detailLoading: false,
      cyclesFailed: false,
      detailFailed: false,
      detailRequest: 0,
      latestRequest: 0,
      search: this.initialClient?.instance_id || '',
      receiptFilter: '',
      recipientPage: 1,
      observationTimer: null,
      disposed: false,
      initialCycleOpened: false,
      statusLabels
    }
  },
  computed: {
    detailContainerProps() {
      return this.latest
        ? { title: this.$t('CredentialPolicyLatestRun') }
        : {
            modelValue: this.drawerVisible,
            title: this.$t('PolicyCycleDetail'),
            appendToBody: true,
            destroyOnClose: true,
            size: 'min(1200px, 92vw)',
            class: 'credential-cycle-drawer'
          }
    },
    headerActions() {
      return {
        hasLeftActions: false,
        hasSearch: false,
        hasImport: false,
        hasExport: false,
        handleRefreshClick: () => this.loadCycles()
      }
    },
    tableConfig() {
      return {
        name: 'CredentialPolicyCycles',
        url: this.credentialId ? `${credentialUrl}${this.credentialId}/event-cycles/` : '',
        request: this.requestCycles,
        permissions: { view: 'accounts.view_applicationcredential' },
        hasSelection: false,
        hasOperation: false,
        tableActions: { hasEdit: false, hasDelete: false },
        tableAttrs: { emptyText: this.$t('PolicyCyclesNoMatch') },
        columns: [
          {
            prop: 'date_started',
            label: this.$t('PolicyCycleStartedAt'),
            width: '170px',
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => this.formatDate(row.date_started),
              onClick: ({ row }) => this.openCycle(row.id)
            }
          },
          {
            prop: 'kind',
            label: this.$t('PolicyCycleType'),
            width: '140px',
            formatter: (row) => this.cycleKind(row)
          },
          {
            prop: 'accounts',
            label: this.$t('Accounts'),
            minWidth: '180px',
            formatter: (row) => this.cycleAccounts(row)
          },
          {
            prop: 'status',
            label: this.$t('Status'),
            width: '110px',
            formatter: TagChoicesFormatter,
            formatterArgs: {
              getTagLabel: ({ row }) => this.cycleStatus(row.status),
              getTagType: ({ row }) => this.cycleStatusType(row.status)
            }
          },
          {
            prop: 'latest_event',
            label: this.$t('PolicyCycleLatestStage'),
            minWidth: '160px',
            formatter: (row) => this.eventName({ event: row.latest_event })
          },
          {
            prop: 'date_last_event',
            label: this.$t('PolicyCycleLastUpdated'),
            width: '170px',
            formatter: DateFormatter
          },
          {
            prop: 'actions',
            label: this.$t('Actions'),
            align: 'center',
            width: '75px',
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  name: 'detail',
                  title: this.$t('Details'),
                  icon: 'fa-eye',
                  callback: ({ row }) => this.openCycle(row.id)
                }
              ]
            }
          }
        ]
      }
    },
    selectedEvent() {
      return this.detail?.events.find((event) => event.id === this.selectedEventId)
    },
    recipientEvent() {
      return this.confirmationEventFor(this.selectedEvent) || this.selectedEvent
    },
    timelineEvents() {
      return buildCycleEventTimeline(this.detail, this.stages).map((node) => ({
        ...node,
        confirmationEvent: this.confirmationEventFor(node.event)
      }))
    },
    stages() {
      const definitions =
        this.detail?.kind === 'rotation'
          ? rotationStages
          : this.detail?.kind === 'subscription'
            ? subscriptionStages
            : this.detail?.kind === 'subscription_refresh'
              ? [['CredentialRefreshRequestedEvent', ['credential.refresh.requested']]]
              : []
      const phase = this.detail?.rotation_status?.rotation_phase
      return definitions.map(([label, codes]) => {
        const event = this.detail.events.findLast((event) => codes.includes(event.event))
        const skipped = !event && ['cancelled', 'failed'].includes(this.detail.status)
        let current = false
        let completed = false
        let statusLabel = event
          ? 'PolicyStageEmitted'
          : skipped
            ? 'PolicyStageSkipped'
            : 'PolicyStageNotEmitted'
        let icon = event ? 'Message' : 'Clock'
        if (label === 'PolicyStageWaitingForApplication' && event) {
          const publication = this.detail.events.findLast(
            (item) =>
              item.event === 'credential.switch.published' && item.revision === event.revision
          )
          completed = phase
            ? [
                'waiting_source',
                'ready_for_change',
                'changing_secret',
                'change_failed',
                'recovery_required'
              ].includes(phase)
            : this.detail.status === 'success' ||
              !!(
                publication &&
                publication.confirmed_count + (publication.skipped_count || 0) ===
                  publication.recipient_count
              )
          if (publication?.review_required_count) completed = false
          current =
            !completed &&
            (phase
              ? ['waiting_switch', 'waiting_revert'].includes(phase)
              : this.detail.status === 'running')
          statusLabel = publication?.review_required_count
            ? 'ApplicationFailureReviewRequired'
            : publication?.admin_approved_count
              ? 'ApplicationFailureApproved'
              : completed
                ? publication?.skipped_count
                  ? publication.confirmed_count
                    ? 'Success'
                    : 'Skipped'
                  : 'PolicyEventApplied'
                : this.detail.status === 'cancelled'
                  ? 'Cancelled'
                  : 'PolicyEventNotApplied'
          icon = publication?.review_required_count ? 'CircleClose' : completed ? 'Check' : 'Clock'
        } else if (label === 'RotationSourceWaitingEvent') {
          completed = !!this.detail.source_traffic?.ready
          current = !!this.detail.source_traffic && !completed && phase === 'waiting_source'
          statusLabel =
            !this.detail.source_traffic && (this.detail.rotation_status || !event)
              ? 'PolicyStageNotStarted'
              : completed
                ? 'StandbyObservationCompleted'
                : this.detail.status === 'running'
                  ? 'Running'
                  : this.detail.status === 'cancelled'
                    ? 'Cancelled'
                    : 'PolicyStageEmitted'
          icon = completed ? 'Check' : 'Clock'
        }
        if (event?.event.endsWith('.failed')) icon = 'CircleClose'
        return {
          label:
            event?.event === 'rotation.verify.skipped'
              ? 'RotationVerificationSkippedEvent'
              : label === 'PolicyStageWaitingForApplication' && phase === 'waiting_revert'
                ? 'WaitingForAccountRevert'
                : label,
          event,
          current,
          completed,
          statusLabel,
          icon,
          skipped
        }
      })
    },
    receiptFilters() {
      const recipients = this.recipientEvent?.recipients || []
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
      if (this.recipientEvent?.requires_confirmation) {
        filters.push(
          {
            value: 'confirmed',
            label: 'PolicyEventApplied',
            count: recipients.filter((client) => client.confirmed_at).length
          },
          {
            value: 'skipped',
            label: 'Skipped',
            count: recipients.filter((client) => client.skipped_at).length
          },
          {
            value: 'review',
            label: 'ApplicationFailureReviewRequired',
            count: recipients.filter((client) => client.failure_review?.review_required).length
          }
        )
      }
      return filters
    },
    filteredRecipients() {
      const search = this.search.trim().toLowerCase()
      return (this.recipientEvent?.recipients || [])
        .filter(
          (client) =>
            (!search ||
              [client.instance_id, client.application.name].some((value) =>
                value.toLowerCase().includes(search)
              )) &&
            (!this.receiptFilter ||
              (this.receiptFilter === 'review'
                ? client.failure_review?.review_required
                : this.receiptFilter === 'skipped'
                  ? client.skipped_at
                  : this.receiptFilter === 'confirmed'
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
        this.stopDetailRefresh()
        this.drawerVisible = false
        this.detail = null
        this.cycleId = ''
        this.currentCycle = null
        this.initialCycleOpened = false
        if (this.latest) this.loadLatestCycle()
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
    this.detailRequest++
    this.latestRequest++
  },
  methods: {
    applicationFailureLabel,
    async reviewFailure(client) {
      let reason
      try {
        const result = await this.$prompt(
          this.$t('ApplicationFailureReviewPrompt'),
          this.$t('ApplicationFailureContinue'),
          {
            inputValidator: (value) => !!value?.trim() && value.trim().length <= 512,
            inputErrorMessage: this.$t('ApplicationFailureReviewReason'),
            type: 'warning'
          }
        )
        reason = result.value.trim()
      } catch {
        return
      }
      this.reviewingClientId = client.id
      try {
        await reviewApplicationFailure(this.credentialId, {
          client_id: client.id,
          failure_id: client.failure_review.id,
          reason
        })
        await this.loadCycle(this.cycleId, { silent: true })
      } finally {
        this.reviewingClientId = ''
      }
    },
    confirmationEventFor(event) {
      if (event?.requires_confirmation) return event
      if (event?.event !== 'rotation.waiting_for_app') return null
      // Progress events share the application results of their own switch
      // revision. Never borrow confirmation from an earlier switch.
      return (
        this.detail?.events.findLast(
          (item) =>
            item.event === 'credential.switch.published' &&
            item.revision === event.revision &&
            item.requires_confirmation
        ) || null
      )
    },
    receiptStatus,
    accountLabel: subscribedAccountLabel,
    cycleAccounts(cycle) {
      if (cycle.rotation_accounts) return this.rotationDirection(cycle.rotation_accounts)
      const accounts = cycle.accounts?.length
        ? cycle.accounts
        : cycle.account
          ? [cycle.account]
          : []
      return accounts.length > 1
        ? this.$t('PolicyCycleAccountCount', { count: accounts.length })
        : accounts.length
          ? this.accountLabel(accounts[0])
          : '—'
    },
    async loadLatestCycle({ silent = false } = {}) {
      clearTimeout(this.observationTimer)
      const request = ++this.latestRequest
      this.detailRequest++
      this.detailLoading = !silent
      this.detailFailed = false
      if (!this.credentialId) {
        this.detailLoading = false
        return
      }
      try {
        const directory = await getCredentialEventCycles(this.credentialId, { limit: 1 })
        if (request !== this.latestRequest) return
        this.currentCycle = directory.current_cycle
        const initial = !this.initialCycleOpened && this.initialCycleId
        const id = initial || directory.current_cycle?.id || directory.results[0]?.id
        if (!id) {
          this.detail = null
          this.cycleId = ''
          this.detailLoading = false
          return
        }
        const unchanged = id === this.cycleId
        if (!unchanged) {
          this.detail = null
          this.selectedEventId = ''
        }
        await this.loadCycle(id, { silent: silent && unchanged })
        if (request === this.latestRequest && initial && !this.detailFailed) {
          this.initialCycleOpened = true
          this.$emit('cycle-opened')
        }
      } catch {
        if (request === this.latestRequest && !silent) this.detailFailed = true
      } finally {
        if (request === this.latestRequest) {
          this.detailLoading = false
          this.scheduleObservationRefresh()
        }
      }
    },
    async getCycleMetadata() {
      return { actions: { GET: {} }, filters: {}, ordering: { fields: [] } }
    },
    async requestCycles(url, config) {
      this.cyclesFailed = false
      try {
        return await request.get(url, { ...config, disableFlashErrorMsg: true })
      } catch (error) {
        if (!config.signal?.aborted) this.cyclesFailed = true
        throw error
      }
    },
    handleCyclesLoaded({ response }) {
      this.currentCycle = response.current_cycle
      this.retentionDays = response.retention_days
      if (this.initialCycleId && !this.initialCycleOpened) {
        this.initialCycleOpened = true
        this.openCycle(this.initialCycleId)
      }
    },
    async loadCycles(reset = false) {
      if (this.latest) return this.loadLatestCycle()
      const table = this.$refs.cycleTable?.dataTable
      if (!table) return
      if (reset) {
        await table.search(
          {
            kind: this.kindFilter || '',
            cycle_status: this.statusFilter || '',
            started_after: this.dateRange?.length ? new Date(this.dateRange[0]).toISOString() : '',
            started_before: this.dateRange?.length ? new Date(this.dateRange[1]).toISOString() : ''
          },
          true
        )
      } else {
        await table.getList()
      }
      if (this.drawerVisible) await this.loadCycle(this.cycleId, { silent: true })
    },
    async openCycle(id) {
      this.detail = null
      this.selectedEventId = ''
      this.drawerVisible = true
      this.$emit('cycle-opened')
      await this.loadCycle(id)
    },
    stopDetailRefresh() {
      clearTimeout(this.observationTimer)
      this.latestRequest++
      this.detailRequest++
      this.detailLoading = false
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
      if (
        this.disposed ||
        (!this.latest && !this.drawerVisible) ||
        (!this.latest &&
          !(
            ['preparing', 'running'].includes(this.detail?.status) ||
            (this.detail?.status === 'failed' && this.detail?.id === this.currentCycle?.id)
          ))
      ) {
        return
      }
      this.observationTimer = setTimeout(
        () =>
          this.latest
            ? this.loadLatestCycle({ silent: true })
            : this.loadCycle(this.cycleId, { silent: true }),
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
    cycleStatus(status) {
      return this.$t(cycleStatuses[status] || status)
    },
    cycleStatusType(status) {
      return (
        { success: 'success', failed: 'danger', running: 'warning', preparing: 'warning' }[
          status
        ] || 'info'
      )
    },
    eventName(event) {
      const { action, template, params } = rotationEventTitle(event)
      const label = this.$t(action)
      return template ? this.$t(template, { action: label, ...params }) : label
    },
    rotationDirection(accounts) {
      return this.$t('RotationEventWithDirection', {
        action: this.$t('RotationSwitchDirection'),
        source: this.accountLabel(accounts.source),
        target: this.accountLabel(accounts.target)
      })
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
.event-browser,
.cycle-detail {
  container-type: inline-size;
  color: var(--el-text-color-primary);
}
.event-browser {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cycle-heading,
.event-option-heading,
.recipient-heading,
.recipient-status {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.browser-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.recipient-help {
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.7;
  margin: 0;
}
.retention-help {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.retention-help a {
  color: var(--el-color-primary);
}
.cycle-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}
.cycle-filters :deep(.el-select) {
  width: 150px;
}
.cycle-filters :deep(.el-select__wrapper) {
  min-height: 30px;
  font-size: 13px;
}
.cycle-filters :deep(.el-date-editor) {
  flex: 0 1 390px;
  min-width: 220px;
  // 全局日期范围样式固定为 32px，这里与同组筛选控件统一。
  height: 30px !important;
  min-height: 30px !important;
  max-height: 30px !important;
}
.cycle-filters :deep(.el-range-input) {
  font-size: 13px;
}
.cycle-filters :deep(.el-range-input),
.cycle-filters :deep(.el-range-separator),
.cycle-filters :deep(.el-range__icon),
.cycle-filters :deep(.el-range__close-icon) {
  height: 28px;
  line-height: 28px;
}
.cycle-detail {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
.detail-actions {
  justify-content: flex-end;
}
.latest-run-heading {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 8px 16px;
}
.latest-run-heading h5 {
  margin: 0;
  font-size: 13px;
  font-weight: 500;
}
.record-section {
  min-width: 0;
  overflow-wrap: anywhere;
}
.record-heading {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 12px;
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 500;
}
.record-heading > .el-icon {
  color: var(--el-text-color-secondary);
  font-size: 15px;
}
.cycle-summary {
  padding: 16px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
}
.cycle-heading {
  align-items: flex-start;
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
.cycle-identifier {
  display: grid;
  gap: 6px;
  max-width: 40%;
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}
.cycle-identifier summary,
.event-details summary {
  cursor: pointer;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.cycle-identifier code {
  display: block;
  margin-top: 6px;
  font-size: 11px;
  overflow-wrap: anywhere;
}
.cycle-stages {
  display: flex;
  flex-wrap: nowrap;
  gap: 24px;
  margin: 0;
  padding: 2px 0 10px;
  overflow-x: auto;
  scrollbar-width: thin;
  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 2px;
  }
}
.cycle-stage {
  position: relative;
  flex: 1 0 auto;
  padding: 10px;
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  color: var(--el-text-color-secondary);
  display: grid;
  grid-template-columns: 16px max-content;
  gap: 5px 8px;
  align-items: center;
  font: inherit;
  font-size: 12px;
  text-align: left;
  background: transparent;
  white-space: nowrap;
  cursor: pointer;
  &:disabled {
    cursor: default;
  }
  &:not(:disabled):hover,
  &[aria-pressed='true'] {
    border-color: var(--el-color-primary-light-5);
    background: var(--el-color-primary-light-9);
  }
  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: -2px;
  }
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -16px;
    top: 50%;
    width: 6px;
    height: 6px;
    border-top: 1px solid var(--el-text-color-placeholder);
    border-right: 1px solid var(--el-text-color-placeholder);
    transform: translateY(-50%) rotate(45deg);
  }
}
.cycle-stage small {
  grid-column: 2;
}
.cycle-stage.emitted {
  border-style: solid;
  border-color: var(--el-border-color);
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
}
.cycle-stage.emitted:not(.failed):not(.current):not(.completed) > .el-icon {
  color: var(--el-color-primary);
}
.cycle-stage.failed {
  border-color: var(--el-color-danger-light-5);
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
}
.cycle-stage.current {
  border-style: solid;
  border-color: var(--el-color-primary-light-5);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
.cycle-stage.completed > .el-icon {
  color: var(--el-color-success);
}
.standby-observation dl {
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 200px), 1fr));
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
.event-workspace {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 20px;
  align-items: start;
  min-height: 420px;
}
.policy-timeline {
  min-width: 0;
  padding-right: 20px;
}
.timeline-scroll {
  max-height: 680px;
  overflow-y: auto;
  padding: 8px 10px 0 2px;
}
.timeline-scroll :deep(.el-timeline) {
  padding-left: 6px;
}
.event-timeline-item :deep(.el-timeline-item__tail) {
  border-left-style: dashed;
  border-left-color: var(--el-border-color);
}
.event-timeline-item.trail-primary :deep(.el-timeline-item__tail) {
  border-left-style: solid;
  border-left-color: var(--el-color-primary);
}
.event-timeline-item.trail-danger :deep(.el-timeline-item__tail) {
  border-left-style: solid;
  border-left-color: var(--el-color-danger);
}
.event-timeline-item :deep(.el-timeline-item__node--primary.is-hollow) {
  box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
}
.event-timeline-item :deep(.el-timeline-item__node.is-hollow) {
  background-color: var(--el-bg-color);
}
.event-timeline-item :deep(.el-timeline-item__node--info) {
  background-color: var(--el-text-color-placeholder);
  border-color: var(--el-text-color-placeholder);
}
.event-timeline-item :deep(.el-timeline-item__node--info.is-hollow) {
  background-color: var(--el-bg-color);
}
.event-progress {
  font-weight: 500;
}
.event-progress.is-primary {
  color: var(--el-color-primary);
}
.event-progress.is-success {
  color: var(--el-color-success);
}
.event-progress.is-warning {
  color: var(--el-color-warning-dark-2);
}
.event-progress.is-danger {
  color: var(--el-color-danger);
}
.event-progress.is-info {
  color: var(--el-text-color-secondary);
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
.event-footer {
  display: flex;
  align-items: flex-end;
  flex-wrap: wrap;
  gap: 8px 16px;
}
.event-code {
  margin-left: auto;
  max-width: 100%;
  color: var(--el-text-color-secondary);
  font-size: 11px;
  text-align: right;
  overflow-wrap: anywhere;
}
.event-meta {
  display: flex;
  gap: 6px 14px;
  flex-wrap: wrap;
}
.event-recipients {
  min-width: 0;
  padding-left: 20px;
  border-left: 1px solid var(--el-border-color-lighter);
}
.recipient-event {
  display: grid;
  gap: 8px;
  margin-bottom: 12px;
}
.event-details dl {
  display: grid;
  gap: 10px;
  margin: 12px 0;
  font-size: 12px;
}
.event-details dt {
  color: var(--el-text-color-secondary);
  margin-bottom: 4px;
}
.event-details dd {
  margin: 0;
}
.section-help {
  display: inline-flex;
  border: 0;
  padding: 2px;
  background: transparent;
  color: var(--el-text-color-secondary);
  font-size: 14px;
  cursor: help;
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
  flex-wrap: wrap;
  gap: 8px;
  font-size: 12px;
}
.failure-review {
  display: grid;
  justify-items: start;
  gap: 8px;
  margin-top: 12px;
}
.recipient-status-block {
  margin-top: 12px;
}
.recipient-status-block small:last-child {
  margin-bottom: 0;
}
.event-option:focus-visible,
.recipient-filters button:focus-visible,
.section-help:focus-visible,
.event-details summary:focus-visible,
.cycle-identifier summary:focus-visible {
  outline: 2px solid var(--el-color-primary);
  outline-offset: 2px;
}
@container (max-width: 500px) {
  .cycle-heading {
    flex-wrap: wrap;
  }
  .cycle-identifier {
    max-width: 100%;
  }
}
</style>

<style lang="scss">
.credential-cycle-drawer .el-drawer__header {
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.credential-cycle-drawer .el-drawer__body {
  padding: 20px;
}
</style>
