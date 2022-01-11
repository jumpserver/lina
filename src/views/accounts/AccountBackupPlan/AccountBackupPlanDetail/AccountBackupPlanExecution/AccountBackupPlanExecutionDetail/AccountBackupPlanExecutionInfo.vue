<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'AccountBackupPlanExecutionInfo',
  components: {
    DetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
          value: this.object.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.DateStart'),
          value: toSafeLocalDateStr(this.object.date_start)
        },
        {
          key: this.$t('xpack.AccountBackupPlan.IsSuccess'),
          value: this.object.is_success
        },
        {
          key: this.$t('xpack.AccountBackupPlan.Reason'),
          value: this.object.reason
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.MailRecipient'),
          value: this.object.recipients ? this.object.recipients.map(
            i => `${i[0]}` + `${i[1] ? ': ' + this.$t('xpack.ChangeAuthPlan.ContainAttachment') : ''}`).join(', ') : ''
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
