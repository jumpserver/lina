<template>
  <IBox v-loading="loading" title="OperateLog" class="ticket-activity">
    <template #header>
      <div class="activity-heading">
        <strong>{{ $t('OperateLog') }}</strong>
        <el-button link :disabled="loading || !object.workflow_instance" @click="load()">
          <el-icon><Refresh /></el-icon>{{ $t('Refresh') }}
        </el-button>
      </div>
    </template>
    <el-alert v-if="failed" :title="$t('LoadFailed')" type="error" :closable="false" />
    <el-timeline v-if="events.length" class="activity-timeline" :aria-label="$t('OperateLog')">
      <el-timeline-item
        v-for="event in events"
        :key="event.id"
        :timestamp="toSafeLocalDateStr(event.date_created)"
      >
        <div class="event-heading">
          <strong>{{ $t(eventLabels[event.type] || 'WFEvent') }}</strong>
          <span v-if="event.actor_snapshot?.name || event.actor_snapshot?.username">
            {{ formatUser(event.actor_snapshot) }}
          </span>
          <span v-if="event.type === 'approval.created' && event.data.assignee">
            → {{ formatUser(event.data.assignee) }}
          </span>
          <span v-if="event.node_instance" class="hint">
            · {{ nodeName(event.node_instance) }}</span
          >
        </div>
        <div v-if="event.data.comment" class="event-comment">{{ event.data.comment }}</div>
        <div v-if="event.data.target">→ {{ formatUser(event.data.target) }}</div>
        <div v-if="event.type === 'cc.added'">
          <CcUsers :users="event.data.recipients || []" />
        </div>
        <div
          v-for="resource in event.resources || []"
          :key="`${resource.type}:${resource.id}`"
          class="event-resource"
        >
          <span v-if="resource.label" class="hint">{{ resource.label }}:</span>
          <el-link
            v-if="resource.url?.startsWith('/ui/#/')"
            :href="resource.url"
            type="primary"
            underline="hover"
            target="_blank"
            rel="noopener noreferrer"
            >{{ resource.name || resource.id }}</el-link
          >
          <span v-else>{{ resource.name || resource.id }}</span>
        </div>
        <div v-if="event.data.detail" class="event-error">{{ event.data.detail }}</div>
        <pre v-if="event.type === 'condition.evaluated'">{{
          JSON.stringify(event.data, null, 2)
        }}</pre>
      </el-timeline-item>
    </el-timeline>
    <el-empty v-else-if="!loading && !failed" :description="$t('NoData')" :image-size="80" />
    <el-button v-if="moreEvents" class="load-more" :disabled="loading" @click="load(true)">
      {{ $t('WFMoreEvents') }}
    </el-button>
    <el-collapse v-if="instance" class="activity-details">
      <el-collapse-item :title="$t('WFSnapshot')" name="snapshot">
        <el-alert :title="$t('WFSnapshotHint')" :closable="false" />
        <pre>{{ JSON.stringify(instance.context, null, 2) }}</pre>
      </el-collapse-item>
    </el-collapse>
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { useDateTime } from '@/composables/useDateTime'
import CcUsers from './CcUsers'
import { eventLabels, nodeLabels } from '../Workflow/graph'

export default {
  name: 'TicketActivity',
  components: { IBox, CcUsers },
  props: { object: { type: Object, required: true } },
  setup: useDateTime,
  data: () => ({
    instance: null,
    events: [],
    moreEvents: false,
    loading: false,
    failed: false,
    requestId: 0,
    eventLabels
  }),
  computed: {
    workflowKey() {
      return `${this.object.org_id || ''}:${this.object.workflow_instance || ''}`
    }
  },
  watch: {
    workflowKey: {
      immediate: true,
      handler() {
        this.requestId++
        this.instance = null
        this.events = []
        this.moreEvents = false
        this.loading = false
        this.failed = false
        this.load()
      }
    }
  },
  beforeUnmount() {
    this.requestId++
  },
  methods: {
    formatUser(user) {
      const name = user?.name || user?.username || '-'
      return user?.username && name !== user.username ? `${name} (${user.username})` : name
    },
    nodeName(id) {
      const node = this.instance?.nodes.find((node) => node.id === id)
      return node ? node.name || this.$t(nodeLabels[node.type]) : ''
    },
    async load(append = false) {
      if (this.loading || !this.object.workflow_instance) return
      const requestId = ++this.requestId
      const url = `/api/v1/tickets/workflow-instances/${this.object.workflow_instance}/`
      const params = { oid: this.object.org_id }
      this.loading = true
      this.failed = false
      try {
        const [instance, data] = await Promise.all([
          this.$axios.get(url, { params }),
          this.$axios.get(`${url}events/`, {
            params: { ...params, limit: 50, offset: append ? this.events.length : 0 }
          })
        ])
        if (requestId !== this.requestId) return
        this.instance = instance
        this.events = [...(append ? this.events : []), ...(data.results || data)]
        this.moreEvents = !!data.next
      } catch {
        if (requestId === this.requestId) this.failed = true
      } finally {
        if (requestId === this.requestId) this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.activity-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.activity-heading strong {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}
.activity-timeline {
  margin: 8px 0 0;
  padding-left: 4px;
  overflow-wrap: anywhere;
}
.event-heading {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 4px 6px;
}
.event-comment,
pre {
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.event-resource {
  display: flex;
  align-items: baseline;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 4px;
}
pre {
  overflow: auto;
  max-height: 420px;
}
.event-error {
  color: var(--el-color-danger);
}
.hint {
  color: var(--el-text-color-secondary);
}
.load-more {
  align-self: flex-start;
}
.activity-details {
  margin-top: 16px;
  border-bottom: 0;
}
.activity-details :deep(.el-collapse-item__header) {
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
</style>
