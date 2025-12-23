<template>
  <Dialog
    v-if="visible"
    :destroy-on-close="true"
    :model="false"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('AddAccount')"
    :visible="visible"
    width="800px"
  >
    <AccountCreateForm
      :account="account"
      :encrypt-password="false"
      :label-position="'right'"
      :platform="platform"
      @add="addAccount"
      @edit="editAccount"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import AccountCreateForm from '@/components/Apps/AccountCreateUpdateForm'

export default {
  name: 'AddAccountDialog',
  components: {
    Dialog,
    AccountCreateForm
  },
  props: {
    platform: {
      type: Object,
      default: () => null
    },
    visible: {
      type: Boolean,
      default: false
    },
    account: {
      type: Object,
      default: () => ({})
    },
    accounts: {
      type: Array,
      default: () => ([])
    }
  },
  data() {
    return {}
  },
  methods: {
    addAccount(account) {
      const i = this.accounts.findIndex(item => item.username === account.username)
      if (i !== -1) {
        this.accounts.splice(i, 1)
      }
      this.accounts.push(account)
      this.$emit('update:visible', false)
    },
    editAccount(form) {
      const i = this.accounts.findIndex(item => item.username === this.account.username)
      this.accounts.splice(i, 1, form)
      this.$emit('update:visible', false)
    }
  }
}
</script>
