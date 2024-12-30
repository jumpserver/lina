<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script type="text/jsx">
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  components: {
    TwoCol,
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
      url: `/api/v1/ops/jobs/${this.object.id}/`,
      detailFields: [
        'name', 'type', 'comment',
        {
          key: this.$t('AverageTimeCost'),
          value: this.object.average_time_cost.toFixed(2) + 's'
        },
        'date_last_run', 'date_updated', 'date_created'
      ]
    }
  },
  computed: {
    cardTitle() {
      return this.object.name
    }
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
