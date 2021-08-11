<template>
  <IBox>
    <div style="height: 480px;">
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
          <div v-if="item.action!=='open'" slot="description">
            <div>{{ `${thisCopy.$t('tickets.Assignee')}：${item.processor_display}` }}</div>
            <div>{{ `${thisCopy.$t('common.dateFinished')}:  ${toSafeLocalDateStr(item.approval_date)}` }}</div>
          </div>
          <div slot="description">{{ `${thisCopy.$t('tickets.Assignees')}：${item.assignees_display}` }}</div>
        </el-step>
        <el-step
          :title="`${this.$t('tickets.FinishedTicket')}`"
        >
          <div slot="description">
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
      countAll: this.object.process.length + 2,
      STATUS: { open: 2, close: 3 },
      process: this.object.process,
      thisCopy: this
    }
  },
  computed: {
    ticketSteps() {
      if (this.object.status === 'closed') {
        return this.countAll
      } else if (this.object.process.length === 1) {
        return this.STATUS.open
      } else {
        this.object.process.forEach(i => {
          if (i.action !== 'open') {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.STATUS.open = this.STATUS.open + 1
          }
        })
        return this.STATUS.open
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
