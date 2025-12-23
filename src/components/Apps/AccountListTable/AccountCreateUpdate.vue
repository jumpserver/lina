<template>
  <Drawer
    v-model:visible="iVisible"
    :title="title"
    class="drawer"
    @close-drawer="handleCloseDrawer"
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
import IBox from '@/components/Common/IBox/index.vue'
import Page from '@/layout/components/Page/index.vue'
import vModelMixin from '@/utils/vue/vModelMixin'

export default {
  name: 'CreateAccountDialog',
  components: {
    IBox,
    Drawer,
    Page,
    AccountCreateUpdateForm
  },
  mixins: [vModelMixin('visible')],
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
      default() {
        return 'AddAccount'
      }
    }
  },
  emits: ['update:visible', 'add', 'bulk-create-done'],
  data() {
    return {
      loading: false,
      platform: {}
    }
  },
  computed: {
    protocols() {
      return this.asset ? this.asset.protocol : []
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
        if (
          (!data.assets || data.assets.length === 0) &&
          (!data.nodes || data.nodes.length === 0)
        ) {
          this.$message.error(this.$tc('PleaseSelectAssetOrNode'))
          return
        }
      }
      this.$axios
        .post(url, data, {
          disableFlashErrorMsg: iVisible
        })
        .then(data => {
          this.handleResult(data, null)
          this.$emit('update:visible', iVisible)
          if (!iVisible) {
            this.$emit('add', true)
          }
        })
        .catch(error => {
          if (error?.response?.data?.code === 'no_valid_assets') {
            this.$message.error(error?.response?.data?.detail)
            return
          }
          this.$emit('update:visible', true)
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
          this.$axios
            .patch(`/api/v1/accounts/accounts/${this.account.id}/`, data)
            .then(() => {
              this.$emit('update:visible', false)
              this.$emit('add', true)
              this.$message.success(this.$tc('UpdateSuccessMsg'))
            })
            .catch(error => this.setFieldError(error))
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
            errorTips = _.filter(errorTips, item => Object.keys(item).length > 0)
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
    handleCloseDrawer() {
      this.$emit('update:visible', false)
      // Reflect.deleteProperty(this.$route.query, 'flag')
    },
    handleAccountOperation(id, path, data) {
      this.$axios
        .post(`/api/v1/accounts/accounts/${id}/${path}/`, data)
        .then(res => {
          this.$emit('update:visible', false)
          this.$emit('add', true)
          this.handleResult(res, null)
        })
        .catch(error => this.handleResult(null, error))
    }
  }
}
</script>

<style lang="scss" scoped>
.drawer {
  :deep(.el-drawer__body) {
    .el-form {
      margin-right: 30px;
    }
  }
}
</style>
