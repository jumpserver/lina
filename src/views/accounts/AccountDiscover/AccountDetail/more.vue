<template>
  <TwoCol>
    <AutoDetailCard :object="detail" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
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
      url: `/api/v1/accounts/gathered-accounts/${this.object.id}/details/`,
      detail: this.object?.detail
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
