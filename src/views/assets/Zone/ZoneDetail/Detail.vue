<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'Detail',
  components: {
    TwoCol,
    AutoDetailCard
  },
  props: {
    object: {
      type: Object,
      default: () => {
      }
    }
  },
  data() {
    return {
      url: `/api/v1/assets/zones/${this.object.id}/`,
      detailFields: [
        'name', 'assets_amount',
        {
          key: this.$t('Gateway'),
          value: `${this.object.gateways.length}`
        },
        'date_created', 'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style lang='less' scoped>

</style>
