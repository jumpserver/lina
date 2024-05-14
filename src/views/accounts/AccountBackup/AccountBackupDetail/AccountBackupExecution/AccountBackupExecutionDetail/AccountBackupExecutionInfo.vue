<template>
  <el-row :gutter="20">
    <el-col :md="16" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'AccountBackupExecutionInfo',
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
      url: `/api/v1/accounts/account-backup-plan-executions/${this.object.id}/`,
      detailFields: [
        'id',
        {
          key: this.$t('TimeDelta'),
          value: this.object.timedelta.toFixed(2) + 's'
        },
        'date_start', 'is_success', 'reason',
        {
          key: this.$t('MailRecipient'),
          value: this.object.recipients ? this.object.recipients.map(
            i => `${i[0]}` + `${i[1] ? ': ' + this.$t('ContainAttachment') : ''}`).join(', ') : ''
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
