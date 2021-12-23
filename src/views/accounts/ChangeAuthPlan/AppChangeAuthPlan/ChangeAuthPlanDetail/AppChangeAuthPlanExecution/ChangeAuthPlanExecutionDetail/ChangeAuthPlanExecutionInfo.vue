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
  name: 'AppChangeAuthPlanExecutionInfo',
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
          key: this.$t('xpack.ChangeAuthPlan.Database'),
          value: this.object.apps_display.join(', ')
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.SystemUser'),
          value: this.object.system_users_display.join(', ')
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.AppAmount'),
          value: this.object.apps_amount
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.SystemUserAmount'),
          value: this.object.system_users_amount
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.PasswordStrategy'),
          value: this.object.password_strategy_display
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
          value: this.object.timedelta.toFixed(2) + 's'
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.DateStart'),
          value: toSafeLocalDateStr(this.object.date_start)
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
