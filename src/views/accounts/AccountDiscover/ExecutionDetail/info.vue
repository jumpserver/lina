<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'ExecutionDetailInfo',
  components: {
    AutoDetailCard,
    TwoCol
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      url: `/api/v1/accounts/gather-account-executions/${this.object.id}/`,
      detailFields: [
        'id', 'status', 'trigger_display', 'date_start', 'date_finished'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
