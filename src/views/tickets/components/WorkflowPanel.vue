<template>
  <IBox
    v-if="object.workflow_instance"
    v-loading="loading"
    title="WFProgress"
    class="workflow-panel"
  >
    <template #header>
      <div class="workflow-heading">
        <strong>{{ $t('WFProgress') }}</strong>
        <el-button link :disabled="loading" @click="load">
          <el-icon><Refresh /></el-icon>{{ $t('Refresh') }}
        </el-button>
      </div>
    </template>
    <template v-if="instance">
      <div class="workflow-summary">
        <el-tag :type="stateTone(instance.state)" effect="light">
          {{ $t(stateLabels[instance.state]) }}
        </el-tag>
        <span class="hint">{{ $t('WFVersion') }} {{ instance.version_number }}</span>
      </div>
      <el-alert
        v-if="instance.state === 'error'"
        type="error"
        :closable="false"
        :title="$t('WFErrorHelp')"
      />
      <div v-if="myTask || canWithdraw" class="approval-actions">
        <div class="action-heading">
          <el-icon><EditPen /></el-icon>
          <strong>{{ $t(myTask ? 'AwaitingMyApproval' : 'WFWithdraw') }}</strong>
        </div>
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
      <el-timeline class="approval-timeline" :aria-label="$t('WFProgress')">
        <el-timeline-item
          v-for="node in timelineNodes"
          :key="node.id"
          class="workflow-step"
          :class="{ 'is-current': node.state === 'running' }"
        >
          <template #dot>
            <span class="timeline-dot" :class="`tone-${stateTone(node.state)}`">
              <el-icon>
                <VideoPlay v-if="node.type === 'start'" />
                <Promotion v-else-if="node.type === 'cc'" />
                <Share v-else-if="node.type === 'condition'" />
                <User v-else />
              </el-icon>
            </span>
          </template>
          <section class="step-card">
            <div class="step-heading">
              <div class="step-title">
                <strong>{{
                  node.type === 'start' ? $t('WFStarted') : node.name || $t(nodeLabels[node.type])
                }}</strong>
                <el-tag
                  v-if="node.type === 'approval' || node.state !== 'approved'"
                  :type="stateTone(node.state)"
                  effect="plain"
                  size="small"
                  >{{ $t(stateLabels[node.state]) }}</el-tag
                >
              </div>
              <time
                v-if="node.date_finished || node.date_created"
                class="step-time"
                :datetime="node.date_finished || node.date_created"
                :title="$t(node.date_finished ? 'DateFinished' : 'WFNodeEntered')"
                >{{ toSafeLocalDateStr(node.date_finished || node.date_created) }}</time
              >
            </div>
            <div v-if="node.type === 'start'" class="step-description">
              <span class="hint">{{ $t('Applicant') }}</span>
              {{ formatUser(instance.context?.applicant) }}
            </div>
            <template v-if="node.type === 'approval'">
              <div class="step-description hint">
                {{ $t(`WFStrategy_${node.config.strategy}`) }} ·
                {{ $t('WFRequiredCount', { count: node.required }) }}
              </div>
              <div v-if="node.state === 'running' && node.deadline" class="step-deadline hint">
                <el-icon><Clock /></el-icon>
                {{ $t('WFDeadline') }} {{ toSafeLocalDateStr(node.deadline) }}
              </div>
            </template>
            <div v-if="node.historyTasks.length" class="step-tasks">
              <div v-for="task in node.historyTasks" :key="task.id" class="task-row">
                <span class="task-avatar" aria-hidden="true"
                  ><el-icon><User /></el-icon
                ></span>
                <div class="task-content">
                  <div class="task-heading">
                    <span class="task-assignee">{{ formatUser(task.assignee_snapshot) }}</span>
                    <el-tag v-if="task.is_added" type="info" effect="plain" size="small">{{
                      $t('WFAdded')
                    }}</el-tag>
                    <span class="task-state" :class="`tone-${stateTone(task.state)}`">
                      <i aria-hidden="true" />{{ $t(stateLabels[task.state]) }}
                    </span>
                    <time
                      v-if="task.date_finished"
                      class="task-time"
                      :datetime="task.date_finished"
                    >
                      {{ toSafeLocalDateStr(task.date_finished) }}
                    </time>
                  </div>
                  <p v-if="task.comment" class="task-comment">{{ task.comment }}</p>
                </div>
              </div>
            </div>
            <div v-if="node.pendingTasks.length" class="pending-reviewers">
              <span class="hint">{{ $t('Assignees') }}</span>
              <TicketValueList
                inline
                :items="
                  node.pendingTasks.map(
                    (task) =>
                      formatUser(task.assignee_snapshot) +
                      (task.is_added ? ' · ' + $t('WFAdded') : '')
                  )
                "
                :label="$t('Assignees')"
                :count-label="$t('TicketUserCount', { count: node.pendingTasks.length })"
                :expand-label="$t('CcUsersViewAll', { count: node.pendingTasks.length })"
              />
            </div>
            <div v-if="node.result?.condition" class="step-description">
              <span class="hint">{{ $t('WFConditionResult') }}</span>
              {{ node.result.result ? $t('WFTrueBranch') : $t('WFFalseBranch') }}
            </div>
            <div v-if="node.type === 'cc' && node.state === 'approved'" class="step-description">
              <span class="hint">{{ $t('CcUsers') }}</span>
              <CcUsers :users="node.result?.recipients || []" />
            </div>
          </section>
        </el-timeline-item>
        <el-timeline-item v-if="instance.date_finished" class="workflow-step">
          <template #dot>
            <span class="timeline-dot" :class="`tone-${stateTone(instance.state)}`">
              <el-icon>
                <CircleCheck v-if="instance.state === 'approved'" />
                <CircleClose
                  v-else-if="instance.state === 'rejected' || instance.state === 'error'"
                />
                <Clock v-else-if="instance.state === 'expired'" />
                <Finished v-else />
              </el-icon>
            </span>
          </template>
          <div class="step-card step-end">
            <div class="step-heading">
              <div class="step-title">
                <strong>{{ $t('WFCompleted') }}</strong>
                <el-tag :type="stateTone(instance.state)" effect="plain" size="small">
                  {{ $t(stateLabels[instance.state]) }}
                </el-tag>
              </div>
              <time class="step-time" :datetime="instance.date_finished">
                {{ toSafeLocalDateStr(instance.date_finished) }}
              </time>
            </div>
          </div>
        </el-timeline-item>
      </el-timeline>
      <el-collapse v-if="skippedNodes.length" class="workflow-details">
        <el-collapse-item :title="$t('WFSkipped')" name="skipped">
          <div class="skipped-nodes">
            <el-tag v-for="node in skippedNodes" :key="node.id" type="info" effect="plain">
              {{ node.name || $t(nodeLabels[node.type]) }}
            </el-tag>
          </div>
        </el-collapse-item>
      </el-collapse>
    </template>
    <Dialog
      v-model:visible="reassignVisible"
      :title="$t(operation === 'transfer' ? 'WFTransfer' : 'WFAddApprover')"
      class="workflow-reassign-dialog"
      width="520px"
      :close-on-click-modal="!busy"
      :close-on-press-escape="!busy"
      :show-close="!busy"
      destroy-on-close
      @cancel="reassignVisible = false"
    >
      <p class="reassign-description">
        {{ $t(operation === 'transfer' ? 'WFTransferHint' : 'WFAddHint') }}
      </p>
      <p v-if="reassignTaskChanged" class="reassign-warning" role="alert">
        {{ $t('WFReassignTaskChanged') }}
      </p>
      <WorkflowMemberSelect
        v-if="myTask"
        v-model="target"
        :url="targetUrl"
        :disabled="busy || reassignTaskChanged"
        :label="$t(operation === 'transfer' ? 'WFTransferTo' : 'WFAddedApprover')"
      />
      <el-form class="reassign-comment" label-position="top" @submit.prevent>
        <el-form-item :label="$t(operation === 'transfer' ? 'WFTransferComment' : 'WFAddComment')">
          <el-input
            v-model="reassignComment"
            type="textarea"
            :rows="4"
            maxlength="4096"
            show-word-limit
            :disabled="busy"
            :placeholder="$t('WFReassignCommentPlaceholder')"
            resize="vertical"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button :disabled="busy" @click="reassignVisible = false">{{ $t('Cancel') }}</el-button>
        <el-button
          type="primary"
          :disabled="!target || !myTask || busy || reassignTaskChanged"
          :loading="busy"
          @click="decide(operation)"
        >
          {{ $t(operation === 'transfer' ? 'WFConfirmTransfer' : 'WFConfirmAddApprover') }}
        </el-button>
      </template>
    </Dialog>
  </IBox>
