<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="selectFields"
      :url="url"
      :initial="object"
      :update-success-next-route="successUrl"
      :clean-form-value="cleanFormValue"
      :object="object"
      :fields-meta="fieldsMeta"
      :get-method="getMethod"
      :has-detail-in-msg="false"
    />
  </IBox>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
export default {
  name: 'EmailContent',
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
      selectFields: [
        [this.$t('setting.createUserSetting'), ['EMAIL_CUSTOM_USER_CREATED_SUBJECT', 'EMAIL_CUSTOM_USER_CREATED_HONORIFIC',
          'EMAIL_CUSTOM_USER_CREATED_BODY', 'EMAIL_CUSTOM_USER_CREATED_SIGNATURE']]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {
        EMAIL_CUSTOM_USER_CREATED_SUBJECT: {
          label: this.$t('setting.emailCustomUserCreatedSubject'),
          helpText: this.$t('setting.helpText.emailCustomUserCreatedSubject')
        },
        EMAIL_CUSTOM_USER_CREATED_HONORIFIC: {
          label: this.$t('setting.emailCustomUserCreatedHonorific'),
          helpText: this.$t('setting.helpText.emailCustomUserCreatedHonorific')
        },
        EMAIL_CUSTOM_USER_CREATED_BODY: {
          label: this.$t('setting.emailCustomUserCreatedBody'),
          el: {
            type: 'textarea'
          },
          helpText: this.$t('setting.helpText.emailCustomUserCreatedBody')
        },
        EMAIL_CUSTOM_USER_CREATED_SIGNATURE: {
          label: this.$t('setting.emailCustomUserCreatedSignature'),
          helpText: this.$t('setting.helpText.emailCustomUserCreatedSignature')
        }
      },
      url: '/api/v1/settings/setting/'
    }
  },
  methods: {
    cleanFormValue(data) {
      return {
        email_content: data
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
