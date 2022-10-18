<template>
  <Dialog
    :title="this.$tc('assets.AddAccount')"
    :visible.sync="iVisible"
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
      @edit="editAccount"
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
      default: () => ({})
    },
    account: {
      type: Object,
      default: () => ({
        name: '',
        username: '',
        password: '',
        private_key: ''
      })
    }
  },
  data() {
    return {
    }
  },
  computed: {
    iVisible: {
      get() {
        return this.visible
      },
      set(val) {
        this.$emit('update:visible', val)
      }
    },
    protocols() {
      return this.asset ? this.asset.protocol : []
    }
  },
  methods: {
    addAccount(form) {
      const data = { asset: this.asset.id, ...form }
      this.$axios.post(`/api/v1/assets/accounts/`, data)
        .then(() => {
          this.iVisible = false
          this.$emit('add', true)
        })
        .catch(() => {
          this.$message.error(this.$tc('common.createErrorMsg'))
        })
    },
    editAccount(form) {
      const data = { ...form }
      this.$axios.patch(`/api/v1/assets/accounts/${this.account.id}/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$t('common.updateSuccessMsg'))
      })
    }
  }
}
</script>

<style scoped>

</style>
