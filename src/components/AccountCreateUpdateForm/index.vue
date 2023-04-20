<template>
  <AutoDataForm
    v-if="!loading"
    ref="AutoDataForm"
    v-bind="$data"
    @submit="confirm"
  />
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { UpdateToken, UploadSecret } from '@/components/FormFields'
import Select2 from '@/components/FormFields/Select2'
import AssetSelect from '@/components/AssetSelect'
import { encryptPassword } from '@/utils/crypto'
import { Required, RequiredChange } from '@/components/DataForm/rules'
import AutomationParamsForm from '@/views/assets/Platform/AutomationParamsSetting.vue'

export default {
  name: 'AccountCreateForm',
  components: {
    AutoDataForm
  },
  props: {
    asset: {
      type: Object,
      default: null
    },
    platform: {
      type: Object,
      default: null
    },
    account: {
      type: Object,
      default: () => ({})
    },
    // 默认组件密码加密
    encryptPassword: {
      type: Boolean,
      default: true
    },
    addTemplate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      loading: true,
      usernameChanged: false,
      defaultPrivilegedAccounts: ['root', 'administrator'],
      iPlatform: {
        automation: {},
        su_enabled: false,
        protocols: [
          {
            name: 'ssh',
            secret_types: ['password', 'ssh_key', 'token', 'access_key']
          }
        ]
      },
      url: '/api/v1/accounts/accounts/',
      form: Object.assign({ 'on_invalid': 'error' }, this.account || {}),
      encryptedFields: ['secret'],
      fields: [
        [this.$t('assets.Asset'), ['assets']],
        [this.$t('accounts.AccountTemplate'), ['template']],
        [this.$t('common.Basic'), ['name', 'username', 'privileged', 'su_from']],
        [this.$t('assets.Secret'), [
          'secret_type', 'secret', 'ssh_key',
          'token', 'access_key', 'passphrase'
        ]],
        [this.$t('common.Other'), ['push_now', 'params', 'on_invalid', 'is_active', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          rules: [Required],
          component: AssetSelect,
          label: this.$t('assets.Asset'),
          el: {
            multiple: false
          },
          hidden: () => {
            return this.platform || this.asset
          }
        },
        template: {
          component: Select2,
          rules: [Required],
          el: {
            multiple: false,
            ajax: {
              url: '/api/v1/accounts/account-templates/',
              transformOption: (item) => {
                return { label: item.name, value: item.id }
              }
            }
          },
          hidden: () => {
            return this.platform || this.asset || !this.addTemplate
          }
        },
        on_invalid: {
          rules: [Required],
          label: this.$t('accounts.AccountPolicy'),
          helpText: this.$t('accounts.BulkCreateStrategy'),
          hidden: () => {
            return this.platform || this.asset
          }
        },
        name: {
          rules: [RequiredChange],
          on: {
            input: ([value], updateForm) => {
              if (!this.usernameChanged) {
                if (!this.account?.name) {
                  updateForm({ username: value })
                }
                const maybePrivileged = this.defaultPrivilegedAccounts.includes(value)
                if (maybePrivileged) {
                  updateForm({ privileged: true })
                }
              }
            }
          },
          hidden: () => {
            return this.addTemplate
          }
        },
        username: {
          el: {
            disabled: !!this.account?.name
          },
          on: {
            input: ([value], updateForm) => {
              this.usernameChanged = true
            },
            change: ([value], updateForm) => {
              const maybePrivileged = this.defaultPrivilegedAccounts.includes(value)
              if (maybePrivileged) {
                updateForm({ privileged: true })
              }
            }
          },
          hidden: () => {
            return this.addTemplate
          }
        },
        privileged: {
          hidden: () => {
            return this.addTemplate
          }
        },
        su_from: {
          component: Select2,
          hidden: (formValue) => {
            return !this.asset?.id || !this.iPlatform.su_enabled
          },
          el: {
            multiple: false,
            clearable: true,
            ajax: {
              url: `/api/v1/accounts/accounts/su-from-accounts/?account=${this.account?.id || ''}&asset=${this.asset?.id || ''}`,
              transformOption: (item) => {
                return { label: `${item.name}(${item.username})`, value: item.id }
              }
            }
          }
        },
        secret: {
          label: this.$t('assets.Password'),
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'password' || this.addTemplate
        },
        ssh_key: {
          label: this.$t('assets.PrivateKey'),
          component: UploadSecret,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key' || this.addTemplate
        },
        passphrase: {
          label: this.$t('assets.Passphrase'),
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key' || this.addTemplate
        },
        token: {
          label: this.$t('assets.Token'),
          component: UploadSecret,
          hidden: (formValue) => formValue.secret_type !== 'token' || this.addTemplate
        },
        access_key: {
          id: 'access_key',
          label: this.$t('assets.AccessKey'),
          component: UploadSecret,
          hidden: (formValue) => formValue.secret_type !== 'access_key' || this.addTemplate
        },
        secret_type: {
          type: 'radio-group',
          options: [],
          hidden: () => {
            return this.addTemplate
          }
        },
        push_now: {
          helpText: this.$t('accounts.AccountPush.WindowsPushHelpText'),
          hidden: () => {
            const automation = this.iPlatform.automation || {}
            return !automation.push_account_enabled ||
              !automation.ansible_enabled ||
              !this.$hasPerm('accounts.push_account') ||
              this.addTemplate
          }
        },
        params: {
          label: this.$t('assets.PushParams'),
          component: AutomationParamsForm,
          el: {
            method: this.asset?.auto_config?.push_account_method
          },
          hidden: (formValue) => {
            const automation = this.iPlatform.automation || {}
            return !formValue.push_now ||
              !automation.push_account_enabled ||
              !automation.ansible_enabled ||
              !this.$hasPerm('accounts.push_account') ||
              this.addTemplate
          }
        },
        comment: {
          hidden: () => {
            return this.addTemplate
          }
        }
      },
      hasSaveContinue: false
    }
  },
  async mounted() {
    try {
      await this.getPlatform()
      this.setSecretTypeOptions()
    } finally {
      this.loading = false
    }
  },
  methods: {
    async getPlatform() {
      if (this.platform) {
        this.iPlatform = this.platform
      }
      if (!this.asset || !this.asset.platform) {
        return
      }
      const platformId = this.asset.platform.id
      this.iPlatform = await this.$axios.get(`/api/v1/assets/platforms/${platformId}/`)
    },
    setSecretTypeOptions() {
      const choices = [
        {
          label: this.$t('assets.Password'),
          value: 'password'
        },
        {
          label: this.$t('assets.SSHKey'),
          value: 'ssh_key'
        },
        {
          label: this.$t('assets.Token'),
          value: 'token'
        },
        {
          label: this.$t('assets.AccessKey'),
          value: 'access_key'
        }
      ]
      const secretTypes = []
      this.iPlatform.protocols?.forEach(p => {
        secretTypes.push(...p['secret_types'])
      })
      if (!this.form?.secret_type) {
        this.form.secret_type = secretTypes[0]
      }
      this.fieldsMeta.secret_type.options = choices.filter(item => {
        return secretTypes.indexOf(item.value) > -1
      })
    },
    confirm(form) {
      const secretType = form.secret_type || ''
      if (secretType !== 'password') {
        form.secret = form[secretType]
      }
      form.secret = this.encryptPassword ? encryptPassword(form.secret) : form.secret
      if (!form.secret) {
        delete form['secret']
      }
      if (this.account?.name) {
        this.$emit('edit', form)
      } else {
        this.$emit('add', form)
      }
    }
  }
}
</script>

<style scoped>
</style>
