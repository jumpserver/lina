<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :initial="object"
      :update-success-next-route="successUrl"
      :create-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="object"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
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
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      selectFields: ['SITE_URL', 'USER_GUIDE_URL', 'EMAIL_SUBJECT_PREFIX'],
      successUrl: { name: 'Settings', params: { activeMenu: 'Basic' }},
      fieldsMeta: {
        SITE_URL: {
          label: this.$t('setting.siteUrl'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.siteUrl')
        },
        USER_GUIDE_URL: {
          label: this.$t('setting.userGuideUrl'),
          helpText: this.$t('setting.helpText.userGuideUrl')
        },
        EMAIL_SUBJECT_PREFIX: {
          label: this.$t('setting.emailSubjectPrefix'),
          rules: [
            { required: true }
          ],
          helpText: this.$t('setting.helpText.emailSubjectPrefix')
        }
      },
      url: '/api/v1/settings/setting/'
    }
  },
  methods: {
    cleanFormValue(data) {
      return {
        basic: data
      }
    },
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
