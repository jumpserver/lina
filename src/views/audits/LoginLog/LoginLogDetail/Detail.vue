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
      url: `/api/v1/audits/login-logs/${this.object.id}`,
      detailFields: [
        'id', 'username', 'city', 'ip', 'backend_display', 'reason_display', 'status', 'type', 'user_agent', 'datetime'
      ]
    }
  },
  computed: {}
}
</script>

<style lang="scss" scoped>
</style>
