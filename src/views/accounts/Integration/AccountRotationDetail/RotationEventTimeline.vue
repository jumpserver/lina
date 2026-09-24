<template>
  <IBox :title="title" class="event-timeline" :class="{ 'event-timeline--overview': overview }">
    <template #header>
      <div class="timeline-title">
        <h5>{{ title }}</h5>
        <el-button :loading="loading" @click="load">{{ $t('Refresh') }}</el-button>
      </div>
    </template>
    <el-alert
      v-if="failed"
      :title="$t('RotationEventLoadFailed')"
      type="error"
      :closable="false"
      show-icon
    />
    <el-skeleton v-else-if="loading" :rows="3" animated />
    <el-empty
      v-else-if="!events.length"
      :description="$t(subscription ? 'CredentialEventEmpty' : 'RotationEventEmpty')"
      :image-size="64"
    />
    <template v-else>
      <div v-if="overview" class="round-meta">
        <span>{{ $t('EventRotationRound') }} {{ result.rotation_id?.slice(-8) }}</span>
        <span>{{ $t('RotationEventPublishedAt') }} {{ formatDate(events[0].published_at) }}</span>
        <span
          >{{ $t('EventLatestPublished') }}：<strong>{{ eventName(events.at(-1)) }}</strong></span
        >
      </div>
      <div class="timeline-heading">
        <span>{{
          $t('RotationEventOverview', { instances: timeline.lanes.length, events: events.length })
        }}</span>
        <div class="timeline-legend">
          <span
            ><i class="legend-dot legend-dot--received" />{{ $t('RotationEventReceived') }}</span
          >
          <span><i class="legend-dot" />{{ $t('RotationEventUnacknowledged') }}</span>
        </div>
      </div>
      <template v-if="overview && timeline.lanes.length">
        <div class="receipt-filters" role="group" :aria-label="$t('RotationReceiptFilter')">
          <button
            v-for="item in receiptFilters"
            :key="item.value"
            type="button"
            :class="`receipt-filter--${item.value || 'all'}`"
            :aria-pressed="receiptFilter === item.value"
            @click="receiptFilter = item.value"
          >
            {{ $t(item.label) }} <strong>{{ item.count }}</strong>
          </button>
        </div>
        <div class="timeline-filters">
          <el-input
            v-model="search"
            :placeholder="$t('EventClientSearch')"
            :aria-label="$t('EventClientSearch')"
            clearable
          />
          <el-select
            v-model="clientType"
            :placeholder="$t('EventAllTypes')"
            :aria-label="$t('EventClientType')"
          >
            <el-option :label="$t('EventAllTypes')" value="" />
            <el-option label="SDK" value="sdk" /><el-option label="Agent" value="agent" />
          </el-select>
          <span>{{ $t('RotationReceiptPriority') }}</span>
        </div>
      </template>
      <p v-if="!timeline.lanes.length" class="timeline-notice">
        {{ $t(subscription ? 'CredentialEventNoInstances' : 'RotationEventNoInstances') }}
      </p>
      <el-empty
        v-else-if="!filteredLanes.length"
        :description="$t('EventNoMatchingClients')"
        :image-size="48"
      />
      <div
        v-show="!timeline.lanes.length || filteredLanes.length"
        ref="timelineScroll"
        class="timeline-scroll"
        role="region"
        :aria-label="title"
        tabindex="0"
      >
        <div class="timeline-grid" :style="{ '--event-count': events.length }">
          <div class="timeline-axis">
            <span class="axis-label">{{ $t('ClientInstances') }}</span>
            <div v-for="event in events" :key="event.id" class="axis-event">
              <strong>{{ eventName(event) }}</strong>
              <span>{{ formatDate(event.published_at) }}</span>
              <span v-if="event.revision">{{ $t('AppAuditRevision') }} {{ event.revision }}</span>
            </div>
          </div>
          <div v-for="client in lanes" :key="client.id" class="client-lane">
            <div class="client-identity">
              <button
                v-if="overview"
                type="button"
                class="client-history-link"
                :aria-label="`${client.instance_id} · ${$t('EventHistory')}`"
                @click="$emit('view-history', client)"
              >
                {{ client.instance_id }} <el-icon><ArrowRight /></el-icon>
              </button>
              <strong v-else>{{ client.instance_id }}</strong>
              <span
                >{{ client.type === 'agent' ? 'Agent' : 'SDK' }} · {{ clientState(client) }}</span
              >
              <span>{{ client.application.name }} · {{ client.configuration.name }}</span>
              <span>{{
                $t('RotationEventReceiptCount', {
                  received: client.receivedCount,
                  total: client.targetCount
                })
              }}</span>
              <span
                v-if="!client.supports_receipts && !client.receivedCount"
                class="client-notice"
                >{{ $t('RotationEventUpgradeClient') }}</span
              >
            </div>
            <div class="client-track">
              <button
                v-for="node in client.nodes"
                :key="node.event.id"
                type="button"
                class="event-node"
                :class="`event-node--${node.status}`"
                :aria-label="`${client.instance_id} · ${eventName(node.event)} · ${statusLabel(node.status)}`"
                :aria-pressed="
                  selected?.client.id === client.id && selected?.node.event.id === node.event.id
                "
                @click="selection = { clientId: client.id, eventId: node.event.id }"
              >
                <span class="node-mark" aria-hidden="true"
                  ><el-icon><component :is="nodeIcon(node.status)" /></el-icon
                ></span>
                <span class="node-label">{{ statusLabel(node.status) }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      <el-pagination
        v-if="filteredLanes.length > pageSize"
        v-model:current-page="page"
        class="timeline-pagination"
        size="small"
        layout="prev, pager, next"
        :pager-count="5"
        :page-size="pageSize"
        :total="filteredLanes.length"
      />
      <div v-if="selected" class="receipt-detail" aria-live="polite">
        <strong>{{ selected.client.instance_id }} · {{ eventName(selected.node.event) }}</strong>
        <div class="receipt-detail__meta">
          <span
            >{{ $t('RotationEventPublishedAt') }}
            {{ formatDate(selected.node.event.published_at) }}</span
          >
          <span v-if="selected.node.receipt?.received_at"
            >{{ $t('RotationEventReceivedAt') }}
            {{ formatDate(selected.node.receipt.received_at) }}</span
          >
          <span v-else>{{ statusLabel(selected.node.status) }}</span>
        </div>
        <span v-if="selected.node.status === 'not_targeted'" class="receipt-detail__hint">{{
          $t('RotationEventNotTargetedHelp')
        }}</span>
      </div>
    </template>
    <p class="timeline-help">{{ $t('RotationEventTimelineHelp') }}</p>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import { getCredentialRotationEvents } from '@/api/applicationCredential'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import { buildEventLanes, eventLabels, statusLabels } from './rotationEventTimeline'

export default {
  name: 'RotationEventTimeline',
  components: { IBox },
  props: {
    credentialId: { type: String, default: '' },
    rotationId: { type: String, default: '' },
    subscription: { type: Boolean, default: false },
    overview: { type: Boolean, default: false }
  },
  emits: ['view-history'],
  data() {
    return {
      result: null,
      loading: false,
      failed: false,
      requestNumber: 0,
      selection: null,
      page: 1,
      search: '',
      clientType: '',
      receiptFilter: ''
    }
  },
  computed: {
    title() {
      if (this.overview) {
        return this.$t(
          this.result?.rotation_id && this.result.status !== 'running'
            ? 'LatestRotationReceipts'
            : 'CurrentRotationReceipts'
        )
      }
      return this.$t(this.subscription ? 'CredentialEventReception' : 'RotationEventTimeline')
    },
    pageSize() {
      return this.overview ? 5 : 20
    },
    timeline() {
      return buildEventLanes(this.result)
    },
    events() {
      return this.timeline.events
    },
    receiptFilters() {
      const items = [
        { value: '', label: 'RotationReceiptAllClients', count: this.timeline.lanes.length },
        { value: 'received', label: 'RotationReceiptComplete', count: 0 },
        { value: 'pending', label: 'RotationReceiptPending', count: 0 },
        { value: 'failed', label: 'RotationEventPublishFailed', count: 0 },
        { value: 'not_targeted', label: 'RotationReceiptNotTargeted', count: 0 }
      ]
      for (const client of this.timeline.lanes) {
        items.find((item) => item.value === client.receiptState).count++
      }
      return items.filter((item) => item.value !== 'not_targeted' || item.count)
    },
    filteredLanes() {
      if (!this.overview) return this.timeline.lanes
      const search = this.search.trim().toLowerCase()
      const priority = { failed: 0, pending: 1, received: 2, not_targeted: 3 }
      return this.timeline.lanes
        .filter(
          (client) =>
            (!this.clientType || client.type === this.clientType) &&
            (!this.receiptFilter || client.receiptState === this.receiptFilter) &&
            (!search ||
              [client.instance_id, client.application.name, client.configuration.name].some(
                (value) => value.toLowerCase().includes(search)
              ))
        )
        .sort((a, b) => priority[a.receiptState] - priority[b.receiptState])
    },
    lanes() {
      return this.filteredLanes.slice((this.page - 1) * this.pageSize, this.page * this.pageSize)
    },
    selected() {
      const client = this.lanes.find((client) => client.id === this.selection?.clientId)
      const node = client?.nodes.find((node) => node.event.id === this.selection?.eventId)
      return node ? { client, node } : null
    }
  },
  watch: {
    credentialId: { immediate: true, handler: 'load' },
    rotationId: 'load',
    search: 'resetPage',
    clientType: 'resetPage',
    receiptFilter: 'resetPage',
    page() {
      this.selection = null
      this.$nextTick(() => this.$refs.timelineScroll?.scrollTo({ top: 0 }))
    }
  },
  beforeUnmount() {
    this.requestNumber += 1
  },
  methods: {
    resetPage() {
      this.page = 1
      this.selection = null
      this.$nextTick(() => this.$refs.timelineScroll?.scrollTo({ top: 0 }))
    },
    async load() {
      const requestNumber = ++this.requestNumber
      this.failed = false
      this.loading = false
      if (!this.credentialId) {
        this.result = null
        return
      }
      this.loading = true
      try {
        const result = await getCredentialRotationEvents(
          this.credentialId,
          this.rotationId ? { rotation_id: this.rotationId } : {}
        )
        if (requestNumber !== this.requestNumber) return
        if (result.rotation_id !== this.result?.rotation_id) this.resetPage()
        this.result = result
        this.page = Math.min(
          this.page,
          Math.max(1, Math.ceil(this.filteredLanes.length / this.pageSize))
        )
        if (!this.selected) {
          const client = this.lanes[0]
          const node =
            client?.nodes.find((node) =>
              ['failed', 'unacknowledged', 'publishing'].includes(node.status)
            ) || client?.nodes.at(-1)
          this.selection = node ? { clientId: client.id, eventId: node.event.id } : null
        }
      } catch {
        if (requestNumber === this.requestNumber) this.failed = true
      } finally {
        if (requestNumber === this.requestNumber) this.loading = false
      }
    },
    eventName(event) {
      return eventLabels[event.event] ? this.$t(eventLabels[event.event]) : event.event
    },
    statusLabel(status) {
      return this.$t(statusLabels[status])
    },
    nodeIcon(status) {
      return { received: 'Check', failed: 'Close', publishing: 'Clock' }[status] || 'Minus'
    },
    clientState(client) {
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
.event-timeline {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.event-timeline--overview {
  height: auto;
  margin-bottom: 20px;
  .timeline-scroll {
    flex: none;
    max-height: 360px;
  }
}
.timeline-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  h5 {
    margin: 0;
    font-size: 13px;
    font-weight: 500;
  }
}
.round-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 20px;
  margin-bottom: 12px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.receipt-filters {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
  button {
    padding: 6px 12px;
    border: 1px solid var(--color-border);
    border-radius: 4px;
    background: var(--el-bg-color);
    color: var(--el-text-color-regular);
    font: inherit;
    font-size: 12px;
    cursor: pointer;
    strong {
      margin-left: 8px;
      font-variant-numeric: tabular-nums;
    }
    &:hover {
      background: var(--el-fill-color-light);
    }
    &[aria-pressed='true'] {
      border-color: var(--color-primary);
      background: var(--el-color-primary-light-9);
    }
    &:focus-visible {
      outline: 2px solid var(--color-primary);
      outline-offset: 2px;
    }
  }
  .receipt-filter--failed strong {
    color: var(--el-color-danger-dark-2);
  }
}
.timeline-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  .el-input {
    flex: 1;
    min-width: 200px;
    max-width: 360px;
  }
  .el-select {
    width: 140px;
  }
  > span {
    font-size: 12px;
    color: var(--el-text-color-regular);
  }
}
.client-history-link {
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--el-text-color-primary);
  text-align: left;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
  }
}
.event-timeline :deep(.el-card__header) {
  flex-shrink: 0;
}
.event-timeline :deep(.el-card__body) {
  flex: 1;
  min-height: 0;
  overflow: hidden;
}
.event-timeline :deep(.el-card__body > :not(.timeline-scroll)) {
  flex-shrink: 0;
}
.timeline-pagination {
  justify-content: flex-end;
  padding-top: 12px;
}
.timeline-heading,
.timeline-legend,
.timeline-legend > span {
  display: flex;
  align-items: center;
  gap: 8px;
}
.timeline-heading {
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.timeline-legend {
  gap: 18px;
}
.legend-dot {
  width: 9px;
  height: 9px;
  border: 1px solid var(--el-text-color-secondary);
  border-radius: 50%;
}
.legend-dot--received {
  background: var(--color-primary);
  border-color: transparent;
}
.timeline-notice,
.timeline-help {
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.6;
}
.timeline-help {
  margin: 16px 0 0;
}
.timeline-scroll {
  flex: 1;
  min-height: 0;
  overflow: auto;
  padding: 4px 0;
  scrollbar-width: thin;
  scrollbar-color: var(--color-border) transparent;
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}
.timeline-grid {
  min-width: max(100%, calc(220px + var(--event-count) * 150px));
}
.timeline-axis,
.client-lane {
  display: grid;
  grid-template-columns: 220px 1fr;
}
.timeline-axis {
  position: sticky;
  top: 0;
  z-index: 2;
  background: var(--el-bg-color);
  grid-template-columns: 220px repeat(var(--event-count), minmax(150px, 1fr));
  align-items: end;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--color-border);
}
.axis-label {
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.axis-event {
  display: grid;
  gap: 5px;
  padding: 0 8px;
  text-align: center;
  overflow-wrap: anywhere;
  strong {
    font-size: 13px;
    font-weight: 600;
    color: var(--color-text-primary);
  }
  span {
    font-size: 12px;
    color: var(--el-text-color-regular);
    font-variant-numeric: tabular-nums;
  }
}
.client-lane {
  align-items: center;
  padding: 18px 0;
  border-bottom: 1px solid var(--color-border);
}
.client-identity {
  display: grid;
  gap: 4px;
  padding-right: 16px;
  overflow-wrap: anywhere;
  strong {
    color: var(--color-text-primary);
    font-size: 13px;
    font-weight: 600;
  }
  span {
    color: var(--el-text-color-regular);
    font-size: 12px;
  }
  .client-notice {
    color: var(--el-color-warning-dark-2);
  }
}
.client-track {
  display: grid;
  grid-template-columns: repeat(var(--event-count), minmax(150px, 1fr));
  position: relative;
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: calc(50% / var(--event-count));
    right: calc(50% / var(--event-count));
    height: 1px;
    background: var(--color-border);
  }
}
.event-node {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 6px 8px;
  border: 0;
  border-radius: 4px;
  background: transparent;
  font: inherit;
  cursor: pointer;
  color: var(--el-text-color-regular);
  &:hover {
    background: var(--el-fill-color-light);
  }
  &:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: -2px;
  }
  &[aria-pressed='true'] .node-mark {
    outline: 2px solid var(--color-primary);
    outline-offset: 3px;
  }
}
.node-mark {
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 1px solid var(--el-border-color-darker);
  border-radius: 50%;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
}
.node-label {
  font-size: 12px;
}
.event-node--received .node-mark {
  background: var(--color-primary);
  border-color: transparent;
  color: var(--el-color-white);
}
.event-node--failed .node-mark {
  color: var(--color-danger);
  border-color: var(--color-danger);
}
.event-node--not_targeted .node-mark {
  border-style: dashed;
}
.receipt-detail {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  strong {
    display: block;
    color: var(--color-text-primary);
    font-weight: 600;
  }
}
.receipt-detail__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px 18px;
  margin-top: 6px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.receipt-detail__hint {
  display: block;
  margin-top: 6px;
  color: var(--el-text-color-regular);
  font-size: 12px;
}
@media (max-width: 640px) {
  .timeline-grid {
    min-width: max(100%, calc(var(--event-count) * 140px));
  }
  .timeline-axis {
    grid-template-columns: repeat(var(--event-count), minmax(140px, 1fr));
  }
  .axis-label {
    display: none;
  }
  .client-lane {
    grid-template-columns: 1fr;
    gap: 14px;
  }
  .client-track {
    grid-template-columns: repeat(var(--event-count), minmax(140px, 1fr));
  }
  .client-identity {
    padding-right: 0;
  }
}
</style>
