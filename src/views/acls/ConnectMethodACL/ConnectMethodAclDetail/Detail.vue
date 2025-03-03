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
      url: `/api/v1/acls/connect-method-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('Action'),
          value: this.object.action.label
        },
        {
          key: this.$t('Reviewer'),
          value: this.object.reviewers.map(item => item.name).join(', ')
        },
        'priority', 'date_created', 'created_by', 'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style lang='less' scoped>

</style>
