<template>
  <GenericCreateUpdatePage :fields="fields" :fields-meta="fieldsMeta" :initial="initial" :url="url" />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import AssetSelect from '@/components/Apps/AssetSelect'
import { TextReadonly } from '@/components/Form/FormFields'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      fields: [
        [this.$t('Basic'), ['name', 'gateways', 'assets']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        assets: {
          type: 'assetSelect',
          component: AssetSelect,
          el: {
            value: [],
            baseUrl: '/api/v1/assets/assets/',
            canSelect: (row) => {
              return !row.platform?.name.startsWith('Gateway')
            }
          }
        },
        gateways: {
          component: TextReadonly,
          el: {
            text: this.$t('AddInDetailText'),
            bolder: false
          }
        }
      },
      url: '/api/v1/assets/zones/'
    }
  }
}
</script>