</template>
<script>
import IBox from '@/components/Common/IBox'
import Dialog from '@/components/Dialog'
import WorkflowMemberSelect from './WorkflowMemberSelect'
import CcUsers from './CcUsers'
import TicketValueList from './TicketValueList'
import { useDateTime } from '@/composables/useDateTime'
import { stateLabels, nodeLabels } from '../Workflow/graph'
export default {
  components: { IBox, Dialog, WorkflowMemberSelect, CcUsers, TicketValueList },
  props: { object: { type: Object, required: true } },
  data: () => ({
    instance: null,
    loading: false,
    requestId: 0,
    busy: false,
    comment: '',
    reassignComment: '',
    target: null,
    operation: '',
    reassignVisible: false,
    reassignTaskId: null,
    stateLabels,
    nodeLabels,
    timer: null,
    disposed: false
  }),
  setup: useDateTime,
  computed: {
    workflowKey() {
      return `${this.object.org_id || ''}:${this.object.id || ''}:${this.object.workflow_instance || ''}`
    },
    reassignTaskChanged() {
      return this.reassignVisible && this.reassignTaskId !== this.myTask?.id
    },
    timelineNodes() {
      return (this.instance?.nodes || [])
        .filter((node) => node.state !== 'skipped' && node.type !== 'end')
        .map((node) => ({
          ...node,
          pendingTasks: (node.tasks || []).filter((task) => task.state === 'pending'),
          historyTasks: (node.tasks || []).filter(
            (task) => task.state !== 'pending' && (task.state !== 'cancelled' || task.comment)
          )
        }))
    },
    skippedNodes() {
      return (this.instance?.nodes || []).filter((node) => node.state === 'skipped')
    },
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
    targetUrl() {
      return `/api/v1/tickets/approval-tasks/${this.myTask.id}/candidates/?oid=${this.object.org_id}`
    }
  },
  watch: {
    workflowKey: {
      immediate: true,
      handler() {
        this.requestId++
        clearTimeout(this.timer)
        this.instance = null
        this.loading = false
        this.comment = ''
        this.reassignComment = ''
        this.reassignVisible = false
        this.reassignTaskId = null
        this.target = null
        this.load()
      }
    }
  },
  activated() {
    this.disposed = false
    if (this.object.workflow_instance && !this.loading) this.load()
  },
  deactivated() {
    this.disposed = true
    this.requestId++
    this.loading = false
    this.reassignVisible = false
    clearTimeout(this.timer)
  },
  beforeUnmount() {
    this.disposed = true
    this.requestId++
    clearTimeout(this.timer)
  },
  methods: {
    stateTone(state) {
      if (state === 'approved') return 'success'
      if (state === 'running' || state === 'pending') return 'primary'
      if (state === 'rejected' || state === 'error') return 'danger'
      if (state === 'expired') return 'warning'
      return 'info'
    },
    formatUser(user) {
      const name = user?.name || user?.username || '-'
      return user?.username && name !== user.username ? `${name} (${user.username})` : name
    },
    async load(force = false) {
      if ((this.loading && !force) || !this.object.workflow_instance || this.disposed) return
      clearTimeout(this.timer)
      const requestId = ++this.requestId
      this.loading = true
      try {
        const instance = await this.$axios.get(
          `/api/v1/tickets/workflow-instances/${this.object.workflow_instance}/`,
          this.requestConfig
        )
        if (requestId === this.requestId) this.instance = instance
      } finally {
        if (requestId === this.requestId) {
          this.loading = false
          if (!this.disposed && this.instance?.state === 'running') {
            this.timer = setTimeout(() => this.load(), 15000)
          }
        }
      }
    },
    openReassign(operation) {
      if (this.busy || !this.myTask) return
      this.reassignTaskId = this.myTask.id
      this.operation = operation
      this.target = null
      this.reassignComment = this.comment
      this.reassignVisible = true
    },
    async decide(operation) {
      if (this.busy) return
      const taskId = this.myTask?.id
      const reassign = ['transfer', 'add-approver'].includes(operation)
      if (operation !== 'cancel' && !taskId) return
      if (reassign && (!this.target || this.reassignTaskId !== taskId)) return
      const workflowKey = this.workflowKey
      const ticket = this.object
      const requestConfig = this.requestConfig
      this.busy = true
      try {
        const url =
          operation === 'cancel'
            ? `/api/v1/tickets/workflow-instances/${this.instance.id}/cancel/`
            : `/api/v1/tickets/approval-tasks/${taskId}/${operation}/`
        await this.$axios.post(
          url,
          {
            comment: reassign ? this.reassignComment : this.comment,
            ...(reassign ? { target: this.target } : {})
          },
          requestConfig
        )
        if (workflowKey !== this.workflowKey || this.disposed) return
        this.reassignVisible = false
        this.comment = ''
        this.reassignComment = ''
        await this.load(true)
        const updatedTicket = await this.$axios.get(
          `/api/v1/tickets/tickets/${ticket.id}/`,
          requestConfig
        )
        if (workflowKey !== this.workflowKey || this.disposed) return
        Object.assign(ticket, updatedTicket)
        this.$message.success(this.$t('UpdateSuccessMsg'))
      } catch (e) {
        if (e.response?.status === 409 && workflowKey === this.workflowKey && !this.disposed) {
          await this.load(true)
        }
      } finally {
        this.busy = false
      }
    }
  }
}
</script>
<style scoped>
.workflow-panel {
  margin-bottom: 16px;
}
.workflow-heading {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}
.workflow-heading strong {
  color: var(--el-text-color-primary);
  font-size: 14px;
  font-weight: 600;
}
.workflow-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 20px;
}
.workflow-panel :deep(.el-alert) {
  margin-bottom: 16px;
}
.approval-actions {
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
}
.action-heading {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 12px;
  color: var(--el-color-primary);
}
.buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 12px;
}
.buttons .el-button + .el-button {
  margin-left: 0;
}
.approval-timeline {
  padding: 0;
  margin: 0;
}
.approval-timeline :deep(.el-timeline-item) {
  padding-bottom: 20px;
}
.approval-timeline :deep(.el-timeline-item:last-child) {
  padding-bottom: 0;
}
.approval-timeline :deep(.el-timeline-item__wrapper) {
  padding-left: 44px;
  top: 0;
}
.approval-timeline :deep(.el-timeline-item__tail) {
  left: 13px;
  top: 28px;
  height: calc(100% - 28px);
  border-left: 1px solid var(--el-border-color);
}
.approval-timeline :deep(.el-timeline-item__dot) {
  left: 0;
  top: 0;
}
.timeline-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--timeline-background);
  color: var(--timeline-color);
  font-size: 15px;
}
.tone-primary {
  --timeline-color: var(--el-color-primary);
  --timeline-background: var(--el-color-primary-light-9);
}
.tone-success {
  --timeline-color: var(--el-color-success);
  --timeline-background: var(--el-color-success-light-9);
}
.tone-warning {
  --timeline-color: var(--el-color-warning);
  --timeline-background: var(--el-color-warning-light-9);
}
.tone-danger {
  --timeline-color: var(--el-color-danger);
  --timeline-background: var(--el-color-danger-light-9);
}
.tone-info {
  --timeline-color: var(--el-text-color-secondary);
  --timeline-background: var(--el-fill-color);
}
.is-current .timeline-dot {
  color: var(--el-color-white);
  background: var(--el-color-primary);
  box-shadow: 0 0 0 4px var(--el-color-primary-light-9);
}
.step-card {
  padding: 2px 0 4px;
  min-width: 0;
}
.is-current .step-card {
  padding: 14px 16px;
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 6px;
  background: var(--el-color-primary-light-9);
}
.step-heading,
.step-title {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
.step-heading {
  justify-content: space-between;
  min-height: 24px;
}
.step-title {
  min-width: 0;
  font-size: 14px;
  color: var(--el-text-color-primary);
}
.step-title strong {
  font-weight: 600;
  overflow-wrap: anywhere;
}
.step-time,
.task-time {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
}
.step-time {
  flex-shrink: 0;
}
.step-description {
  margin-top: 6px;
  line-height: 1.7;
  color: var(--el-text-color-regular);
  overflow-wrap: anywhere;
}
.step-description > .hint {
  margin-right: 8px;
}
.step-deadline {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
  font-size: 12px;
}
.step-tasks {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 12px;
}
.task-row {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.task-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--el-fill-color);
  color: var(--el-text-color-secondary);
}
.task-content {
  flex: 1;
  min-width: 0;
}
.task-heading {
  display: flex;
  align-items: center;
  gap: 4px 10px;
  flex-wrap: wrap;
  min-height: 26px;
}
.task-assignee {
  overflow-wrap: anywhere;
  color: var(--el-text-color-primary);
}
.task-state {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: var(--timeline-color);
  font-size: 12px;
}
.task-state i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: currentColor;
}
.task-comment {
  margin: 6px 0 0;
  padding: 8px 12px;
  border-radius: 4px;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  line-height: 1.7;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}
