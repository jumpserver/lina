<template>
  <IBox :title="$t('CredentialEventReception')" class="event-browser">
    <p class="event-help">{{ $t('ClientEventHistoryHelp') }}</p>
    <div class="event-workspace">
      <aside class="client-directory" :aria-label="$t('ClientInstances')">
        <div class="directory-heading">
          <strong>{{ $t('ClientInstances') }}</strong>
          <span>{{ $t('EventClientCount', { count: clientCount }) }}</span>
        </div>
        <form class="client-search" @submit.prevent="loadClients(1)">
          <el-input
            v-model="search"
            :placeholder="$t('EventClientSearch')"
            :aria-label="$t('EventClientSearch')"
            clearable
            @clear="loadClients(1)"
          />
          <el-button native-type="submit" :aria-label="$t('Search')"
            ><el-icon><Search /></el-icon
          ></el-button>
        </form>
        <div class="client-filters">
          <el-select
            v-model="clientType"
            :placeholder="$t('EventAllTypes')"
            :aria-label="$t('EventClientType')"
            @change="loadClients(1)"
          >
            <el-option :label="$t('EventAllTypes')" value="" /><el-option
              label="SDK"
              value="sdk"
            /><el-option label="Agent" value="agent" />
          </el-select>
          <el-select
            v-model="clientState"
            :placeholder="$t('EventAllStates')"
            :aria-label="$t('Status')"
            @change="loadClients(1)"
          >
            <el-option :label="$t('EventAllStates')" value="" />
            <el-option :label="$t('Online')" value="online" /><el-option
              :label="$t('Offline')"
              value="offline"
            />
            <el-option :label="$t('RotationEventInactiveClient')" value="inactive" />
          </el-select>
        </div>
        <div class="client-list" :aria-busy="clientsLoading">
          <el-skeleton v-if="clientsLoading" :rows="8" animated />
          <div v-else-if="clientsFailed" role="alert" class="event-empty">
            <p>{{ $t('EventClientsLoadFailed') }}</p>
            <el-button @click="loadClients(clientPage)">{{ $t('EventRetry') }}</el-button>
          </div>
          <el-empty
            v-else-if="!clients.length"
            :description="$t('EventNoMatchingClients')"
            :image-size="48"
          />
          <button
            v-for="client in visibleClients"
            :key="client.id"
            type="button"
            class="client-option"
            :class="{ selected: selected?.id === client.id }"
            :aria-pressed="selected?.id === client.id"
            @click="selectClient(client)"
          >
            <span class="client-option__heading"
              ><strong>{{ client.instance_id }}</strong
              ><span class="client-kind">{{
                client.type === 'agent' ? 'Agent' : 'SDK'
              }}</span></span
            >
            <span class="client-meta"
              >{{ client.application.name }} / {{ client.configuration.name }}</span
            >
            <span class="client-option__footer"
              ><span
                ><i class="online-dot" :class="{ online: client.online }" />{{
                  stateLabel(client)
                }}</span
              ><span>{{ eventName(client.latest_event) }}</span></span
            >
          </button>
        </div>
        <el-pagination
          size="small"
          layout="prev, pager, next"
          :pager-count="5"
          :page-size="20"
          :total="clientCount"
          :current-page="clientPage"
          :disabled="clientsLoading"
          @current-change="loadClients"
        />
      </aside>

      <section class="client-history" :aria-label="$t('EventHistory')" :aria-busy="historyLoading">
        <el-empty v-if="!selected" :description="$t('EventSelectClient')" :image-size="64" />
        <template v-else>
          <header class="history-heading">
            <div>
              <h3>{{ selected.instance_id }}</h3>
              <p>
                {{ selected.type === 'agent' ? 'Agent' : 'SDK' }} ·
                {{ selected.application.name }} / {{ selected.configuration.name }}
              </p>
            </div>
            <span class="client-state"
              ><i class="online-dot" :class="{ online: selected.online }" />{{
                stateLabel(selected)
              }}</span
            >
          </header>
          <el-skeleton v-if="historyLoading" :rows="8" animated />
          <div v-else-if="historyFailed" role="alert" class="event-empty">
            <p>{{ $t('EventHistoryLoadFailed') }}</p>
            <el-button @click="loadHistory(historyPage)">{{ $t('EventRetry') }}</el-button>
          </div>
          <template v-else>
            <dl class="latest-events">
              <div>
                <dt>{{ $t('EventLatestPublished') }}</dt>
                <dd>{{ eventName(history.latest_event) }}</dd>
                <span>{{ formatDate(history.latest_event?.published_at) }}</span>
              </div>
              <div>
                <dt>{{ $t('EventLatestReceipt') }}</dt>
                <dd>{{ eventName(history.latest_received_event) }}</dd>
                <span>{{ formatDate(history.latest_received_event?.received_at) }}</span>
              </div>
            </dl>
            <p v-if="!selected.supports_receipts" class="receipt-notice">
              {{ $t('RotationEventUpgradeClient') }}
            </p>
            <div class="history-caption">
              <strong>{{ $t('EventHistory') }}</strong
              ><span>{{ $t('EventHistoryCount', { count: history.count || 0 }) }}</span>
            </div>
            <div
              ref="historyScroll"
              class="history-scroll"
              tabindex="0"
              :aria-label="$t('EventHistory')"
            >
              <el-empty
                v-if="!history.results?.length"
                :description="$t('EventNoClientEvents')"
                :image-size="48"
              />
              <section v-for="group in eventGroups" :key="group.key" class="event-group">
                <div class="event-group__heading">
                  <h4>
                    {{ group.date
                    }}<span v-if="group.rotationId">
                      · {{ $t('EventRotationRound') }} {{ group.rotationId.slice(-8) }}</span
                    >
                  </h4>
                  <el-button
                    v-if="group.rotationId"
                    type="primary"
                    @click="comparison = group.rotationId"
                    >{{ $t('EventCompareRotation') }}</el-button
                  >
                </div>
                <el-timeline>
                  <el-timeline-item
                    v-for="event in group.events"
                    :key="event.id"
                    :type="
                      event.received_at
                        ? 'primary'
                        : event.publish_result === 'failed'
                          ? 'danger'
                          : 'info'
                    "
                    :hollow="!event.received_at"
                    hide-timestamp
                  >
                    <div class="history-event__heading">
                      <strong>{{ eventName(event) }}</strong
                      ><span
                        class="receipt-status"
                        :class="`receipt-status--${receiptStatus(event)}`"
                        >{{ $t(statusLabels[receiptStatus(event)]) }}</span
                      >
                    </div>
                    <div class="history-event__meta">
                      <span v-if="event.revision"
                        >{{ $t('AppAuditRevision') }} {{ event.revision }}</span
                      ><span
                        >{{ $t('RotationEventPublishedAt') }}
                        {{ formatDate(event.published_at) }}</span
                      ><span v-if="event.received_at"
                        >{{ $t('RotationEventReceivedAt') }}
                        {{ formatDate(event.received_at) }}</span
                      >
                    </div>
                  </el-timeline-item>
                </el-timeline>
              </section>
            </div>
            <el-pagination
              size="small"
              layout="prev, pager, next"
              :page-size="30"
              :total="history.count || 0"
              :current-page="historyPage"
              @current-change="loadHistory"
            />
          </template>
        </template>
      </section>
    </div>
    <el-drawer
      :model-value="!!comparison"
      :title="$t('EventCompareRotation')"
      :size="comparisonWidth"
      destroy-on-close
      @close="comparison = ''"
    >
      <RotationEventTimeline
        v-if="comparison"
        :key="comparison"
        :credential-id="credentialId"
        :rotation-id="comparison"
      />
    </el-drawer>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import { getCredentialEventHistory } from '@/api/applicationCredential'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import RotationEventTimeline from './RotationEventTimeline.vue'
