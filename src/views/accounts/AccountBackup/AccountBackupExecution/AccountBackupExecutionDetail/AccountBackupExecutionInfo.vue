<template>
  <el-row :gutter="20">
    <el-col :md="20" :sm="24" class="detail-right-quick-actions">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'

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
    this.isEmail = this.object.snapshot.backup_type === 'email'
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
          key: this.$t('Recipient') + ' A',
          value: this.object.snapshot.recipients_part_one,
          formatter: (item, val) => {
            const recipientA = this.isEmail ? Object.values(val).map(item => item[0].split('(')[0]).join(', ') : '-'
            return <span>{recipientA}</span>
          }
        },
        {
          key: this.$t('Recipient') + ' B',
          value: this.object.snapshot.recipients_part_two,
          formatter: (item, val) => {
            const recipientB = this.isEmail ? Object.values(val).map(item => item[0].split('(')[0]).join(', ') : '-'
            return <span>{recipientB}</span>
          }
        },
        {
          key: this.$t('RecipientServer') + ' A',
          value: this.object.snapshot.obj_recipients_part_one,
          formatter: (item, val) => {
            const recipientServerA = this.isEmail ? Object.values(val).map(item => item[0]).join(', ') : '-'
            return <span>{recipientServerA}</span>
          }
        },
        {
          key: this.$t('RecipientServer') + ' B',
          value: this.object.snapshot.obj_recipients_part_two,
          formatter: (item, val) => {
            const recipientServerB = this.isEmail ? Object.values(val).map(item => item[0]).join(', ') : '-'
            return <span>{recipientServerB}</span>
          }
        }
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
