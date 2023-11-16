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
  name: 'AccountChangeSecretInfo',
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
            label: this.$t('accounts.AccountChangeSecret.Execute'),
            disabled: !this.$hasPerm('accounts.add_changesecretexecution') || !this.object.is_active
          },
          callbacks: {
            click: function() {
              this.$axios.post(
                `/api/v1/accounts/change-secret-executions/`,
                { automation: this.object.id }
              ).then(res => {
                openTaskPage(res['task'])
              })
            }.bind(this)
          }
        }
      ],
      url: `/api/v1/accounts/change-secret-automations/${this.object.id}`,
      detailFields: [
        'id', 'name',
        {
          key: this.$t('accounts.AccountChangeSecret.Username'),
          value: this.object.accounts.join(', ')
        },
        {
          key: this.$t('accounts.AccountChangeSecret.AssetAmount'),
          value: this.object.assets.length
        },
        {
          key: this.$t('accounts.AccountChangeSecret.NodeAmount'),
          value: this.object.nodes.length
        },
        {
          key: this.$t('accounts.AccountChangeSecret.PasswordStrategy'),
          value: this.object.secret_strategy.label
        },
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
        'date_created', 'date_updated', 'comment', 'is_active'
      ]
    }
  },
  computed: {
  }
}
</script>

<style scoped>

</style>
