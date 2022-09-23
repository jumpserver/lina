<template>
  <AutoDataForm v-bind="$data" @submit="confirm" />
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
    protocols: {
      type: Array,
      default: () => ([])
    },
    accounts: {
      type: Array,
      default: () => ([])
    },
    account: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
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
          label: 'Password',
          component: UpdateToken,
          hidden: (formValue) => formValue['secret_type'] !== 'password'
        },
        ssh_key: {
          label: 'SSH private key',
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
          label: 'Secret key',
          el: {
            type: 'textarea',
            rows: 4
          },
          hidden: (formValue) => formValue['secret_type'] !== 'api_key'
        },
        secret_type: {
          label: 'Secret Type',
          type: 'radio-group',
          options: [
            { label: 'Password', value: 'password' },
            { label: 'SSH key', value: 'ssh_key' },
            { label: 'Token', value: 'token' },
            { label: 'Api key', value: 'api_key' }
          ]
        }
      },
      hasSaveContinue: false
    }
  },
  mounted() {
    console.log('protocols: ', this.protocols)
  },
  methods: {
    confirm(form) {
      console.log('Account form: accout is: ', this.account)
      if (this.account) {
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
