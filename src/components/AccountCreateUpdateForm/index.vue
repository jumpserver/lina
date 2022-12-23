<template>
  <AutoDataForm
    v-if="!loading"
    v-bind="$data"
    @submit="confirm"
  />
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { UpdateToken } from '@/components/FormFields'
import Select2 from '@/components/FormFields/Select2'
import AssetSelect from '@/components/AssetSelect'

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
    account: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      usernameChanged: false,
      defaultPrivilegedAccounts: ['root', 'administrator'],
      platform: {
        automation: {},
        protocols: [
          {
            name: 'ssh',
            secret_types: ['password', 'ssh_key', 'token', 'api_key']
          }
        ]
      },
      url: '/api/v1/assets/accounts/',
      form: this.account || {},
      fields: [
        [this.$t('assets.Asset'), ['assets']],
        [this.$t('common.Basic'), ['name', 'username', 'privileged', 'su_from']],
        [this.$t('assets.Secret'), [
          'secret_type', 'secret', 'ssh_key', 'token', 'api_key', 'passphrase'
        ]],
        [this.$t('common.Other'), ['push_now', 'comment']]
      ],
      fieldsMeta: {
        assets: {
          component: AssetSelect,
          label: this.$t('assets.Asset'),
          el: {
            multiple: false
          },
          hidden: () => {
            console.log('asset', this.asset)
            return this.asset && this.asset.id
          }
        },
        name: {
          on: {
            input: ([value], updateForm) => {
              if (!this.usernameChanged) {
                updateForm({ username: value })
                const maybePrivileged = this.defaultPrivilegedAccounts.includes(value)
                if (maybePrivileged) {
                  updateForm({ privileged: true })
                }
              }
            }
          }
        },
        username: {
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
            return formValue.assets?.length > 1
          },
          el: {
            multiple: false,
            clearable: true,
            hidden: () => {
              return !this.asset.id
            },
            ajax: {
              url: `/api/v1/assets/accounts/su-from-accounts/?asset=${this.asset?.id || ''}`,
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
          label: 'Passphrase',
          component: UpdateToken,
          hidden: (formValue) => formValue.secret_type !== 'ssh_key'
        },
        token: {
          label: 'Token',
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue.secret_type !== 'token'
        },
        api_key: {
          id: 'api_key',
          label: this.$t('assets.SecretKey'),
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
            return !this.platform.automation?.['push_account_enabled']
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
      if (!this.asset || !this.asset.platform) {
        return
      }
      const platformId = this.asset.platform.id
      this.platform = await this.$axios.get(`/api/v1/assets/platforms/${platformId}/`)
    },
    setSecretTypeOptions() {
      const choices = [
        {
          label: this.$t('assets.Password'),
          value: 'password'
        },
        {
          label: this.$t('assets.PrivateKey'),
          value: 'ssh_key'
        },
        {
          label: 'Token',
          value: 'token'
        },
        {
          label: this.$t('assets.ApiKey'),
          value: 'api_key'
        }
      ]
      const secretTypes = []
      this.platform.protocols?.forEach(p => {
        secretTypes.push(...p['secret_types'])
      })
      if (!this.form.secret_type) {
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
        delete form[secretType]
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
