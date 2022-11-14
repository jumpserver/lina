<template>
  <IBox>
    <div style="height: 540px;">
      <el-steps direction="vertical" :active="ticketSteps">
        <el-step
          :title="`${this.$t('tickets.OpenTicket')}：${object.title}`"
          :description="`${this.$t('tickets.Applicant')}：${object.rel_snapshot.applicant}`"
        >
          <div slot="description" class="description">
            <div>{{ `${this.$t('tickets.Applicant')}：${object.rel_snapshot.applicant}` }}</div>
            <div>{{ `${this.$t('common.DateCreated')}:  ${toSafeLocalDateStr(object.date_created)}` }}</div>
          </div>
        </el-step>
        <el-step
          v-for="(item, i) in process_map"
          :key="i"
          :title="$tc('tickets.HandleTicket')"
        >
          <div slot="description">
            <div style="padding-top: 15px">
              <span v-for="assignee of item.assignees_display" :key="assignee" style="display: block">
                {{ assignee }}
              </span>
            </div>
            <el-button v-if="item.assignees_display.length > 5" type="text" @click="lookOver(item.assignees_display)">
              {{ $tc('tickets.CheckViewAcceptor') }}
            </el-button>
          </div>
          <div v-if="item.state.value ==='closed'" slot="description">
            <div>{{ $t('tickets.Assignee') }}：{{ object.rel_snapshot.applicant }}</div>
            <div>{{ $t('common.dateFinished') }}:  {{ toSafeLocalDateStr(item.approval_date) }}</div>
          </div>
          <div v-if="item.state.value !=='pending' && item.state.value !=='closed'" slot="description">
            <div> {{ $t('tickets.Assignee') }}：{{ item.processor_display }}</div>
            <div>{{ $t('common.dateFinished') }}: {{ toSafeLocalDateStr(item.approval_date) }}</div>
          </div>
        </el-step>
        <el-step
          :title="`${this.$t('tickets.FinishedTicket')}`"
        >
          <div v-if="object['status'].value === 'closed'" slot="description">
            <div>{{ `${this.$t('common.dateFinished')}:  ${toSafeLocalDateStr(object.date_updated)}` }}</div>
          </div>
        </el-step>
      </el-steps>
    </div>
  </IBox>
</template>

<script>
import { formatTime, getDateTimeStamp } from '@/utils/index'
import { toSafeLocalDateStr } from '@/utils/common'
import IBox from '@/components/IBox'
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
      STATUS: { open: 2, close: 3 },
      process_map: this.object.process_map || [],
      vm: this,
      statusMap: STATE_MAP
    }
  },
  computed: {
    ticketSteps() {
      let countApprove = 0
      // this.process_map.sort((a, b) => a.approval_level - b.approval_level)
      // return []
      this.process_map.forEach(item => {
        if (item.state === 'approved') {
          countApprove += 1
        }
      })
      if (countApprove === this.process_map.length) {
        //   // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        return this.process_map.length + 2
      } else {
        return this.STATUS.open + countApprove
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
        title: '相关受理人',
        message: h('p', null, content),
        showCancelButton: false,
        showConfirmButton: false
      })
    }
  }
}
</script>

<style lang='less' scoped>
.box {
  margin-bottom: 15px;
}
</style>
