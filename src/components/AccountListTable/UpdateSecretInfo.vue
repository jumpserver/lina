<template>
  <Dialog
    width="50"
    :title="this.$t('assets.UpdateAssetUserToken')"
    :visible.sync="visible"
    :destroy-on-close="true"
    @confirm="handleConfirm()"
    @cancel="handleCancel()"
    v-on="$listeners"
  >
    <el-form label-position="right" label-width="90px">
      <el-form-item :label="this.$t('assets.Hostname')">
        <el-input v-model="account.hostname" readonly />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Username')">
        <el-input v-model="account['username']" readonly />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Password')">
        <UpdateToken v-model="authInfo.password" />
      </el-form-item>
      <el-form-item :label="this.$t('assets.SSHSecretKey')">
        <UploadKey @input="getFile" />
      </el-form-item>
      <el-form-item :label="this.$t('assets.Passphrase')">
        <UpdateToken v-model="authInfo.passphrase" />
      </el-form-item>
    </el-form>
  </Dialog>
</template>

<script>
import Dialog from '@/components/Dialog'
import { UpdateToken, UploadKey } from '@/components/FormFields'
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
        data.password = encryptPassword(this.authInfo.password)
      }
      if (this.authInfo.private_key !== '') {
        data.private_key = encryptPassword(this.authInfo.private_key)
        if (this.authInfo.passphrase) data.passphrase = this.authInfo.passphrase
      }
      this.$axios.patch(
        `/api/v1/assets/accounts/${this.account.id}/`,
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
      this.authInfo.private_key = file
    }
  }
}
</script>

<style scoped>

</style>
