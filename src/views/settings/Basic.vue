<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :get-method="getMethod"
      :has-detail-in-msg="false"
      :on-perform-success="onPerformSuccess"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
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
            'SITE_URL', 'RDP_ADDR', 'USER_GUIDE_URL',
            'FORGOT_PASSWORD_URL', globalOrgName
          ]
        ]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
      url: '/api/v1/settings/setting/?category=basic'
    }
  },
  methods: {
    getMethod() {
      return 'put'
    },
    onPerformSuccess() {
      setTimeout(() => window.location.reload(), 500)
    }
  }
}
</script>

<style scoped>

</style>
