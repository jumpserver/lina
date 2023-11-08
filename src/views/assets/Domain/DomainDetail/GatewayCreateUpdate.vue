<template>
  <BaseAssetCreateUpdate v-bind="$data" />
</template>

<script>
import BaseAssetCreateUpdate from '@/views/assets/Asset/AssetCreateUpdate/BaseAssetCreateDrawer.vue'

export default {
  name: 'GatewayCreateUpdate',
  components: {
    BaseAssetCreateUpdate
  },
  props: {
    domain: {
      type: String,
      default: ''
    },
    platformType: {
      type: String,
      default: ''
    }
  },
  data() {
    const platformType = this.platformType
    return {
      url: '/api/v1/assets/gateways/',
      updateInitial: async(initial) => {
        const url = `/api/v1/assets/platforms/?name=Gateway`
        const platform = await this.$axios.get(url)
        initial.platform = parseInt(platform[0].id)
        initial.domain = this.domain
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
      }
    }
  },
  methods: {}
}
</script>

<style>
</style>
