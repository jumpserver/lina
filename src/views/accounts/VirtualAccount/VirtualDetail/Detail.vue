<template>
  <TwoCol>
    <AutoDetailCard :object="object" v-bind="detail" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
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
      detail: {
        url: '/api/v1/accounts/virtual-accounts/'
      }
    }
  }
}
</script>
