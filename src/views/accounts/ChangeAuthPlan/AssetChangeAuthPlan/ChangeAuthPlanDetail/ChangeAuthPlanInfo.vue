<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, QuickActions } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'ChangeAuthPlanInfo',
  components: {
    DetailCard,
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
            disabled: !this.$hasPerm('xpack.add_changeauthplanexecution')
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/xpack/change-auth-plan/plan-execution/`,
                { plan: this.object.id }
              ).then(res => {
                window.open(`/#/ops/celery/task/${res.task}/log/`, '_blank', 'toolbar=yes, width=900, height=600')
              })
            }.bind(this)
          }
        }
      ]
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$t('xpack.ChangeAuthPlan.Name'),
          value: this.object.name
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.Username'),
          value: this.object.username
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.AssetAmount'),
          value: this.object.assets_amount
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.NodeAmount'),
          value: this.object.nodes_amount
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.PasswordStrategy'),
          value: this.object.password_strategy_display
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
        {
          key: this.$t('xpack.ChangeAuthPlan.DateJoined'),
          value: toSafeLocalDateStr(this.object.date_created)
        },
        {
          key: this.$t('xpack.ChangeAuthPlan.DateUpdated'),
          value: toSafeLocalDateStr(this.object.date_updated)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  }
}
</script>

<style scoped>

</style>
