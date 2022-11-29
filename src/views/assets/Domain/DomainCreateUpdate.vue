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
        [this.$t('common.Basic'), ['name', 'nodes', 'assets', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('assets.Assets'),
          el: {
            value: []
          }
        },
        nodes: {
          el: {
            value: [],
            ajax: {
              url: '/api/v1/assets/nodes/',
              transformOption: (item) => {
                return { label: item.full_value, value: item.id }
              }
            }
          }
        }
      },

      url: '/api/v1/assets/domains/'
    }
  }
}
</script>

<style>

</style>
