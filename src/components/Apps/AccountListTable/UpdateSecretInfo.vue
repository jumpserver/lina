<template>
  <Dialog
    :destroy-on-close="true"
    :title="$tc('assets.UpdateAssetUserToken')"
    :visible.sync="visible"
    width="50"
    @cancel="handleCancel()"
    @confirm="handleConfirm()"
    v-on="$listeners"
  >
    <el-form label-position="right" label-width="90px">
      <el-form-item :label="$tc('assets.Name')">
        <el-input v-model="account['asset_name']" readonly />
      </el-form-item>
      <el-form-item :label="$tc('assets.Username')">
        <el-input v-model="account['username']" readonly />
      </el-form-item>
      <el-form-item :label="$tc('assets.Password')">
        <UpdateToken v-model="authInfo.password" />
      </el-form-item>
      <el-form-item :label="$tc('assets.SSHSecretKey')">
        <UploadKey @input="getFile" />
      </el-form-item>
      <el-form-item :label="$tc('assets.Passphrase')">
        <UpdateToken v-model="authInfo.passphrase" />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog/index.vue'
import { UpdateToken, UploadKey } from '@/components/Form/FormFields'
import { encryptPassword } from '@/utils/crypto'

export default {
  name: 'UpdateSecretInfo',
  components: {
    Dialog,
    UploadKey,
    UpdateToken
  },
  props: {
    account: {
      type: Object,
      default: () => ({})
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      secretInfo: {
        password: '',
        private_key: '',
        passphrase: ''
      }
    }
  },
  methods: {
    handleConfirm() {
      const data = {}
      if (this.secretInfo.password !== '') {
        data.password = encryptPassword(this.secretInfo.password)
      }
      if (this.secretInfo.private_key !== '') {
        data.private_key = encryptPassword(this.secretInfo.private_key)
        if (this.secretInfo.passphrase) data.passphrase = this.secretInfo.passphrase
      }
      this.$axios.patch(
        `/api/v1/accounts/accounts/${this.account.id}/`,
        data,
        { disableFlashErrorMsg: true }
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
    getFile(file) {
      this.secretInfo.private_key = file
    }
  }
}
</script>

<style scoped>

</style>
