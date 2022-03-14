<template>
  <Page>
    <IBox>
      <GenericCreateUpdateForm v-bind="$data" />
    </IBox>
  </Page>
</template>

<script>
import { IBox, CronTab } from '@/components'
import { Page, GenericCreateUpdateForm } from '@/layout/components'

export default {
  name: 'Senior',
  components: {
    IBox,
    Page,
    GenericCreateUpdateForm
  },
  data() {
    return {
      url: '/api/v1/settings/setting/?category=other',
      hasDetailInMsg: false,
      fields: [
        [
          this.$t('common.Basic'),
          [
            'EMAIL_SUFFIX'
          ]
        ],
        [
          this.$t('setting.OTP'),
          [
            'OTP_ISSUER_NAME', 'OTP_VALID_WINDOW'
          ]
        ],
        [
          this.$t('setting.Ops'),
          [
            'WINDOWS_SSH_DEFAULT_SHELL'
          ]
        ],
        [
          this.$t('setting.Perm'),
          [
            'PERM_SINGLE_ASSET_TO_UNGROUP_NODE'
          ]
        ]
      ],
      fieldsMeta: {
        AUTH_LDAP_SYNC_CRONTAB: {
          component: CronTab,
          label: this.$t('xpack.RegularlyPerform'),
          helpText: this.$t('xpack.HelpText.CrontabOfCreateUpdatePage')
        },
        HELP_DOCUMENT_URL: {
          label: this.$t('xpack.helpDocument'),
          helpText: this.$t('xpack.helpDocumentTip'),
          hidden: () => !this.hasValidLicense()
        },
        HELP_SUPPORT_URL: {
          label: this.$t('xpack.helpSupport'),
          helpText: this.$t('xpack.helpSupportTip'),
          hidden: () => !this.hasValidLicense()
        }
      },
      submitMethod() {
        return 'put'
      }
    }
  },
  created() {
    if (this.hasValidLicense()) {
      this.fields.push([
        this.$t('xpack.NavHelp'), [
          'HELP_DOCUMENT_URL', 'HELP_SUPPORT_URL'
        ]
      ])
    }
  },
  methods: {
    hasValidLicense() {
      return this.$store.getters.hasValidLicense
    }
  }
}
</script>

<style scoped>

</style>
