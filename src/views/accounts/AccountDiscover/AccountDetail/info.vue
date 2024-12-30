<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'

export default {
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
      url: `/api/v1/accounts/gathered-accounts/${this.object.id}/`,
      detailFields: [
        'id', 'username',
        'date_last_login', 'address_last_login',
        'remote_present', 'present',
        'date_updated', 'status'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
