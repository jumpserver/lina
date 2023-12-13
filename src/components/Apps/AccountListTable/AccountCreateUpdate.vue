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
    v-on="$listeners"
  >
    <AccountCreateUpdateForm
      v-if="!loading"
      ref="form"
      :account="account"
      :add-template="addTemplate"
      :asset="asset"
      @add="addAccount"
      @edit="editAccount"
    />
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import AccountCreateUpdateForm from '@/components/Apps/AccountCreateUpdateForm/index.vue'

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
    addTemplate: {
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
    protocols() {
      return this.asset ? this.asset.protocol : []
    },
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
    addAccount(form) {
      const formValue = Object.assign({}, form)
      let data, url, iVisible
      if (this.asset) {
        data = {
          asset: this.asset.id,
          ...formValue
        }
        iVisible = false
        url = `/api/v1/accounts/accounts/`
      } else {
        iVisible = true
        data = formValue
        url = `/api/v1/accounts/accounts/bulk/`
        if (data.assets.length === 0) {
          this.$message.error(this.$tc('assets.PleaseSelectAsset'))
          return
        }
      }
      this.$axios.post(url, data, {
        disableFlashErrorMsg: iVisible
      }).then((data) => {
        this.handleResult(data, null)
        this.iVisible = iVisible
        if (!iVisible) {
          this.$emit('add', true)
        }
      }).catch(error => {
        this.iVisible = true
        this.handleResult(null, error)
      })
    },
    editAccount(form) {
      const data = { ...form }
      this.$axios.patch(`/api/v1/accounts/accounts/${this.account.id}/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$tc('common.updateSuccessMsg'))
      }).catch(error => this.setFieldError(error))
    },
    handleResult(resp, error) {
      let bulkCreate = !this.asset
      if (error && !Array.isArray(error?.response?.data)) {
        bulkCreate = false
      }
      if (resp && !Array.isArray(resp)) {
        bulkCreate = false
      }
      if (!bulkCreate) {
        if (!error) {
          this.$message.success(this.$tc('common.createSuccessMsg'))
        } else {
          this.setFieldError(error)
        }
      } else {
        let result
        if (error) {
          result = error.response.data
        } else {
          result = resp
        }
        this.$emit('bulk-create-done', result)
      }
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
