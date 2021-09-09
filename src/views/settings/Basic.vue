<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :fields-meta="fieldsMeta"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :submit-method="submitMethod"
      :has-detail-in-msg="false"
      :on-perform-success="onPerformSuccess"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import rules from '@/components/DataForm/rules'

export default {
  name: 'Basic',
  components: {
    GenericCreateUpdateForm,
    IBox
  },
  data() {
    const globalOrgName = this.$store.getters.hasValidLicense ? 'GLOBAL_ORG_DISPLAY_NAME' : null
    return {
      fields: [
        [
          this.$t('common.BasicInfo'), [
            'SITE_URL', 'USER_GUIDE_URL',
            'FORGOT_PASSWORD_URL', globalOrgName
          ]
        ]
      ],
      fieldsMeta: {
        SITE_URL: {
          rules: [
            rules.Required
          ]
        }
      },
      successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
      url: '/api/v1/settings/setting/?category=basic'
    }
  },
  methods: {
    submitMethod() {
      return 'patch'
    },
    onPerformSuccess() {
      setTimeout(() => window.location.reload(), 500)
    }
  }
}
</script>

<style scoped>

</style>
