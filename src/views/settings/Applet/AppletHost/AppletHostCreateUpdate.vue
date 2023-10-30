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
          [this.$t('common.Automations'), ['deploy_options'], 3],
          [this.$t('assets.Account'), [
            'using_same_account',
            'auto_create_accounts', 'accounts_create_amount']
          ]
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
          domain: {
            hidden: () => {
              return !this.$store.getters.hasValidLicense
            },
            helpText: this.$t('assets.AppletHostDomainHelpText')
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
    this.loading = false
  },
  methods: {}
}
</script>

<style lang="less" scoped>

</style>
