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
