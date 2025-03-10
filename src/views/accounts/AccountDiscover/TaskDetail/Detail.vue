<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto.vue'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
import { toSafeLocalDateStr } from '@/utils/time'

export default {
  name: 'Detail',
  components: {
    AutoDetailCard,
    TwoCol
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
      url: `/api/v1/accounts/gather-account-automations/${this.object.id}/`,
      detailFields: [
        'id', 'name', 'is_periodic',
        {
          key: this.$t('Crontab'),
          value: this.object?.periodic_display || '-'
        },
        {
          key: this.$t('DateLastSync'),
          value: this.object.last_execution_date ? toSafeLocalDateStr(this.object.last_execution_date) : '-'
        },
        {
          key: this.$t('DateCreated'),
          value: this.object.date_created ? toSafeLocalDateStr(this.object.date_created) : '-'
        },
        'comment'
      ]
    }
  },
  computed: {},
  mounted() {

  },
  methods: {}
}
</script>

<style lang='less' scoped>

</style>
