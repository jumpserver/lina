<template>
  <IBox class="ticket-steps-box">
    <div class="ticket-steps">
      <el-steps :active="ticketSteps" direction="vertical">
        <el-step
          :description="`${$t('Applicant')}：${object.rel_snapshot.applicant}`"
          :title="`${$t('OpenTicket')}：${object.title}`"
        >
          <template #description>
            <div class="description">
              <div>{{ `${$t('Applicant')}：${object.rel_snapshot.applicant}` }}</div>
              <div>{{ `${$t('DateCreated')}: ${toSafeLocalDateStr(object.date_created)}` }}</div>
            </div>
          </template>
        </el-step>
        <el-step v-for="(item, i) in process_map" :key="i" :title="$tc('HandleTicket')">
          <template #description>
            <div class="step-description">
              <div v-if="item.state === 'pending'" class="assignees">
                <span
                  v-for="assignee of getAssignees(item).slice(0, 2)"
                  :key="assignee"
                  :title="assignee"
                  class="assignee-chip"
                >
                  {{ assignee }}
                </span>
                <el-button
                  v-if="getAssignees(item).length > 2"
                  :title="$t('TicketViewAllAssignees', { count: getAssignees(item).length })"
                  class="more-assignees"
                  link
                  @click="lookOver(getAssignees(item))"
                >
                  {{ $t('TicketViewAllAssignees', { count: getAssignees(item).length }) }}
                </el-button>
                <span v-if="getAssignees(item).length === 0" class="empty-value">-</span>
              </div>
              <template v-else>
                <div class="meta-line">
                  <span class="meta-label">{{ $t('Assignee') }}:</span>
                  <span class="meta-value">{{ getProcessor(item) || '-' }}</span>
                </div>
                <div class="meta-line">
                  <span class="meta-label">{{ $t('DateFinished') }}:</span>
                  <span class="meta-value">{{ toSafeLocalDateStr(item.approval_date) }}</span>
                </div>
              </template>
            </div>
          </template>
        </el-step>
        <el-step :title="`${$t('FinishedTicket')}`">
          <template #description>
            <div v-if="object.status.value === 'closed'">
              <div>{{ $t('DateFinished') }}: {{ toSafeLocalDateStr(object.date_updated) }}</div>
            </div>
          </template>
        </el-step>
      </el-steps>
    </div>
    <UserListDialog
      v-model="assigneesDialogVisible"
      :title="$t('RelevantAssignees')"
      :users="dialogAssignees"
    />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox'
import { useDateTime } from '@/composables/useDateTime'
import { STATE_MAP } from '../const'
import UserListDialog from './UserListDialog'

export default {
  name: 'Steps',
  components: { IBox, UserListDialog },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      status: { open: 2, close: 3 },
      process_map: [...(this.object.process_map || [])].sort((a, b) => {
        return a.approval_level - b.approval_level
      }),
      assigneesDialogVisible: false,
      dialogAssignees: [],
      vm: this,
      statusMap: STATE_MAP
    }
  },
  computed: {
    ticketSteps() {
      let countApprove = 0
      this.process_map.forEach((item) => {
        if (item.state === 'approved') {
          countApprove += 1
        }
      })
      if (countApprove === this.process_map.length) {
        return this.process_map.length + 2
      } else {
        return this.status.open + countApprove
      }
    }
  },
  setup() {
    return useDateTime()
  },
  methods: {
    getAssignees(item) {
      return item.assignees_display || []
    },
    getProcessor(item) {
      if (item.state === 'closed') {
        return this.object.rel_snapshot.applicant
      }
      return item.processor_display
    },
    lookOver(assignees_display) {
      this.dialogAssignees = assignees_display
      this.assigneesDialogVisible = true
    }
  }
}
</script>

<style lang="scss" scoped>
.box {
  margin-bottom: 15px;
}

.ticket-steps {
  padding: 4px 6px 0;
}

.step-description {
  min-width: 0;
  padding-top: 3px;
}

.assignees {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 5px;
  min-height: 24px;
}

.assignee-chip {
  display: inline-block;
  overflow: hidden;
  max-width: 150px;
  padding: 1px 8px;
  color: var(--color-text-regular);
  font-size: 12px;
  line-height: 22px;
  text-overflow: ellipsis;
  white-space: nowrap;
  background: var(--el-fill-color-light);
  border-radius: 12px;
}

.more-assignees {
  height: 24px;
  padding: 0 5px;
  font-size: 12px;
}

.meta-line {
  display: flex;
  gap: 5px;
  min-width: 0;
  line-height: 22px;
}

.meta-label {
  flex: none;
  color: var(--color-help-text);
}

.meta-value {
  overflow: hidden;
  color: var(--color-text-regular);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-value {
  color: var(--color-help-text);
}

.el-steps {
  :deep(.el-step__main) {
    min-width: 0;
    padding-bottom: 18px;
  }

  :deep(.el-step__title) {
    font-size: 14px;
    font-weight: 600;
    line-height: 24px;
  }

  :deep(.el-step__description) {
    padding-right: 0;
    line-height: 22px;
  }

  .el-step__main .el-step__title {
    color: var(--color-text-primary);
  }

  .el-step__main .el-step__description {
    color: var(--color-help-text);
  }
}
</style>
