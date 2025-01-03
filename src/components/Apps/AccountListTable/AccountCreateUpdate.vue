<template v-if="iVisible">
  <Drawer
    :has-footer="true"
    :title="title"
    :visible="iVisible"
    class="drawer"
    @close-drawer="iVisible = false"
  >
    <Page :title="'null'">
      <IBox class="content">
        <AccountCreateUpdateForm
          v-if="!loading"
          ref="form"
          :account="account"
          :add-template="addTemplate"
          :asset="asset"
          @add="addAccount"
          @edit="editAccount"
        />
      </IBox>
    </Page>
  </Drawer>
</template>

<script>
import Drawer from '@/components/Drawer/index.vue'
import AccountCreateUpdateForm from '@/components/Apps/AccountCreateUpdateForm/index.vue'
import IBox from '@/components/IBox/index.vue'
import Page from '@/layout/components/Page/index.vue'

export default {
  name: 'CreateAccountDialog',
  components: {
    IBox,
    Drawer,
    Page,
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
        return this.$t('AddAccount')
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
          this.$message.error(this.$tc('PleaseSelectAsset'))
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
        console.log(this.iVisible)
        console.log(this.origin)
        this.handleResult(null, error)
      })
    },
    editAccount(form) {
      const data = { ...form }
      const flag = this.$route.query.flag

      switch (flag) {
        case 'copy':
          this.handleAccountOperation(this.account.id, 'copy-to-assets', data)
          break
        case 'move':
          this.handleAccountOperation(this.account.id, 'move-to-assets', data)
          break
        default:
          this.handleAccountOperation(this.account.id, '', data)
      }
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
          this.$message.success(this.$tc('CreateSuccessMsg'))
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
    },
    handleAccountOperation(id, path, data) {
      this.$axios.post(`/api/v1/accounts/accounts/${id}/${path}/`, data).then(() => {
        this.iVisible = false
        this.$emit('add', true)
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(error => this.setFieldError(error))
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer {
  ::v-deep .el-drawer__body {

    .el-form {
      margin-right: 30px;
    }
  }
}
</style>
