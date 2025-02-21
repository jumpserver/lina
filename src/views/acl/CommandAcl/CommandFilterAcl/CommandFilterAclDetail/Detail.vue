<template>
  <TwoCol>
    <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
  </TwoCol>
</template>

<script>
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'CommandFilterAclDetail',
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
      url: `/api/v1/acls/command-filter-acls/${this.object.id}/`,
      detailFields: [
        'name',
        {
          key: this.$t('CommandGroup'),
          value: this.object.command_groups.map((item) => item.name).join(', ')
        },
        {
          key: this.$t('Action'),
          value: this.object.action?.label
        },
        (this.object.action?.value === 'review' && {
          key: this.$t('Reviewer'),
          value: this.object?.reviewers.map((item) => item?.name).join(', ')
        }),
        'priority', 'is_active', 'comment'
      ]
    }
  },
  computed: {}
}
</script>

<style scoped>

</style>
