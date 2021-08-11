<template>
  <IBox>
    <div style="height: 660px;">
      <el-steps direction="vertical" :active="ticketSteps">
        <el-step
          :title="`${this.$t('tickets.OpenTicket')}：${object.type_display}`"
          :description="`${this.$t('tickets.Applicant')}：${object.user_display}`"
        >
          <div slot="description">
            <div>{{ `${this.$t('tickets.Applicant')}：${object.applicant_display}` }}</div>
            <div>{{ `${this.$t('common.dateCreated')}:  ${toSafeLocalDateStr(object.date_created)}` }}</div>
          </div>
        </el-step>
        <el-step
          v-for="(item, i) in process"
          :key="i"
          :title="`${thisCopy.$t('tickets.HandleTicket')}`"
        >
          <div slot="description">
            <el-tag :type="`${thisCopy.statusMap[item.state].type}`"> {{ `${thisCopy.statusMap[item.state].title}` }} </el-tag>
          </div>
          <div v-if="item.state==='closed'" slot="description" style="color: blue">
            <div>{{ `${thisCopy.$t('tickets.Assignee')}：${object.applicant_display}` }}</div>
            <div>{{ `${thisCopy.$t('common.dateFinished')}:  ${toSafeLocalDateStr(item.approval_date)}` }}</div>
          </div>
          <div v-if="item.state!=='notified' && item.state!=='closed'" slot="description" style="color: blue">
            <div>{{ `${thisCopy.$t('tickets.Assignee')}：${item.processor_display}` }}</div>
            <div>{{ `${thisCopy.$t('common.dateFinished')}:  ${toSafeLocalDateStr(item.approval_date)}` }}</div>
          </div>
          <div slot="description">{{ `${thisCopy.$t('tickets.Assignees')}：${item.assignees_display}` }}</div>
        </el-step>
        <el-step
          :title="`${this.$t('tickets.FinishedTicket')}`"
        >
          <div v-if="thisCopy.isFinish===1" slot="description">
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
      process: this.object.process_map,
      thisCopy: this,
      statusMap: STATE_MAP,
      isFinish: 0
    }
  },
  computed: {
    ticketSteps() {
      // eslint-disable-next-line no-unused-vars
      var countApprove = 0
      this.process.forEach(item => {
        // eslint-disable-next-line space-before-blocks
        if (item.state === 'approved'){
          countApprove += 1
        }
      })
      if (countApprove === process.length) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.isFinish = 1
        return process.length + 2
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
    }
  }
}
</script>

<style lang='less' scoped>
.box {
  margin-bottom: 15px;
}
</style>
