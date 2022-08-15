<template>
  <div>
    <AutoDataForm v-bind="$data" @submit="confirm" />
  </div>
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
        'username', 'password', 'private_key', 'passphrase',
        'privileged', 'comment'
      ],
      fieldsMeta: {
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
