<template>
  <IBox>
    <div style="height: 350px;">
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
          :title="`${this.$t('tickets.HandleTicket')}`"
          :description="`${this.$t('tickets.Assignees')}：${object.assignees_display}`"
        />
        <el-step
          :title="`${this.$t('tickets.FinishedTicket')}`"
          :description="ticketSteps===STATUS.close ? `${this.$t('tickets.Assignee')}：${object.assignee_display}`:'' "
        >
          <div v-if="ticketSteps===STATUS.close" slot="description">
            <div>{{ `${this.$t('tickets.Assignee')}：${object.processor_display}` }}</div>
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
      STATUS: { open: 2, close: 3 }
    }
  },
  computed: {
    ticketSteps() {
      return this.object.status === 'open' ? this.STATUS.open : this.STATUS.close
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
