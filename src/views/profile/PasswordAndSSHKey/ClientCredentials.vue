<template>
  <div class="credential-form">
    <el-alert
      v-if="accountMismatch"
      :title="$t('ClientCredentialsAccountMismatch')"
      type="warning"
      :closable="false"
    />
    <template v-else>
      <el-alert
        :title="$t(credentialType === 'file' ? 'FileEncryptionHelp' : 'ClientCredentialsHelp')"
        type="info"
        :closable="false"
      />
      <IBox>
        <GenericCreateUpdateForm :key="formVersion" v-bind="config" submit-method="patch" />
      </IBox>
    </template>
  </div>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import BoolTextReadonly from '@/components/Form/FormFields/BoolTextReadonly'
import UserPassword from '@/components/Form/FormFields/UserPassword.vue'
import { PasswordInput } from '@/components/Form/FormFields'
import { encryptPassword } from '@/utils/session-encrypt'

export default {
  name: 'ClientCredentials',
  components: { GenericCreateUpdateForm, IBox },
  props: {
    object: { type: Object, default: null },
    credentialType: {
      type: String,
      default: 'lock',
      validator: (value) => ['lock', 'file'].includes(value)
    }
  },
  data() {
    const group = this.credentialType === 'file' ? 'file' : 'lock'
    const fields =
      group === 'file' ? ['secret_key', 'secret_key_again'] : ['password', 'password_again']
    const passwordMeta = (name) => ({
      component: PasswordInput,
      el: { autocomplete: 'new-password', name }
    })
    const groupMeta =
      group === 'lock'
        ? {
            fields: ['has_password', ...fields],
            fieldsMeta: {
              has_password: { label: this.$t('Configured'), component: BoolTextReadonly },
              password: {
                component: UserPassword,
                el: {
                  userIsOrgAdmin: this.$store.state.users.profile.is_org_admin,
                  autocomplete: 'new-password',
                  name: 'client-lock-password'
                }
              },
              password_again: passwordMeta('client-lock-password-confirmation')
            }
          }
        : {
            fields: ['has_secret_key', ...fields],
            fieldsMeta: {
              has_secret_key: { label: this.$t('Configured'), component: BoolTextReadonly },
              secret_key: passwordMeta('file-encryption-password'),
              secret_key_again: passwordMeta('file-encryption-password-confirmation')
            }
          }
    return {
      formVersion: 0,
      config: {
        url: '/api/v1/users/profile/client-credentials/',
        hasDetailInMsg: false,
        fields: [
          [this.$t(group === 'lock' ? 'ClientLockPassword' : 'FileEncryptionPassword'), [group]]
        ],
        fieldsMeta: { [group]: groupMeta },
        cleanFormValue: (values) => ({
          [group]: Object.fromEntries(
            fields
              .filter((field) => values[group]?.[field])
              .map((field) => [field, encryptPassword(values[group][field])])
          )
        }),
        onPerformSuccess: () => {
          this.$message.success(this.$t('UpdateSuccessMsg'))
          this.formVersion += 1
        }
      }
    }
  },
  computed: {
    accountMismatch() {
      const expected = this.$route.query.user_id
      return Boolean(expected && expected !== this.$store.state.users.profile.id)
    }
  }
}
</script>

<style scoped>
.credential-form {
  display: flex;
  flex-direction: column;
  gap: var(--page-section-gap, 8px);
}
</style>
