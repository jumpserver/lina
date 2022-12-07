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
          [this.$t('common.Automations'), ['deploy_options'], 3]
        ],
        addFieldsMeta: {
          deploy_options: {
            fields: [
              'RDS_Licensing', 'RDS_LicenseServer', 'RDS_LicensingMode',
              'RDS_fSingleSessionPerUser', 'RDS_MaxDisconnectionTime',
              'RDS_RemoteAppLogoffTimeLimit'
            ]
          },
          platform: {
            hidden: () => true
          },
          domain: {
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
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
