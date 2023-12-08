<template>
  <Dialog
    v-if="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="$tc('assets.AddAccount')"
    :visible.sync="iVisible"
    width="800px"
  >
    <AccountCreateForm
      :account="account"
      :encrypt-password="false"
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
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    }
  },
  methods: {
    addAccount(account) {
      const i = this.accounts.findIndex(item => item.username === account.username)
      if (i !== -1) {
        this.accounts.splice(i, 1)
      }
      this.accounts.push(account)
      this.iVisible = false
    },
    editAccount(form) {
      const i = this.accounts.findIndex(item => item.username === this.account.username)
      this.accounts.splice(i, 1, form)
      this.iVisible = false
    }
  }
}
</script>

<style scoped>

</style>
