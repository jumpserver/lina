<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/DetailCard/auto'

export default {
  name: 'AccountBackupPlanExecutionInfo',
  components: {
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/assets/account-backup-plan-executions/${this.object.id}/`,
      detailFields: [
        {
          key: this.$t('xpack.ChangeAuthPlan.TimeDelta'),
          value: this.object.timedelta.toFixed(2) + 's'
        },
        'date_start', 'is_success', 'reason',
        {
          key: this.$t('xpack.ChangeAuthPlan.MailRecipient'),
          value: this.object.recipients ? this.object.recipients.map(
            i => `${i[0]}` + `${i[1] ? ': ' + this.$t('xpack.ChangeAuthPlan.ContainAttachment') : ''}`).join(', ') : ''
        }
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
