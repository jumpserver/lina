<template>
  <div>
    <el-alert :closable="false" :title="$t('ClientLoginPolicyChangeHelp')" type="info" />
    <IBox>
      <GenericCreateUpdateForm v-bind="config" submit-method="patch" />
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'

const clientFields = [
  'SECURITY_CLIENT_REAUTH_ON_EXIT',
  'SECURITY_CLIENT_MAX_SESSION_TIME',
  'SECURITY_CLIENT_IDLE_LOCK_TIME'
]

export default {
  name: 'ClientSecurity',
  components: { GenericCreateUpdateForm, IBox },
  data() {
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security_session',
        hasDetailInMsg: false,
        fields: clientFields,
        fieldsMeta: {
          SECURITY_CLIENT_IDLE_LOCK_TIME: {
            helpTextAsTip: false,
            helpTextAsPlaceholder: false
          }
        },
        initial: {
          SECURITY_CLIENT_REAUTH_ON_EXIT: false,
          SECURITY_CLIENT_MAX_SESSION_TIME: 0,
          SECURITY_CLIENT_IDLE_LOCK_TIME: 0
        },
        cleanFormValue: (values) =>
          Object.fromEntries(clientFields.map((field) => [field, values[field]])),
        onPerformSuccess: () => this.$message.success(this.$t('UpdateSuccessMsg'))
      }
    }
  }
}
</script>