import {
  eventLabels,
  statusLabels,
  receiptStatus,
  groupClientEvents
} from './rotationEventTimeline'

export default {
  name: 'CredentialEventBrowser',
  components: { IBox, RotationEventTimeline },
  props: {
    credentialId: { type: String, default: '' },
    subscription: Boolean,
    initialClient: { type: Object, default: null }
  },
  data() {
    return {
      search: '',
      clientType: '',
      clientState: '',
      clients: [],
      clientCount: 0,
      clientPage: 1,
      selected: null,
      history: {},
      historyPage: 1,
      clientsLoading: false,
      historyLoading: false,
      clientsFailed: false,
      historyFailed: false,
      clientRequest: 0,
      historyRequest: 0,
      comparison: '',
      comparisonWidth: 'min(1200px, 100vw)',
      comparisonResizeObserver: null,
      statusLabels
    }
  },
  computed: {
    visibleClients() {
      return this.clientsLoading || this.clientsFailed ? [] : this.clients
    },
    eventGroups() {
      return groupClientEvents(this.history.results || [])
    }
  },
  watch: {
    credentialId: {
      immediate: true,
      handler() {
        this.selected = null
        this.history = {}
        this.historyRequest++
        this.comparison = ''
        this.search = this.initialClient?.instance_id || ''
        this.loadClients(1, this.initialClient)
      }
    }
  },
  mounted() {
    const drawer = this.$el.closest('.el-drawer')
    if (!drawer) return
    const syncWidth = () => {
      this.comparisonWidth = `${drawer.getBoundingClientRect().width}px`
    }
    syncWidth()
    this.comparisonResizeObserver = new ResizeObserver(syncWidth)
    this.comparisonResizeObserver.observe(drawer)
  },
  beforeUnmount() {
    this.comparisonResizeObserver?.disconnect()
    this.clientRequest++
    this.historyRequest++
  },
  methods: {
    receiptStatus,
    async loadClients(page = 1, preferredClient = null) {
      const request = ++this.clientRequest
      this.clientPage = page
      this.clientsLoading = true
      this.clientsFailed = false
      if (!this.credentialId) {
        this.clientsLoading = false
        return
      }
      try {
        const data = await getCredentialEventHistory(this.credentialId, {
          client_search: this.search,
          client_type: this.clientType,
          state: this.clientState,
          limit: 20,
          offset: (page - 1) * 20
        })
        if (request !== this.clientRequest) return
        this.clients = data.results
        this.clientCount = data.count
        const current =
          this.clients.find((client) => client.id === (preferredClient || this.selected)?.id) ||
          preferredClient ||
          this.clients[0]
        if (current) this.selectClient(current)
        else {
          this.selected = null
          this.history = {}
          this.historyRequest++
        }
      } catch {
        if (request === this.clientRequest) this.clientsFailed = true
      } finally {
        if (request === this.clientRequest) this.clientsLoading = false
      }
    },
    selectClient(client) {
      this.selected = client
      this.loadHistory(1)
    },
    async loadHistory(page = 1) {
      if (!this.selected) return
      const request = ++this.historyRequest
      this.historyPage = page
      this.historyLoading = true
      this.historyFailed = false
      this.history = {}
      try {
        const data = await getCredentialEventHistory(this.credentialId, {
          client_id: this.selected.id,
          limit: 30,
          offset: (page - 1) * 30
        })
        if (request !== this.historyRequest) return
        this.history = data
        this.selected = { ...this.selected, ...data.client }
        this.$nextTick(() => {
          if (this.$refs.historyScroll) this.$refs.historyScroll.scrollTop = 0
        })
      } catch {
        if (request === this.historyRequest) this.historyFailed = true
      } finally {
        if (request === this.historyRequest) this.historyLoading = false
      }
    },
    eventName(event) {
      return event ? this.$t(eventLabels[event.event] || event.event) : this.$t('EventNone')
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
.event-help {
  margin: 0 0 18px;
  color: var(--el-text-color-regular);
  font-size: 12px;
  line-height: 1.7;
}
.event-workspace {
  display: grid;
  grid-template-columns: minmax(260px, 30%) minmax(0, 1fr);
  min-height: 640px;
}
.client-directory {
  min-width: 0;
  padding-right: 20px;
  border-right: 1px solid var(--color-border);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.directory-heading,
.history-caption {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
}
.directory-heading span,
.history-caption span {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.client-search {
  display: flex;
  gap: 6px;
}
.client-filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}
.client-list {
  height: 490px;
  overflow-y: auto;
  min-width: 0;
}
.client-option {
  width: 100%;
  border: 0;
  border-bottom: 1px solid var(--color-border);
  background: transparent;
  color: inherit;
  text-align: left;
  padding: 14px 10px;
  font: inherit;
  display: grid;
  gap: 7px;
  cursor: pointer;
}
.client-option:hover {
  background: var(--el-fill-color-light);
}
.client-option.selected {
  background: var(--el-color-primary-light-9);
  box-shadow: inset 0 0 0 1px var(--el-color-primary-light-5);
}
.client-option__heading,
.client-option__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.client-option strong {
  font-weight: 600;
  overflow-wrap: anywhere;
  min-width: 0;
}
.client-kind {
  flex-shrink: 0;
  font-size: 11px;
  color: var(--el-text-color-regular);
}
.client-meta {
  color: var(--el-text-color-regular);
  font-size: 12px;
  overflow-wrap: anywhere;
}
.client-option__footer {
  color: var(--el-text-color-regular);
  font-size: 12px;
}
.client-option__footer > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.online-dot {
  display: inline-block;
  width: 7px;
  height: 7px;
  margin-right: 5px;
  border-radius: 50%;
  background: var(--el-text-color-secondary);
}
.online-dot.online {
  background: var(--color-primary);
}
.client-history {
  padding-left: 28px;
  min-width: 0;
}
.history-heading {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}
.history-heading h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  overflow-wrap: anywhere;
}
.history-heading p {
  margin: 8px 0 0;
  font-size: 12px;
  color: var(--el-text-color-regular);
  overflow-wrap: anywhere;
}
.client-state {
  flex-shrink: 0;
  font-size: 12px;
  padding-top: 4px;
}
.latest-events {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  padding: 18px 0;
  margin: 0 0 18px;
  border-bottom: 1px solid var(--color-border);
}
.latest-events dt {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.latest-events dd {
  margin: 7px 0;
  font-weight: 600;
}
.latest-events span {
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-variant-numeric: tabular-nums;
}
.history-caption {
  margin-bottom: 14px;
}
.history-scroll {
  height: 400px;
  overflow-y: auto;
  padding-right: 12px;
}
.event-group__heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 18px;
}
.event-group h4 {
  font-size: 12px;
  color: var(--el-text-color-regular);
  margin: 0;
  font-weight: 500;
}
.event-group :deep(.el-timeline) {
  padding-left: 2px;
}
.history-event__heading {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.history-event__heading strong {
  font-weight: 500;
  font-size: 13px;
}
.history-event__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 14px;
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-regular);
  font-variant-numeric: tabular-nums;
  line-height: 1.6;
}
.receipt-status {
  font-size: 12px;
  color: var(--el-text-color-regular);
}
.receipt-status--received {
  color: var(--el-text-color-primary);
}
.receipt-status--failed {
  color: var(--el-color-danger-dark-2);
}
.receipt-notice {
  font-size: 12px;
  color: var(--el-text-color-regular);
  line-height: 1.6;
}
.event-empty {
  text-align: center;
  padding: 30px 10px;
  font-size: 13px;
}
.client-list,
.history-scroll {
  scrollbar-width: thin;
  scrollbar-color: var(--color-input-border) transparent;
}
.client-option:focus-visible,
.history-scroll:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.client-history > :deep(.el-pagination) {
  justify-content: flex-end;
  margin-top: 14px;
}
@media (max-width: 760px) {
  .event-workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .client-directory {
    padding: 0 0 20px;
    border-right: 0;
    border-bottom: 1px solid var(--color-border);
  }
  .client-list {
    height: 220px;
  }
  .client-history {
    padding: 24px 0 0;
  }
  .history-scroll {
    height: 460px;
  }
  .latest-events {
    gap: 12px;
  }
  .latest-events span {
    display: block;
    overflow-wrap: anywhere;
  }
  .history-heading {
    gap: 8px;
  }
}
</style>
