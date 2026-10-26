<template>
  <el-row :gutter="20">
    <el-col :span="24">
      <p
        v-if="object.execution_mode === 'approval_only' && !plugin.requestComponent"
        class="ticket-approval-hint"
      >
        {{ $t('TicketApprovalOnlyHint') }}
      </p>
      <Details :detail-card-items="iDetailCardItems" :title="$tc('BasicInfo')" />
      <component
        :is="plugin.requestComponent"
        v-if="plugin.requestComponent"
        :object="object"
        :request-items="specialCardItems"
        @refresh="$refs.workflow.load(true)"
      />
      <TicketRequestInfo
        v-else-if="specialCardItems.length > 0"
        :key="ticketKey"
        :object="object"
        :items="specialCardItems"
        :instance="workflow"
        :busy="workflowBusy"
        @editing="editingRequest = $event"
        @saving="savingRequest = $event"
        @refresh="$refs.workflow.load(true)"
      />
      <Details
        v-if="object.state.value === 'approved' && assignedCardItems.length > 0"
        :detail-card-items="assignedCardItems"
        :title="$tc('AssignedInfo')"
      />
      <component
        :is="plugin.resultComponent"
        v-if="plugin.resultComponent"
        :object="object"
        @refresh="$refs.workflow.load(true)"
      />
      <slot id="MoreDetails" />
      <WorkflowPanel
        ref="workflow"
        :object="object"
        :editing-request="editingRequest"
        :saving-request="savingRequest"
        @loaded="workflow = $event"
        @busy="workflowBusy = $event"
      />
      <Comments v-bind="$attrs" :object="object" />
    </el-col>
    <el-col :span="24">
      <Session v-if="$hasPerm('tickets.view_ticket')" :object="object" />
    </el-col>
  </el-row>
</template>

<script lang="jsx">
import { getTicketPlugin } from '../plugins/registry'
import Comments from './Comments'
import CcUsers from './CcUsers'
import Details from './Details'
import Session from './Session'
import WorkflowPanel from './WorkflowPanel'
import TicketRequestInfo from './TicketRequestInfo'
import { getTicketFlowLabel, getTicketStateLabel, getTicketTypeLabel } from '../const'
export default {
  name: 'GenericTicketDetail',
  components: {
    WorkflowPanel,
    TicketRequestInfo,
    CcUsers,
    Comments,
    Details,
    Session
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    },
    specialCardItems: {
      type: Array,
      default: () => []
    },
    detailCardItems: {
      type: Array,
      default: null
    },
    assignedCardItems: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      workflow: null,
      workflowBusy: false,
      editingRequest: false,
      savingRequest: false,
      statusMap: {
        pending: 'warning',
        approved: 'success',
        rejected: 'danger',
        closed: 'info',
        reopen: 'warning'
      }
    }
  },
  computed: {
    ticketKey() {
      return `${this.object.org_id || ''}:${this.object.id || ''}`
    },
    plugin() {
      return getTicketPlugin(this.object.type?.value)
    },
    iDetailCardItems() {
      if (this.detailCardItems) {
        return this.detailCardItems
      }
      const { object } = this
      return [
        {
          key: this.$tc('Number'),
          value: object['serial_num']
        },
        {
          key: this.$tc('Status'),
          value: object.state.value,
          formatter: (item, val) => {
            const tp = this.statusMap[val]
            return (
              <el-tag type={tp} size="small">
                {getTicketStateLabel(this.object.state, this.$t)}
              </el-tag>
            )
          }
        },
        {
          key: this.$tc('Type'),
          value: getTicketTypeLabel(object.type, this.$t)
        },
        {
          key: this.$t('TicketFlow'),
          value: getTicketFlowLabel(object, this.$t)
        },
        {
          key: this.$tc('User'),
          value: object.rel_snapshot.applicant
        },
        {
          key: this.$t('CcUsers'),
          value: object.cc_users,
          formatter: (item, users) => <CcUsers users={users} />
        },
        {
          key: this.$tc('OrgName'),
          value: object.org_name
        },
        {
          key: this.$tc('DateCreated'),
          value: object.date_created
        },
        {
          key: this.$tc('Comment'),
          value: object.comment
        }
      ]
    }
  },
  watch: {
    ticketKey() {
      this.workflow = null
      this.workflowBusy = false
      this.editingRequest = false
      this.savingRequest = false
    }
  }
}
</script>

<style scoped>
.ticket-approval-hint {
  margin: 0 0 10px;
  color: var(--color-text-secondary);
}
</style>
