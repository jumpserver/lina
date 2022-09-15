<template>
  <AutoDataForm v-bind="$data" @submit="confirm" />
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { UpdateToken, UploadKey } from '@/components/FormFields'
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
        ['Auth', ['password', 'private_key', 'passphrase']],
        ['Other', ['push_now', 'comment']]
      ],
      defaultPrivilegedAccounts: ['root', 'administrator'],
      fieldsMeta: {
        password: {
          component: UpdateToken
        },
        private_key: {
          component: UploadKey,
          hidden: () => {
            return !this.hasProtocol('ssh')
          }
        },
        username: {
          on: {
            change: ([value], updateForm) => {
              if (this.defaultPrivilegedAccounts.indexOf(value.toLowerCase()) > -1) {
                updateForm({ privileged: true })
              }
            }
          }
        },
        passphrase: {
          component: UpdateToken,
          hidden: () => {
            return !this.hasProtocol('ssh')
          }
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
