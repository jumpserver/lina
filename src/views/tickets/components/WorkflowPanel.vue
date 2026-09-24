<template>
  <IBox v-if="object.workflow_instance" v-loading="loading">
    <template #header
      ><div class="workflow-heading">
        <strong>{{ $t('WFProgress') }}</strong
        ><el-button link @click="load">{{ $t('Refresh') }}</el-button>
      </div></template
    >
    <template v-if="instance">
      <div class="workflow-heading">
        <el-tag>{{ $t(stateLabels[instance.state]) }}</el-tag
        ><span>{{ $t('WFVersion') }} {{ instance.version_number }}</span>
      </div>
      <el-alert
        v-if="instance.state === 'error'"
        type="error"
        :closable="false"
        :title="$t('WFErrorHelp')"
      />
      <div v-if="myTask || canWithdraw" class="approval-actions">
        <el-input
          v-model="comment"
          type="textarea"
          :rows="2"
          maxlength="4096"
          :placeholder="$t('WFDecisionComment')"
        />
        <div class="buttons">
          <template v-if="myTask">
            <el-button type="primary" :disabled="busy" @click="decide('approve')">{{
              $t('Accept')
            }}</el-button>
            <el-button type="danger" :disabled="busy" @click="decide('reject')">{{
              $t('Reject')
            }}</el-button>
            <el-button
              v-if="currentNode.config.allow_transfer"
              :disabled="busy"
              @click="openReassign('transfer')"
              >{{ $t('WFTransfer') }}</el-button
            >
            <el-button
              v-if="currentNode.config.allow_add_approver"
              :disabled="busy"
              @click="openReassign('add-approver')"
              >{{ $t('WFAddApprover') }}</el-button
            >
          </template>
          <el-button v-if="canWithdraw" :disabled="busy" @click="decide('cancel')">{{
            $t('WFWithdraw')
          }}</el-button>
        </div>
      </div>
      <div v-for="node in instance.nodes" :key="node.id" class="node-progress">
        <div class="workflow-heading">
          <strong>{{ node.name }}</strong
          ><el-tag :type="node.state === 'rejected' ? 'danger' : 'info'">{{
            $t(stateLabels[node.state])
          }}</el-tag>
        </div>
        <div v-if="node.type === 'approval'" class="hint">
          {{ $t(`WFStrategy_${node.config.strategy}`) }} ·
          {{ $t('WFRequiredCount', { count: node.required })
          }}<span v-if="node.deadline">
            · {{ $t('WFDeadline') }} {{ toSafeLocalDateStr(node.deadline) }}</span
          >
        </div>
        <div v-for="task in node.tasks" :key="task.id" class="task-row">
          <span>{{ task.assignee_snapshot.name }} ({{ task.assignee_snapshot.username }})</span
          ><span
            >{{ $t(stateLabels[task.state])
            }}<template v-if="task.is_added"> · {{ $t('WFAdded') }}</template></span
          >
          <p v-if="task.comment">{{ task.comment }}</p>
        </div>
        <div v-if="node.result?.condition">
          {{ $t('WFConditionResult') }}:
          {{ node.result.result ? $t('WFTrueBranch') : $t('WFFalseBranch') }}
        </div>
        <div v-if="node.type === 'cc' && node.state === 'approved'" class="hint">
          {{ $t('CcUsers') }}: <CcUsers :users="node.result?.recipients || []" />
        </div>
      </div>
      <el-collapse>
        <el-collapse-item :title="$t('WFTimeline')" name="timeline">
          <el-timeline>
            <el-timeline-item
              v-for="event in events"
              :key="event.id"
              :timestamp="toSafeLocalDateStr(event.date_created)"
            >
              <strong>{{ $t(eventLabels[event.type] || 'WFEvent') }}</strong>
              {{ event.actor_snapshot.name || '' }}
              <span v-if="event.node_instance"> · {{ nodeName(event.node_instance) }}</span>
              <div v-if="event.data.comment">{{ event.data.comment }}</div>
              <div v-if="event.data.target">{{ event.data.target.name }}</div>
              <div v-if="event.data.detail" class="event-error">{{ event.data.detail }}</div>
              <pre v-if="event.type === 'condition.evaluated'">{{
                JSON.stringify(event.data, null, 2)
              }}</pre>
            </el-timeline-item>
          </el-timeline>
          <el-button v-if="moreEvents" @click="loadEvents(true)">{{
            $t('WFMoreEvents')
          }}</el-button>
        </el-collapse-item>
        <el-collapse-item :title="$t('WFSnapshot')" name="snapshot"
          ><el-alert :title="$t('WFSnapshotHint')" :closable="false" />
          <pre>{{ JSON.stringify(instance.context, null, 2) }}</pre>
        </el-collapse-item>
      </el-collapse>
    </template>
    <el-dialog
      v-model="reassignVisible"
      :title="$t(operation === 'transfer' ? 'WFTransfer' : 'WFAddApprover')"
      width="480px"
      append-to-body
    >
      <el-alert
        :title="$t(operation === 'transfer' ? 'WFTransferHint' : 'WFAddHint')"
        :closable="false"
      />
      <Select2 v-if="myTask" v-model="target" :multiple="false" :ajax="targetAjax" />
      <template #footer
        ><el-button @click="reassignVisible = false">{{ $t('Cancel') }}</el-button
        ><el-button type="primary" :disabled="!target || busy" @click="decide(operation)">{{
          $t('Confirm')
        }}</el-button></template
      >
    </el-dialog>
  </IBox>
