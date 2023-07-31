<template>
  <GenericCreateUpdatePage :fields="fields" :fields-meta="fieldsMeta" :has-detail-in-msg="false" :initial="initial" :url="url" />
</template>

<script>
import AssetSelect from '@/components/Apps/AssetSelect'
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
        [this.$t('common.Basic'), ['name', 'value', 'assets']]
      ],
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('assets.Assets')
        }
      },
      url: '/api/v1/assets/labels/'
    }
  }
}
</script>

<style>

</style>
