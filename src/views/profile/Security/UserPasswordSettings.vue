<template>
  <div class="password-settings">
    <el-alert
      :title="$t(passwordType === 'lock' ? 'LockPasswordHelp' : 'FileEncryptionHelp')"
      type="info"
      :closable="false"
    />
    <IBox>
      <div>
        <GenericCreateUpdateForm
          :key="formVersion"
          ref="passwordForm"
          v-bind="config"
          submit-method="patch"
          :more-buttons="clearPasswordButtons"
          class="password-settings-form"
        />
      </div>
    </IBox>
  </div>
</template>

<script>
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import { IBox } from '@/components'
import BoolTextReadonly from '@/components/Form/FormFields/BoolTextReadonly'
import UserPassword from '@/components/Form/FormFields/UserPassword.vue'
import { PasswordInput } from '@/components/Form/FormFields'

export default {
  name: 'UserPasswordSettings',
  components: { GenericCreateUpdateForm, IBox },
  props: {
    passwordType: {
      type: String,
      default: 'lock',
      validator: (value) => ['lock', 'file'].includes(value)
    }
  },
  data() {
    const passwordType = this.passwordType
    const fields =
      passwordType === 'file' ? ['secret_key', 'secret_key_again'] : ['password', 'password_again']
    const passwordMeta = (name, confirmation = false) => ({
      component: PasswordInput,
      el: { autocomplete: 'new-password', name },
      rules: confirmation
        ? [
            {
              trigger: ['blur', 'change'],
              validator: (rule, value, callback) => {
                const form = this.$refs.passwordForm?.$refs.form?.dataForm
                const password = form?.getFormValue()?.[fields[0]] || ''
                callback(
                  (value || '') === password ? undefined : new Error(this.$t('PasswordMismatch'))
                )
              }
            }
          ]
        : []
    })
    const formFields =
      passwordType === 'lock'
        ? {
            fields: ['has_password', ...fields],
            fieldsMeta: {
              has_password: { label: this.$t('Configured'), component: BoolTextReadonly },
              password: {
                component: UserPassword,
                el: {
                  userIsOrgAdmin: this.$store.state.users.profile.is_org_admin,
                  autocomplete: 'new-password',
                  name: 'lock-password'
                }
              },
              password_again: passwordMeta('lock-password-confirmation', true)
            }
          }
        : {
            fields: ['has_secret_key', ...fields],
            fieldsMeta: {
              has_secret_key: { label: this.$t('Configured'), component: BoolTextReadonly },
              secret_key: passwordMeta('file-encryption-password'),
              secret_key_again: passwordMeta('file-encryption-password-confirmation', true)
            }
          }
    return {
      formVersion: 0,
      clearingPassword: false,
      lockPasswordConfigured: false,
      config: {
        url: `/api/v1/users/profile/${passwordType === 'lock' ? 'lock-password' : 'file-encryption'}/`,
        hasDetailInMsg: false,
        encryptedFields: fields,
        afterGetFormValue: (values) => {
          this.lockPasswordConfigured = Boolean(values.has_password)
          return values
        },
        ...formFields,
        cleanFormValue: (values) =>
          Object.fromEntries(
            fields.filter((field) => values[field]).map((field) => [field, values[field]])
          ),
        onPerformSuccess: () => {
          this.$message.success(this.$t('UpdateSuccessMsg'))
          this.formVersion += 1
        }
      }
    }
  },
  computed: {
    clearPasswordButtons() {
      return this.passwordType === 'lock'
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
        await this.$axios.patch(this.config.url, {
          clear: true
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

<style lang="scss" scoped>
.password-settings {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.password-settings-form :deep(.password-input) {
  width: 600px;
  max-width: 100%;
}
</style>
