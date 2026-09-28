<template>
  <GenericCreateUpdatePage
    :fields="fields"
    :fields-meta="fieldsMeta"
    :initial="initial"
    :url="url"
  />
</template>

<script>
import GenericCreateUpdatePage from '@/layout/components/GenericCreateUpdatePage'
import { ResourceSelect, TextReadonly } from '@/components/Form/FormFields'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: { cidrs: [], auto_assign: false },
      fields: [
        [this.$t('Basic'), ['name', 'gateways', 'assets']],
        [this.$t('ZoneAssetMatching'), ['cidrs', 'auto_assign']],
        [this.$t('Other'), ['comment']]
      ],
      fieldsMeta: {
        cidrs: {
          label: this.$t('CIDRRanges'),
          helpText: this.$t('ZoneCIDRHelp'),
          el: { placeholder: '192.168.1.0/24' }
        },
        auto_assign: {
          label: this.$t('ZoneAutoAssign'),
          helpText: this.$t('ZoneAutoAssignHelp')
        },
        assets: {
          type: 'resourceSelect',
          component: ResourceSelect,
          el: {
            value: [],
            url: '/api/v1/assets/assets/',
            resourceName: this.$t('Assets'),
            nodeFilter: {
              treeUrl: '/api/v1/assets/nodes/children/tree/?asset_amount=0&all=all',
              typeTreeUrl: '/api/v1/assets/nodes/category/tree/?count_resource=none',
              includeDescendants: true
            },
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
