<template>
  <IBox
    :title="$t(subscription ? 'CredentialEventReception' : 'RotationEventTimeline')"
    class="event-timeline"
  >
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
      <p v-if="!lanes.length" class="timeline-notice">
        {{ $t(subscription ? 'CredentialEventNoInstances' : 'RotationEventNoInstances') }}
      </p>
      <div
        ref="timelineScroll"
        class="timeline-scroll"
        role="region"
        :aria-label="$t(subscription ? 'CredentialEventReception' : 'RotationEventTimeline')"
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
              <strong>{{ client.instance_id }}</strong>
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
        v-if="timeline.lanes.length > 20"
        v-model:current-page="page"
        class="timeline-pagination"
        size="small"
        layout="prev, pager, next"
        :pager-count="5"
        :page-size="20"
        :total="timeline.lanes.length"
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
    subscription: { type: Boolean, default: false }
  },
  data() {
    return {
      result: null,
      loading: false,
      failed: false,
      requestNumber: 0,
      selection: null,
      page: 1
    }
  },
  computed: {
    timeline() {
      return buildEventLanes(this.result)
    },
    events() {
      return this.timeline.events
    },
    lanes() {
      return this.timeline.lanes.slice((this.page - 1) * 20, this.page * 20)
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
    page() {
      this.selection = null
      this.$nextTick(() => this.$refs.timelineScroll?.scrollTo({ top: 0 }))
    }
  },
  beforeUnmount() {
    this.requestNumber += 1
  },
  methods: {
    async load() {
      const requestNumber = ++this.requestNumber
      this.result = null
      this.page = 1
      this.failed = false
      this.loading = false
      if (!this.credentialId) return
      this.loading = true
      try {
        const result = await getCredentialRotationEvents(
          this.credentialId,
          this.rotationId ? { rotation_id: this.rotationId } : {}
        )
        if (requestNumber !== this.requestNumber) return
        this.result = result
        if (!this.selected) {
          const client = this.lanes[0]
          const node =
            client?.nodes.find((node) => node.status === 'unacknowledged') || client?.nodes.at(-1)
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
