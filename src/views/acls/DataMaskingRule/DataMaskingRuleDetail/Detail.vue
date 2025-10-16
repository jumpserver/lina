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
      url: `/api/v1/acls/data-masking-rules/${this.object.id}/`,
      detailFields: [
        'name', 'fields_pattern', 'masking_method', 'mask_pattern',
        'priority', 'date_created', 'created_by', 'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style lang="less" scoped>

</style>
