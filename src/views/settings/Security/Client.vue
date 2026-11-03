<template>
  <IBox>
    <GenericCreateUpdateForm v-bind="config" submit-method="patch" />
  </IBox>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

const clientFields = ['SECURITY_CLIENT_REAUTH_ON_EXIT', 'SECURITY_CLIENT_MAX_SESSION_TIME']

export default {
  name: 'ClientSecurity',
  components: { GenericCreateUpdateForm, IBox },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security_session',
        hasDetailInMsg: false,
        fields: clientFields,
        cleanFormValue: (values) =>
          Object.fromEntries(clientFields.map((field) => [field, values[field]])),
        onPerformSuccess: () => this.$message.success(this.$t('UpdateSuccessMsg'))
      }
    }
  }
}
</script>
