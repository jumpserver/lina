<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from '@/views/assets/Asset/AssetCreateUpdate/BaseAssetCreateUpdate'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    BaseAssetCreateUpdate
  },
  data() {
    const platformType = this.$route.query.platform_type
    return {
      url: '/api/v1/assets/gateways/',
      updateInitial: async(initial) => {
        const url = `/api/v1/assets/platforms/?name=Gateway`
        const platform = await this.$axios.get(url)
        initial.platform = parseInt(platform[0].id)
        initial.domain = this.$route.query.domain
        return initial
      },
      addFieldsMeta: {
        domain: {
          disabled: true
        },
        platform: {
          disabled: true,
          el: {
            multiple: false,
            ajax: {
              url: `/api/v1/assets/platforms/?type=${platformType}`,
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        }
      },
      createSuccessNextRoute: {
        name: 'DomainDetail',
        params: {
          id: this.$route.query.domain
        },
        query: {
          activeTab: 'GatewayList'
        }
      },
      updateSuccessNextRoute: {
        name: 'DomainDetail',
        params: {
          id: this.$route.query.domain
        },
        query: {
          activeTab: 'GatewayList'
        }
      }
    }
  },
  methods: {}
}
</script>

<style>
</style>
