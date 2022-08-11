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
      form: this.account || { protocol: this.protocols[0] },
      fields: [
        'type', 'username', 'password',
        'private_key', 'passphrase', 'comment'
      ],
      fieldsMeta: {
        protocol: {
          type: 'radio-group',
          label: this.$t('assets.Protocol'),
          default: this.protocols[0].name,
          options: this.protocols.map((item) => {
            return { label: item.name.toUpperCase(), value: item.name }
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
  mounted() {
    console.log('protocols: ', this.protocols)
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
