<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    <AutoDetailCard v-bind="moreConfig" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AccountDiscoverInfo',
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
      url: `/api/v1/accounts/gathered-accounts/${this.object.id}/`,
      detailFields: [
        'id', 'username',
        'date_last_login', 'address_last_login',
        'remote_present', 'present',
        'date_updated', 'status'
      ],
      moreConfig: {
        url: `/api/v1/accounts/gathered-accounts/${this.object.id}/details/`,
        title: this.$t('More'),
        object: this.object,
        nested: 'detail',
        showUndefined: false
      }
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
