<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'

export default {
  name: 'CheckAccountExecutionInfo',
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
      url: `/api/v1/accounts/check-account-executions/${this.object.id}`,
      detailFields: [
        'id',
        {
          key: this.$t('DisplayName'),
          value: this.object.snapshot.name
        },
        'date_start', 'date_finished', 'duration', 'status'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
