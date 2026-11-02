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
        :title="$t(credentialType === 'lock' ? 'ClientCredentialsHelp' : 'FileEncryptionHelp')"
        type="info"
        :closable="false"
      />
      <IBox>
        <div>
          <GenericCreateUpdateForm
            :key="formVersion"
            v-bind="config"
            submit-method="patch"
            :more-buttons="clearPasswordButtons"
          />
        </div>
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
      clearingPassword: false,
      lockPasswordConfigured: false,
      config: {
        url: '/api/v1/users/profile/client-credentials/',
        hasDetailInMsg: false,
        afterGetRemoteMeta: (meta) => {
          if (group === 'file' && meta.file?.children?.has_secret_key) {
            // The tab reminder contains the file-encryption explanation.
            meta.file.children.has_secret_key.help_text = ''
          }
        },
        afterGetFormValue: (values) => {
          this.lockPasswordConfigured = Boolean(values.lock?.has_password)
          return values
        },
        fields: [group],
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
    clearPasswordButtons() {
      return this.credentialType === 'lock'
        ? [
            {
              title: this.$t('IdleLock.ClearPassword'),
              type: 'danger',
              plain: true,
              loading: this.clearingPassword,
              disabled: !this.lockPasswordConfigured || this.clearingPassword,
              callback: () => this.clearLockPassword()
            }
          ]
        : []
    },
    accountMismatch() {
      const expected = this.$route.query.user_id
      return Boolean(expected && expected !== this.$store.state.users.profile.id)
    }
  },
  methods: {
    async clearLockPassword() {
      if (!this.lockPasswordConfigured || this.clearingPassword) return
      this.clearingPassword = true
      try {
        await this.$confirm(
          this.$t('IdleLock.ClearPasswordConfirm'),
          this.$t('IdleLock.ClearPassword'),
          { type: 'warning' }
        )
        await this.$axios.patch('/api/v1/users/profile/client-credentials/', {
          lock: { clear: true }
        })
        this.$message.success(this.$t('IdleLock.PasswordCleared'))
        this.formVersion += 1
      } catch (error) {
        if (error !== 'cancel' && error !== 'close') {
          this.$log.error('Failed to clear lock password', error)
        }
      } finally {
        this.clearingPassword = false
      }
    }
  }
}
</script>

<style scoped>
.credential-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
