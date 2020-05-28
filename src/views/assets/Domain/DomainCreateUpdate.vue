<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import AssetSelect from '@/components/AssetSelect'
export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {

      },
      fields: [
        ['', ['name', 'assets', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: '资产',
          rules: [{
            required: false
          }]
        }
      },

      url: '/api/v1/assets/domains/'
    }
  }
}
</script>

<style>

</style>
