<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'

export default {
  name: 'AccountPushExecutionInfo',
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
      url: `/api/v1/accounts/push-account-executions/${this.object.id}`,
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
