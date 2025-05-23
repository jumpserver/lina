<template>
  <IBox>
    <div style="height: 660px;">
      <el-steps :active="ticketSteps" direction="vertical">
        <el-step
          :description="`${this.$t('Applicant')}：${object.rel_snapshot.applicant}`"
          :title="`${this.$t('OpenTicket')}：${object.title}`"
        >
          <div slot="description" class="description">
            <div>{{ `${this.$t('Applicant')}：${object.rel_snapshot.applicant}` }}</div>
            <div>{{ `${this.$t('DateCreated')}: ${toSafeLocalDateStr(object.date_created)}` }}</div>
          </div>
        </el-step>
        <el-step
          v-for="(item, i) in process_map"
          :key="i"
          :title="$tc('HandleTicket')"
        >
          <div slot="description">
            <div class="processors">
              <div class="processors-content">
                <span v-for="assignee of item.assignees_display.slice(0,4)" :key="assignee" style="display: block">
                  {{ assignee }}
                </span>
              </div>
              <el-button v-if="item.assignees.length > 4" type="text" @click="lookOver(item.assignees_display)">
                {{ $tc('CheckViewAcceptor') }}
              </el-button>
            </div>
          </div>
          <div v-if="item.state ==='closed'" slot="description">
            <div>{{ $t('Assignee') }}: {{ object.rel_snapshot.applicant }}</div>
            <div>{{ $t('DateFinished') }}: {{ toSafeLocalDateStr(item.approval_date) }}</div>
          </div>
          <div v-if="item.state !=='pending' && item.state !=='closed'" slot="description">
            <div> {{ $t('Assignee') }}: {{ item.processor_display }}</div>
            <div>{{ $t('DateFinished') }}: {{ toSafeLocalDateStr(item.approval_date) }}</div>
          </div>
        </el-step>
        <el-step
          :title="`${this.$t('FinishedTicket')}`"
        >
          <div v-if="object.status.value === 'closed'" slot="description">
            <div>{{ $t('DateFinished') }}: {{ toSafeLocalDateStr(object.date_updated) }}</div>
          </div>
        </el-step>
      </el-steps>
    </div>
  </IBox>
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/time'
import IBox from '@/components/Common/IBox'
import { STATE_MAP } from '../const'

export default {
  name: 'Steps',
  components: { IBox },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      status: { open: 2, close: 3 },
      process_map: this.object.process_map.sort(
        (a, b) => {
          return a.approval_level - b.approval_level
        }
      ) || [],
      vm: this,
      statusMap: STATE_MAP
    }
  },
  computed: {
    ticketSteps() {
      let countApprove = 0
      this.process_map.forEach(item => {
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
  methods: {
    formatTime(dateStr) {
      return formatTime(getDateTimeStamp(dateStr))
    },
    toSafeLocalDateStr(dataStr) {
      return toSafeLocalDateStr(dataStr)
    },
    lookOver(assignees_display) {
      const h = this.$createElement
      const content = []
      assignees_display.forEach(item => {
        content.push(h('p', null, item),)
      })
      this.$msgbox({
        title: this.$t('RelevantAssignees'),
        customClass: 'acceptance',
        message: h('p', null, content),
        showCancelButton: false,
        showConfirmButton: false
      })
    }
  }
}
</script>

<style>
.acceptance .el-message-box__content {
  overflow-y: auto;
  max-height: 400px;
}
</style>

<style lang='scss' scoped>
.box {
  margin-bottom: 15px;
}

.processors {
  margin-bottom: 10px;
}

.processors-content {
  overflow-y: auto;
  max-height: 400px;
  padding-top: 10px;
  padding-bottom: 10px;
}

.el-steps {
  .el-step__main .el-step__title {
    color: var(--color-text-primary);
  }

  .el-step__main .el-step__description {
    color: var(--color-help-text);
  }
}
</style>