.pending-reviewers {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 12px;
}
.pending-reviewers > .hint {
  flex-shrink: 0;
}
.pending-reviewers :deep(.ticket-value-list) {
  flex: 1;
  min-width: 0;
  padding-bottom: 0;
}
.skipped-nodes {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.workflow-details {
  margin-top: 24px;
  border-bottom: 0;
}
.workflow-details :deep(.el-collapse-item__header) {
  font-weight: 400;
  color: var(--el-text-color-secondary);
}
.hint {
  color: var(--el-text-color-secondary);
}
@media (max-width: 600px) {
  .approval-timeline :deep(.el-timeline-item__wrapper) {
    padding-left: 38px;
  }
  .step-heading {
    align-items: flex-start;
    flex-direction: column;
  }
  .is-current .step-card {
    padding: 12px;
  }
  .approval-actions {
    padding: 12px;
  }
}
</style>

<style lang="scss">
.el-dialog.dialog.workflow-reassign-dialog {
  max-height: calc(100dvh - 32px);
  display: flex;
  flex-direction: column;

  .el-dialog__header,
  .el-dialog__footer {
    flex-shrink: 0;
  }

  .el-dialog__body {
    padding: 24px;
    overflow-y: auto;
  }

  .reassign-comment {
    margin-top: 24px;

    .el-form-item {
      margin-bottom: 0;
    }

    .el-form-item__label {
      color: var(--el-text-color-primary);
    }
  }

  .reassign-warning {
    margin: 0 0 16px;
    color: var(--el-color-danger);
    line-height: 1.7;
  }

  .reassign-description {
    margin: 0 0 20px;
    color: var(--el-text-color-regular);
    font-size: 13px;
    line-height: 1.7;
  }
}
</style>
