<template>
  <IBox>
    <div style="height: 350px;">
      <el-steps direction="vertical" :active="ticketStatus">
        <el-step
          :title="`${this.$t('tickets.OpenTicket')}：${object.type_display}`"
          :description="`${this.$t('tickets.Applicant')}：${object.user_display}`"
        />
        <el-step
          :title="`${this.$t('tickets.HandleTicket')}`"
          :description="`${this.$t('tickets.Assignees')}：${object.assignees_display}`"
        />
        <el-step
          :title="`${this.$t('tickets.FinishedTicket')}`"
          :description="`${this.$t('tickets.Assignee')}：${object.assignee_display}`"
        />
      </el-steps>
    </div>
  </IBox>
</template>

<script>
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
    return {}
  },
  computed: {
    ticketStatus() {
      return this.object.status === 'open' ? 2 : 3
    }
  }
}
</script>

<style lang='less' scoped>
.box {
  margin-bottom: 15px;
}
</style>
