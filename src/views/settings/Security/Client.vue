<template>
  <div class="security-settings-form">
    <el-alert
      v-if="scope === 'Client'"
      :title="$t('PersonalSecurity.AdminClientHelp')"
      type="info"
      :closable="false"
    />
    <IBox>
      <GenericCreateUpdateForm v-bind="config" submit-method="patch" />
    </IBox>
  </div>
</template>

<script>
import IBox from '@/components/Common/IBox/index.vue'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm/index.vue'
import { refreshWebSessionLock } from '@/composables/useWebSessionLock'

export default {
  name: 'ClientSecurity',
  components: { GenericCreateUpdateForm, IBox },
  props: { scope: { type: String, default: 'Client' } },
  data() {
    const webConfigFields = ['SESSION_COOKIE_AGE', 'SESSION_SAVE_EVERY_REQUEST']
    const webFields = ['SESSION_EXPIRE_AT_BROWSER_CLOSE', 'SECURITY_WEB_IDLE_LOCK_TIME']
    const clientFields = [
      'SECURITY_CLIENT_REAUTH_ON_EXIT',
      'SECURITY_CLIENT_MAX_SESSION_TIME',
      'SECURITY_CLIENT_IDLE_LOCK_TIME'
    ]
    const isWeb = this.scope === 'Web'
    const settingFields = isWeb ? webFields : clientFields
    return {
      config: {
        url: '/api/v1/settings/setting/?category=security_session',
        hasDetailInMsg: false,
        fields: isWeb ? [...webConfigFields, ...webFields] : clientFields,
        initial: {
          SESSION_EXPIRE_AT_BROWSER_CLOSE: false,
          SECURITY_WEB_IDLE_LOCK_TIME: 15,
          SECURITY_CLIENT_REAUTH_ON_EXIT: false,
          SECURITY_CLIENT_MAX_SESSION_TIME: 0,
          SECURITY_CLIENT_IDLE_LOCK_TIME: 15
        },
        fieldsMeta: {
          SESSION_COOKIE_AGE: { type: 'input', readonly: true, el: { type: 'text' } },
          SESSION_SAVE_EVERY_REQUEST: { readonly: true }
        },
        cleanFormValue: (values) =>
          Object.fromEntries(settingFields.map((field) => [field, values[field]])),
        onPerformSuccess: () => {
          this.$message.success(this.$t('UpdateSuccessMsg'))
          refreshWebSessionLock().catch(() => {})
        }
      }
    }
  }
}
</script>

<style scoped>
.security-settings-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
