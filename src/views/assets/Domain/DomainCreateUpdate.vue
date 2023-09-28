<template>
  <GenericCreateUpdateDrawer
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
    v-bind="$attrs"
    v-on="$listeners"
  />
</template>

<script>
import GenericCreateUpdateDrawer from '@/layout/components/GenericCreateUpdateDrawer'
import AssetSelect from '@/components/Apps/AssetSelect'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdateDrawer
  },
  data() {
    return {
      initial: {},
      fields: [
        [this.$t('common.Basic'), ['name', 'assets']],
        [this.$t('common.Other'), ['comment']]
      ],
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          label: this.$t('assets.Assets'),
          el: {
            value: [],
            baseUrl: '/api/v1/assets/assets/?domain_enabled=true',
            treeUrlQuery: {
              domain_enabled: true
            },
            canSelect: (row) => {
              return row.platform?.name !== 'Gateway'
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
