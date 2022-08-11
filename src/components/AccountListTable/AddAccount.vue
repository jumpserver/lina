<template>
  <Dialog
    :title="this.$tc('assets.AddAccount')"
    :visible.sync="visible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :close-on-click-modal="false"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <AccountCreateForm
      :protocols="protocols"
      :account="account"
      @add="addAccount"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import AccountCreateForm from '@/components/AccountCreateForm'
export default {
  name: 'CreateAccountDialog',
  components: {
    Dialog,
    AccountCreateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    asset: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      account: {
        name: '',
        username: '',
        password: '',
        private_key: ''
      }
    }
  },
  computed: {
    protocols() {
      return this.asset ? this.asset.protocol : []
    }
  },
  methods: {
    addAccount(form) {
      const data = { asset: this.asset.id, ...form }
      this.$axios.post(`/api/v1/assets/accounts/`, data)
        .then(() => {
          this.visible = false
          this.$emit('add', true)
        })
        .catch(() => {
          this.$message.error(this.$tc('common.createErrorMsg'))
        })
    }
  }
}
</script>

<style scoped>

</style>
