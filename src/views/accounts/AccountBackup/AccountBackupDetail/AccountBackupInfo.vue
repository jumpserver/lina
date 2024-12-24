<template>
  <el-row :gutter="20">
    <el-col :md="15" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="9" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountBackupInfo',
  components: {
    AutoDetailCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      required: true,
      default: () => ({})
    }
  },
  isEmail: false,

  data() {
    this.isEmail = this.object.backup_type.value === 'email'
    return {
      quickActions: [
        {
          title: this.$t('ManualExecution'),
          attrs: {
            type: 'primary',
            label: this.$t('Execute')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/accounts/account-backup-plan-executions/`,
                { plan: this.object.id }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/account-backup-plans/${this.object.id}/`,
      detailFields: [
        'id', 'name', 'backup_type',
        {
          key: this.$t('Crontab'),
          value: this.object.crontab,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : '-'}</span>
          }
        },
        {
          key: this.$t('Interval'),
          value: this.object.interval,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : '-'}</span>
          }
        },
        {
          key: this.$t('Recipient') + ' A',
          value: this.object.recipients_part_one,
          formatter: (item, val) => {
            const recipientA = this.isEmail ? val.map(item => item.name).join(', ') : '-'
            return <span>{recipientA}</span>
          }
        },
        {
          key: this.$t('Recipient') + ' B',
          value: this.object.recipients_part_two,
          formatter: (item, val) => {
            const recipientB = this.isEmail ? val.map(item => item.name).join(', ') : '-'
            return <span>{recipientB}</span>
          }
        },
        {
          key: this.$t('RecipientServer') + ' A',
          value: this.object.obj_recipients_part_one,
          formatter: (item, val) => {
            const recipientServerA = this.isEmail ? '-' : val.map(item => item.name).join(', ')
            return <span>{recipientServerA}</span>
          }
        },
        {
          key: this.$t('RecipientServer') + ' B',
          value: this.object.obj_recipients_part_two,
          formatter: (item, val) => {
            const recipientServerB = this.isEmail ? '-' : val.map(item => item.name).join(', ')
            return <span>{recipientServerB}</span>
          }
        },
        'date_created', 'date_updated', 'is_active', 'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
