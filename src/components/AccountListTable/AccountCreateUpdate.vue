<template>
  <Dialog
    :title="$tc('assets.AddAccount')"
    :visible.sync="iVisible"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :close-on-click-modal="false"
    width="70%"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <AccountCreateUpdateForm
      v-if="!loading"
      :account="account"
      :asset="asset"
      @add="addAccount"
      @edit="editAccount"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import AccountCreateUpdateForm from '@/components/AccountCreateUpdateForm'

export default {
  name: 'CreateAccountDialog',
  components: {
    Dialog,
    AccountCreateUpdateForm
  },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    asset: {
      type: Object,
      default: null
    },
    account: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      loading: false,
      platform: {}
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
      const formValue = Object.assign({}, form)
      let assets = []
      if (this.asset) {
        assets = [this.asset.id]
      } else {
        assets = formValue.assets
      }
      delete formValue.assets
      if (assets.length === 0) {
        this.$message.error(this.$tc('assets.PleaseSelectAsset'))
        return
      }
      const data = []
      for (const asset of assets) {
        data.push({
          ...formValue,
          asset
        })
      }
      this.$axios.post(`/api/v1/accounts/accounts/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$tc('common.createSuccessMsg'))
      }).catch(() => {
        this.$message.error(this.$tc('common.createErrorMsg'))
      })
    },
    editAccount(form) {
      const data = { ...form }
      this.$axios.patch(`/api/v1/accounts/accounts/${this.account.id}/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      })
    }
  }
}
</script>

<style scoped>

</style>
