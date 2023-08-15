<template>
  <IBox>
    <GenericCreateUpdateForm
      :create-success-next-route="successUrl"
      :has-detail-in-msg="false"
      :submit-method="submitMethod"
      :update-success-next-route="successUrl"
      v-bind="$data"
    />
  </IBox>
</template>

<script>
import { IBox } from '@/components'
import rules from '@/components/Form/DataForm/rules'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

export default {
  name: 'Basic',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    return {
      fields: [
        [
          this.$t('common.BasicInfo'), [
            'SITE_URL', // 'USER_GUIDE_URL',
            'GLOBAL_ORG_DISPLAY_NAME'
          ]
        ],
        [this.$t('xpack.NavHelp'), [
          'HELP_DOCUMENT_URL', 'HELP_SUPPORT_URL'
        ]]
      ],
      fieldsMeta: {
        SITE_URL: {
          rules: [rules.Required]
        },
        GLOBAL_ORG_DISPLAY_NAME: {
          hidden: !this.hasValidLicense()
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
      successUrl: { name: 'Basic' },
      url: '/api/v1/settings/setting/?category=basic'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    },
    hasValidLicense() {
      return this.$store.getters.hasValidLicense
    }
  }
}
</script>

<style scoped>
</style>
