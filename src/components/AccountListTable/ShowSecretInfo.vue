<template>
  <div>
    <Dialog
      :title="dialogTitle"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
      :width="'50'"
      v-bind="$attrs"
      @opened="getAuthInfo"
      v-on="$listeners"
    >
      <el-row v-if="requireMFAVerify" :gutter="20">
        <el-col :span="4">
          <div style="line-height: 34px;text-align: center">MFA</div>
        </el-col>
        <el-col :span="14">
          <el-input v-model="MFAToken" />
          <span class="help-tips help-block">{{ $t('common.MFARequireForSecurity') }}</span>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" style="line-height:20px " @click="verifyMFA">
            {{ this.$t('common.Confirm') }}
          </el-button>
        </el-col>
      </el-row>
      <div v-if="showAuthInfo">
        <el-form label-position="right" label-width="80px" :model="authInfo">
          <el-form-item :label="this.$t('assets.Hostname')">
            <el-input v-model="account.hostname" readonly />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Username')">
            <el-input v-model="account['username_display']" readonly />
          </el-form-item>
          <el-form-item :label="this.$t('assets.Password')">
            <el-input v-model="authInfo.password" type="password" show-password />
          </el-form-item>
          <el-form-item :label="this.$t('assets.SSHKey')">
            <el-input v-model="authInfo['private_key']" type="password" show-password />
          </el-form-item>
        </el-form>
      </div>
    </Dialog>
  </div>
</template>

<script>
import Dialog from '@/components/Dialog'
export default {
  name: 'ShowSecretInfo',
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
      dialogTitle: this.$t('common.ViewSecret'),
      authInfo: {},
      MFAToken: '',
      requireMFAVerify: false,
      showAuthInfo: false
    }
  },
  methods: {
    getAuthInfo() {
      const url = `/api/v1/assets/accounts/${this.account.id}/auth-info/`
      this.$axios.get(url, { disableFlashErrorMsg: true }).then(resp => {
        this.authInfo = resp
        this.showAuthInfo = true
      }).catch(err => {
        const errorCode = _.get(err, 'response.data.code')
        if (errorCode === 'mfa_verify_required') {
          this.requireMFAVerify = true
        } else {
          this.showAuthInfo = true
          this.$message.error(this.$tc('common.GetAccountAuthInfoFailed') + ': ' + err)
        }
      })
    },
    verifyMFA() {
      if (this.MFAToken.length !== 6) {
        return this.$message.error(this.$tc('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/otp/verify/`, {
          code: this.MFAToken
        }
      ).then(res => {
        this.requireMFAVerify = false
        this.getAuthInfo()
      })
    }
  }
}
</script>

<style scoped>

</style>
