<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountBackupPlanInfo',
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
  data() {
    return {
      quickActions: [
        {
          title: this.$t('accounts.AccountChangeSecret.ManualExecutePlan'),
          attrs: {
            type: 'primary',
            label: this.$t('accounts.AccountChangeSecret.Execute')
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
        'id', 'name',
        {
          key: this.$t('accounts.AccountChangeSecret.RegularlyPerform'),
          value: this.object.crontab,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : ''}</span>
          }
        },
        {
          key: this.$t('accounts.AccountChangeSecret.CyclePerform'),
          value: this.object.interval,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : ''}</span>
          }
        },
        'date_created', 'date_updated', 'comment',
        {
          key: this.$t('accounts.AccountChangeSecret.Addressee') + ' A',
          value: this.object.recipients_part_one,
          formatter: (item, val) => {
            return <span>{val.map(item => item.name).join(', ')}</span>
          }
        },
        {
          key: this.$t('accounts.AccountChangeSecret.Addressee') + ' B',
          value: this.object.recipients_part_two,
          formatter: (item, val) => {
            return <span>{val.map(item => item.name).join(', ')}</span>
          }
        },
        {
          key: this.$t('accounts.AccountBackup.RecipientServer') + ' A',
          value: this.object.obj_recipients_part_one,
          formatter: (item, val) => {
            return <span>{val.map(item => item.name).join(', ')}</span>
          }
        },
        {
          key: this.$t('accounts.AccountBackup.RecipientServer') + ' B',
          value: this.object.obj_recipients_part_two,
          formatter: (item, val) => {
            return <span>{val.map(item => item.name).join(', ')}</span>
          }
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
