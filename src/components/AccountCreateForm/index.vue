<template>
  <AutoDataForm v-bind="$data" @submit="confirm" />
</template>

<script>
import AutoDataForm from '@/components/AutoDataForm'
import { UpdateToken } from '@/components/FormFields'
import { UploadKey } from '@/components'
export default {
  name: 'AccountCreateForm',
  components: {
    AutoDataForm
  },
  props: {
    protocols: {
      type: Array,
      default: () => ['ssh', 'rdp']
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
      form: this.account || { protocol: this.protocols[0] },
      fields: [
        'protocol', 'type', 'username', 'password',
        'private_key', 'passphrase', 'comment'
      ],
      fieldsMeta: {
        protocol: {
          type: 'radio-group',
          label: this.$t('assets.Protocol'),
          default: this.protocols[0],
          options: this.protocols.map((item) => {
            return { label: item.toUpperCase(), value: item }
          })
        },
        password: {
          component: UpdateToken
        },
        private_key: {
          component: UploadKey
        },
        passphrase: {
          component: UpdateToken
        }
      },
      hasSaveContinue: false
    }
  },
  methods: {
    confirm(form) {
      if (this.account && this.account._id) {
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
