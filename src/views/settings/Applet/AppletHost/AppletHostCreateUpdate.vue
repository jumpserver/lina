<template>
  <BaseAssetCreateUpdate v-if="!loading" v-bind="config" />
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
        addFields: [
          [this.$t('Automation'), ['deploy_options'], 3],
          [this.$t('Account'), ['using_same_account', 'auto_create_accounts', 'accounts_create_amount']]
        ],
        addFieldsMeta: {
          name: {
            rules: [Required, MatchExcludeParenthesis]
          },
          accounts_create_amount: {
            hidden: (formValue) => !formValue['auto_create_accounts']
          },
          using_same_account: {
            readonly: this.$store.getters.publicSettings['CACHE_LOGIN_PASSWORD_ENABLED'] !== true
          },
          deploy_options: {
            fields: [
              'CORE_HOST', 'IGNORE_VERIFY_CERTS', 'RDS_Licensing', 'RDS_LicenseServer',
              'RDS_LicensingMode', 'RDS_fSingleSessionPerUser', 'RDS_MaxDisconnectionTime',
              'RDS_RemoteAppLogoffTimeLimit'
            ],
            fieldsMeta: {
              RDS_LicenseServer: {
                hidden: (formValue) => !formValue['RDS_Licensing']
              },
              RDS_LicensingMode: {
                hidden: (formValue) => !formValue['RDS_Licensing']
              },
              RDS_fSingleSessionPerUser: {
                hidden: (formValue) => !formValue['RDS_Licensing']
              },
              RDS_MaxDisconnectionTime: {
                hidden: (formValue) => !formValue['RDS_Licensing']
              },
              RDS_RemoteAppLogoffTimeLimit: {
                hidden: (formValue) => !formValue['RDS_Licensing']
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
  async mounted() {
    this.$route.query.platform = 'RemoteAppHost'
    this.loading = false
  },
  methods: {}
}
</script>
