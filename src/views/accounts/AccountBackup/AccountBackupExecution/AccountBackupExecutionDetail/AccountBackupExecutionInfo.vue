<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'AccountBackupExecutionInfo',
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
      url: `/api/v1/accounts/account-backup-plan-executions/${this.object.id}/`,
      detailFields: [
        'id',
        {
          key: this.$t('DisplayName'),
          value: this.object.snapshot.name
        },
        'date_start', 'date_finished', 'duration', 'status'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
