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
import { UpdateToken } from '@/components/FormFields'
import Select2 from '@/components/FormFields/Select2'
import AssetSelect from '@/components/AssetSelect'
import { encryptPassword } from '@/utils/crypto'
import { RequiredChange, Required } from '@/components/DataForm/rules'

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
      default: null
    },
    // 默认组件密码加密
    encryptPassword: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      loading: true,
      usernameChanged: false,
      defaultPrivilegedAccounts: ['root', 'administrator'],
      iPlatform: {
        automation: {},
        protocols: [
          {
            name: 'ssh',
            secret_types: ['password', 'ssh_key', 'token', 'api_key']
          }
        ]
      },
      url: '/api/v1/accounts/accounts/',
      form: this.account || {},
      encryptedFields: ['secret'],
      fields: [
        [this.$t('assets.Asset'), ['assets']],
        [this.$t('common.Basic'), ['name', 'username', ...this.controlShowField()]],
        [this.$t('assets.Secret'), [
          'secret_type', 'secret', 'ssh_key', 'token',
          'api_key', 'passphrase'
        ]],
        [this.$t('common.Other'), ['push_now', 'is_active', 'comment']]
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
          }
        },
        su_from: {
          component: Select2,
          hidden: (formValue) => {
            return !this.asset?.id
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
          hidden: (formValue) => formValue.secret_type !== 'password'
        },
        ssh_key: {
          label: this.$t('assets.PrivateKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        passphrase: {
          label: this.$t('assets.Passphrase'),
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        token: {
          label: this.$t('assets.Token'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'token'
        },
        api_key: {
          id: 'api_key',
          label: this.$t('assets.AccessKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'api_key'
        },
        secret_type: {
          type: 'radio-group',
          options: []
        },
        push_now: {
          hidden: () => {
            const automation = this.iPlatform.automation || {}
            return !automation.push_account_enabled || !automation.ansible_enabled || !this.$hasPerm('accounts.push_account')
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
          value: 'api_key'
        }
      ]
      const secretTypes = []
      this.iPlatform.protocols?.forEach(p => {
        secretTypes.push(...p['secret_types'])
      })
      if (!this.form.secret_type) {
        this.form.secret_type = secretTypes[0]
      }
      this.fieldsMeta.secret_type.options = choices.filter(item => {
        return secretTypes.indexOf(item.value) > -1
      })
    },
    controlShowField() {
      const privileged = ['privileged']
      let suFrom = ['su_from']
      const filterSuFrom = ['database', 'device', 'cloud', 'web']
      const asset = this?.asset || {}
      if (filterSuFrom.includes(asset?.category?.value)) {
        suFrom = []
      }
      return [...privileged, ...suFrom]
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
