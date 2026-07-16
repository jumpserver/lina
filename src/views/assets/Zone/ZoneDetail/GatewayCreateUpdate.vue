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
  props: {
    zone: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const getZoneId = () => this.zone.id || this.$route.query.zone

    return {
      url: '/api/v1/assets/gateways/',
      updateInitial: async (initial) => {
        const url = `/api/v1/assets/platforms/?name__startswith=Gateway`
        const platform = await this.$axios.get(url)
        initial.platform = parseInt(platform[0].id)
        initial.zone = getZoneId()
        return initial
      },
      addFieldsMeta: {
        zone: {
          disabled: true
        },
        platform: {
          helpText: this.$t('GatewayPlatformHelpText'),
          el: {
            multiple: false,
            ajax: {
              url: `/api/v1/assets/platforms/?name__startswith=Gateway`,
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          }
        }
      },
      createSuccessNextRoute: {
        name: 'ZoneDetail',
        params: {
          id: getZoneId()
        },
        query: {
          tab: 'GatewayList'
        }
      },
      updateSuccessNextRoute: {
        name: 'ZoneDetail',
        params: {
          id: getZoneId()
        },
        query: {
          tab: 'GatewayList'
        }
      }
    }
  },
  methods: {}
}
</script>
