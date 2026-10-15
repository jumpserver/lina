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
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/assets/zones/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('CIDRRanges'),
          value: (this.object.cidrs || []).join(', ') || '-'
        },
        {
          key: this.$t('ZoneAutoAssign'),
          value: this.object.auto_assign ? this.$t('Yes') : this.$t('No')
        },
        'assets_amount',
        {
          key: this.$t('Gateway'),
          value: `${this.object.gateways.length}`
        },
        'date_created',
        'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style lang="scss" scoped></style>
