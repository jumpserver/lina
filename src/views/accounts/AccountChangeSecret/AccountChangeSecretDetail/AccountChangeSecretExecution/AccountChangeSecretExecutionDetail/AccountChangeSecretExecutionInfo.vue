<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
  </el-row>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'AccountChangeSecretExecutionInfo',
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
      url: `/api/v1/accounts/change-secret-executions/${this.object.id}`,
      detailFields: [
        'id',
        {
          key: this.$t('common.DisplayName'),
          value: this.object.snapshot.name
        },
        {
          key: this.$t('accounts.AccountChangeSecret.AssetAmount'),
          value: this.object.snapshot.asset_amount
        },
        {
          key: this.$t('accounts.AccountChangeSecret.NodeAmount'),
          value: this.object.snapshot.node_amount
        },
        'trigger_display', 'date_start', 'date_finished',
        {
          key: this.$t('accounts.AccountChangeSecret.MailRecipient'),
          value: this.object.recipients ? this.object.recipients.map(
            i => `${i[0]}` + `${i[1] ? ': ' + this.$t('accounts.AccountChangeSecret.ContainAttachment') : ''}`).join(', ') : ''
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.snapshot.common
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
