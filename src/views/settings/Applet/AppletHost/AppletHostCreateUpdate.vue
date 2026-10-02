<template>
  <BaseAssetCreateUpdate v-bind="config" v-if="!loading" />
</template>

<script>
import BaseAssetCreateUpdate from '@/views/assets/Asset/AssetCreateUpdate/BaseAssetCreateUpdate'
import { MatchExcludeParenthesis, Required } from '@/components/Form/DataForm/rules'

export default {
  components: {
    BaseAssetCreateUpdate
  },
  data() {
    return {
      loading: true,
      config: {
        url: '/api/v1/terminal/applet-hosts/',
        addFields: [[this.$t('Automation'), ['deploy_options'], 3]],
        addFieldsMeta: {
          name: {
            rules: [Required, MatchExcludeParenthesis]
          },
          deploy_options: {
            fields: ['CORE_HOST', 'IGNORE_VERIFY_CERTS', 'RDS_LICENSE_SERVER'],
            fieldsMeta: {
              RDS_LICENSE_SERVER: {
                helpText: this.$t('AppletHostRDSLicenseServerHelpText'),
                helpTextAsTip: false
              }
            }
          },
          platform: {
            hidden: () => true
          },
          zone: {
            hidden: () => {
              return !this.$store.getters.hasValidLicense
            },
            helpText: this.$t('AppletHostZoneHelpText')
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
  async created() {
    this.config.url = `${this.config.url}?platform=RemoteAppHost`
    this.loading = false
  },
  methods: {}
}
</script>
