<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :fields-meta="fieldsMeta"
    :has-detail-in-msg="false"
    :initial="initial"
    :url="url"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'

export default {
  name: 'LabelCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
      },
      fields: [
        [this.$t('Basic'), ['name', 'value']],
        [this.$t('Other'), ['comment']]
      ],
      url: '/api/v1/labels/labels/',
      fieldsMeta: {}
    }
  }
}
</script>

<style>

</style>
