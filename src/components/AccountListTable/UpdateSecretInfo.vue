<template>
  <Dialog
    width="50"
    :title="this.$t('assets.UpdateAssetUserToken')"
    :destroy-on-close="true"
    v-bind="$attrs"
    @confirm="handleConfirm()"
    @cancel="handleCancel()"
    v-on="$listeners"
  >
    <el-form label-position="right" label-width="80px">
      <el-form-item :label="this.$t('assets.Hostname')">
        <el-input v-model="account.hostname" readonly />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Username')">
        <el-input v-model="account['username']" readonly />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Password')">
        <el-input v-model="authInfo.password" type="password" />
      </el-form-item>
      <el-form-item :label="this.$t('assets.SSHKey')">
        <input type="file" @change="onPrivateKeyLoaded">
      </el-form-item>
      <el-form-item :label="this.$t('assets.Passphrase')">
        <el-input v-model="authInfo.passphrase" type="password" />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
export default {
  name: 'UpdateSecretInfo',
  components: {
    Dialog
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      authInfo: {
        password: '',
        private_key: '',
        passphrase: ''
      }
    }
  },
  methods: {
    handleConfirm() {
      const data = {}
      if (this.authInfo.password !== '') {
        data.password = this.authInfo.password
      }
      if (this.authInfo.private_key !== '') {
        data.private_key = this.authInfo.private_key
        data.passphrase = this.authInfo.passphrase
      }
      this.$axios.patch(
        `/api/v1/assets/accounts/${this.account.id}/`,
        data
      ).then(res => {
        this.authInfo = { password: '', private_key: '' }
        this.$message.success(this.$tc('common.updateSuccessMsg'))
        this.$emit('updateAuthDone', res)
        this.$emit('update:visible', false)
      }).catch(err => {
        const errMsg = Object.values(err.response.data).join(', ')
        this.$message.error(this.$tc('common.updateErrorMsg') + ' ' + errMsg)
        this.$emit('update:visible', true)
      })
    },
    handleCancel() {
      this.$emit('update:visible', false)
    },
    onPrivateKeyLoaded(e) {
      const vm = this
      // TODO 校验文件类型
      const reader = new FileReader()
      reader.onload = function() {
        vm.authInfo.private_key = this.result
      }
      reader.readAsText(
        e.target.files[0]
      )
    }
  }
}
</script>

<style scoped>

</style>
