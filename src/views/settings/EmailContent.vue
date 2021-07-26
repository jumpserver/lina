<template>
  <IBox>
    <GenericCreateUpdateForm
      :fields="fields"
      :url="url"
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
  data() {
    return {
      fields: [
        [
          this.$t('setting.createUserSetting'),
          [
            'EMAIL_CUSTOM_USER_CREATED_SUBJECT', 'EMAIL_CUSTOM_USER_CREATED_HONORIFIC',
            'EMAIL_CUSTOM_USER_CREATED_BODY', 'EMAIL_CUSTOM_USER_CREATED_SIGNATURE'
          ]
        ]
      ],
      successUrl: { name: 'Settings', params: { activeMenu: 'EmailContent' }},
      fieldsMeta: {
        'EMAIL_CUSTOM_USER_CREATED_BODY': {
          el: {
            type: 'textarea',
            rows: 3
          }
        }
      },
      url: '/api/v1/settings/setting/?category=email_content'
    }
  },
  methods: {
    getMethod() {
      return 'put'
    }
  }
}
</script>

<style scoped>

</style>
