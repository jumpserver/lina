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
          key: this.$t('DisplayName'),
          value: this.object.snapshot.name
        },
        {
          key: this.$t('AssetsOfNumber'),
          value: this.object.snapshot.asset_amount
        },
        {
          key: this.$t('NodeOfNumber'),
          value: this.object.snapshot.node_amount
        },
        'trigger_display', 'date_start', 'date_finished',
        {
          key: this.$t('MailRecipient'),
          value: this.object.recipients ? this.object.recipients.map(
            i => `${i[0]}` + `${i[1] ? ': ' + this.$t('ContainAttachment') : ''}`).join(', ') : ''
        },
        {
          key: this.$t('Comment'),
          value: this.object.snapshot.common
        }
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
