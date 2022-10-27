<template>
  <BaseAssetCreateUpdate v-if="!loading" v-bind="config" />
</template>

<script>
import BaseAssetCreateUpdate from '@/views/assets/Asset/AssetCreateUpdate/BaseAssetCreateUpdate'
export default {
  components: {
    BaseAssetCreateUpdate
  },
  data() {
    return {
      loading: true,
      config: {
        url: '/api/v1/terminal/applet-hosts/?oid=RemoteAppHost',
        addFields: [
          [this.$t('assets.Account'), ['account_automation']]
        ],
        addFieldsMeta: {
          platform: {
            hidden: () => true
          },
          nodes: {
            hidden: () => true
          },
          labels: {
            hidden: () => true
          }
        },
        createSuccessNextRoute: { name: 'Applets' },
        updateSuccessNextRoute: { name: 'Applets' }
      }
    }
  },
  async mounted() {
    const platform = await this.$axios.get('/api/v1/assets/platforms/RemoteAppHost/')
    this.$route.query.platform = platform['id']
    this.$route.query.oid = 'SYSTEM'
    this.loading = false
  },
  methods: {
  }
}
</script>

<style lang="less" scoped>

</style>
