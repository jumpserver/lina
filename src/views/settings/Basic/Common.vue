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
        [this.$t('Basic'), ['SITE_URL']], // 'USER_GUIDE_URL',]
        [this.$t('Navigation'), ['HELP_DOCUMENT_URL', 'HELP_SUPPORT_URL']]
      ],
      fieldsMeta: {
        SITE_URL: {
          rules: [rules.Required],
          helpText: this.$t('SiteURLTip')
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
    noValidLicense() {
      return !this.$store.getters.hasValidLicense
    }
  }
}
</script>

<style scoped>
</style>
