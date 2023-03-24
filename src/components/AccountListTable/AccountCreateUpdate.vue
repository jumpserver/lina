<template>
  <Dialog
    v-if="iVisible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="iVisible"
    v-bind="$attrs"
    width="70%"
    v-on="$listeners"
  >
    <AccountCreateUpdateForm
      v-if="!loading"
      ref="form"
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
    },
    title: {
      type: String,
      default: function() {
        return this.$t('assets.AddAccount')
      }
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
      }).catch(error => this.setFieldError(error))
    },
    editAccount(form) {
      const data = { ...form }
      this.$axios.patch(`/api/v1/accounts/accounts/${this.account.id}/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(error => this.setFieldError(error))
    },
    setFieldError(error) {
      const response = error.response
      const data = response.data
      const refsAutoDataForm = this.$refs.form.$refs.AutoDataForm
      if (response.status === 400) {
        for (const key of Object.keys(data)) {
          let err = ''
          let current = key
          let errorTips = data[current]
          if (errorTips instanceof Array) {
            errorTips = _.filter(errorTips, (item) => Object.keys(item).length > 0)
            for (const i of errorTips) {
              if (i instanceof Object) {
                err += i?.port?.join(',')
              } else {
                err += errorTips
              }
            }
          } else {
            err = errorTips
          }
          if (current === 'secret') {
            current = refsAutoDataForm.form.secret_type?.value || key
          }
          refsAutoDataForm.setFieldError(current, err)
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
