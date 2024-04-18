<template>
  <GenericCreateUpdatePage :fields="fields" :fields-meta="fieldsMeta" :initial="initial" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import AssetSelect from '@/components/Apps/AssetSelect'
import ObjectSelect2 from '@/components/Form/FormFields/NestedObjectSelect2.vue'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      fields: [
        [this.$t('common.Basic'), ['name', 'gateways', 'assets']],
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
        },
        gateways: {
          component: ObjectSelect2,
          el: {
            multiple: true,
            clearable: true,
            ajax: {
              url: '/api/v1/assets/assets/?domain_enabled=true&platform=Gateway'
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
