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
  name: 'DatabaseChangeAuthPlanExecutionInfo',
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
          value: this.object.database_name
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.SystemUser'),
          value: this.object.systemusers.join(', ')
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
        }

      ]
    }
  }
}
</script>

<style scoped>

</style>