</template>
<script>
import IBox from '@/components/Common/IBox'
import Select2 from '@/components/Form/FormFields/Select2'
import CcUsers from './CcUsers'
import { useDateTime } from '@/composables/useDateTime'
import { stateLabels, eventLabels } from '../Workflow/graph'
export default {
  components: { IBox, Select2, CcUsers },
  props: { object: { type: Object, required: true } },
  data: () => ({
    instance: null,
    events: [],
    moreEvents: false,
    loading: false,
    busy: false,
    comment: '',
    target: null,
    operation: '',
    reassignVisible: false,
    stateLabels,
    eventLabels,
    timer: null,
    disposed: false
  }),
  setup: useDateTime,
  computed: {
    currentNode() {
      return this.instance?.nodes.find((n) => n.state === 'running' && n.type === 'approval')
    },
    myTask() {
      return this.currentNode?.tasks.find(
        (t) => t.assignee === this.$store.state.users.profile.id && t.state === 'pending'
      )
    },
    canWithdraw() {
      return (
        this.instance?.state === 'running' &&
        this.instance.applicant === this.$store.state.users.profile.id
      )
    },
    requestConfig() {
      return { params: { oid: this.object.org_id } }
    },
    targetAjax() {
      return {
        url: `/api/v1/tickets/approval-tasks/${this.myTask.id}/candidates/?oid=${this.object.org_id}`,
        transformOption: (u) => ({ label: `${u.name} (${u.username})`, value: u.id })
      }
    }
  },
  watch: {
    'object.workflow_instance': {
      immediate: true,
      handler(id) {
        if (id) this.load()
      }
    }
  },
  activated() {
    this.disposed = false
    if (this.object.workflow_instance && !this.loading) this.load()
  },
  deactivated() {
    this.disposed = true
    clearTimeout(this.timer)
  },
  beforeUnmount() {
    this.disposed = true
    clearTimeout(this.timer)
  },
  methods: {
    nodeName(id) {
      return this.instance.nodes.find((n) => n.id === id)?.name || ''
    },
    async load() {
      if (this.loading) return
      clearTimeout(this.timer)
      this.loading = true
      try {
        this.instance = await this.$axios.get(
          `/api/v1/tickets/workflow-instances/${this.object.workflow_instance}/`,
          this.requestConfig
        )
        await this.loadEvents()
      } finally {
        this.loading = false
        if (!this.disposed && this.instance?.state === 'running') {
          this.timer = setTimeout(() => this.load(), 15000)
        }
      }
    },
    async loadEvents(append = false) {
      const data = await this.$axios.get(
        `/api/v1/tickets/workflow-instances/${this.object.workflow_instance}/events/`,
        { params: { oid: this.object.org_id, limit: 50, offset: append ? this.events.length : 0 } }
      )
      this.events = [...(append ? this.events : []), ...(data.results || data)]
      this.moreEvents = !!data.next
    },
    openReassign(operation) {
      this.operation = operation
      this.target = null
      this.reassignVisible = true
    },
    async decide(operation) {
      if (this.busy) return
      this.busy = true
      const taskId = this.myTask?.id
      try {
        const url =
          operation === 'cancel'
            ? `/api/v1/tickets/workflow-instances/${this.instance.id}/cancel/`
            : `/api/v1/tickets/approval-tasks/${taskId}/${operation}/`
        await this.$axios.post(
          url,
          {
            comment: this.comment,
            ...(['transfer', 'add-approver'].includes(operation) ? { target: this.target } : {})
          },
          this.requestConfig
        )
        this.reassignVisible = false
        this.comment = ''
        await this.load()
        const ticket = await this.$axios.get(
          `/api/v1/tickets/tickets/${this.object.id}/`,
          this.requestConfig
        )
        Object.assign(this.object, ticket)
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } catch (e) {
        if (e.response?.status === 409) await this.load()
      } finally {
        this.busy = false
      }
    }
  }
}
</script>
<style scoped>
.workflow-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}
.approval-actions {
  margin: 16px 0;
}
.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.node-progress {
  padding: 14px 0;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.task-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  margin: 10px 0;
}
.task-row p {
  width: 100%;
  margin: 0;
  white-space: pre-wrap;
}
.hint {
  color: var(--el-text-color-secondary);
}
pre {
  overflow: auto;
  max-height: 420px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.event-error {
  color: var(--el-color-danger);
}
</style>
