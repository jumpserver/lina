<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :url="url" :fields="detailFields" :object="object" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import { QuickActions } from '@/components'
import AutoDetailCard from '@/components/DetailCard/auto'

export default {
  name: 'ChangeSecreAtutomationInfo',
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
          title: this.$t('xpack.ChangeAuthPlan.ManualExecutePlan'),
          attrs: {
            type: 'primary',
            label: this.$t('xpack.ChangeAuthPlan.Execute'),
            disabled: !this.$hasPerm('assets.add_changesecretexection')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/assets/change-secret-executions/`,
                { plan: this.object.id }
              ).then(res => {
                window.open(`/#/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/assets/change-secret-automations/${this.object.id}`,
      detailFields: [
        'name',
        {
          key: this.$t('xpack.ChangeAuthPlan.Username'),
          value: this.object.accounts.join(', ')
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.AssetAmount'),
          value: this.object.assets.length
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.NodeAmount'),
          value: this.object.nodes.length
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.PasswordStrategy'),
          value: this.object.secret_strategy.label
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.RegularlyPerform'),
          value: this.object.crontab,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : ''}</span>
          }
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.CyclePerform'),
          value: this.object.interval,
          formatter: (item, val) => {
            return <span>{this.object.is_periodic ? val : ''}</span>
          }
        },
        'date_created', 'date_updated', 'comment'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
