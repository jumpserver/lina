<template>
  <AutoDataForm v-loading="loading" v-bind="$data" @submit="confirm" />
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { UpdateToken } from '@/components/FormFields'
export default {
  name: 'AccountCreateForm',
  components: {
    AutoDataForm
  },
  props: {
    platform: {
      type: Object,
      default: () => ({})
    },
    account: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      loading: true,
      url: '/api/v1/assets/accounts/',
      form: this.account || { },
      fields: [
        ['Basic', ['username', 'privileged']],
        ['Auth', ['secret_type', 'password', 'ssh_key', 'token', 'api_key', 'passphrase']],
        ['Other', ['push_now', 'name', 'comment']]
      ],
      defaultPrivilegedAccounts: ['root', 'administrator'],
      fieldsMeta: {
        username: {
          on: {
            change: ([value], updateForm) => {
              if (this.defaultPrivilegedAccounts.indexOf(value.toLowerCase()) > -1) {
                updateForm({ privileged: true })
              }
            }
          }
        },
        password: {
          label: this.$t('assets.Password'),
          component: UpdateToken,
          hidden: (formValue) => formValue['secret_type'] !== 'password'
        },
        ssh_key: {
          label: this.$t('assets.SSHPrivateKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue['secret_type'] !== 'ssh_key'
        },
        passphrase: {
          label: 'Passphrase',
          component: UpdateToken,
          hidden: (formValue) => formValue['secret_type'] !== 'ssh_key'
        },
        token: {
          label: 'Token',
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue['secret_type'] !== 'token'
        },
        api_key: {
          id: 'api_key',
          label: this.$t('assets.SecretKey'),
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue['secret_type'] !== 'api_key'
        },
        secret_type: {
          type: 'radio-group',
          options: [
            { label: 'Password', value: 'password' }
          ]
        },
        push_now: {
          hidden: () => {
            return !this.platform.automation['push_account_enabled']
          }
        }
      },
      hasSaveContinue: false
    }
  },
  mounted() {
    this.setSecretTypes().then(() => {
      this.loading = false
    })
  },
  methods: {
    async setSecretTypes() {
      const options = [
        { label: 'Password', value: 'password' },
        { label: 'SSH key', value: 'ssh_key' },
        { label: 'Token', value: 'token' },
        { label: 'Api key', value: 'api_key' }
      ]
      const secretTypes = []
      this.platform.protocols.forEach(p => {
        secretTypes.push(...p['secret_types'])
      })
      if (!this.form.secret_type) {
        this.form.secret_type = secretTypes[0]
      }
      const supportOptions = options.filter(item => {
        return secretTypes.indexOf(item.value) > -1
      })
      if (supportOptions.length > 0) {
        this.fieldsMeta.secret_type.options = supportOptions
      }
    },
    confirm(form) {
      if (this.account?.name) {
        this.$emit('edit', form)
      } else {
        this.$emit('add', form)
      }
    },
    hasProtocol(name) {
      return this.protocols.find(item => item.name === name)
    }
  }
}
</script>

<style scoped>
</style>
