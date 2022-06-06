<template>
  <Dialog
    :title="$t('common.CurrentUserVerify')"
    :width="'50'"
    :show-confirm="false"
    :show-cancel="false"
    :visible.sync="visible"
    :destroy-on-close="true"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <el-row :gutter="20">
      <el-col :md="4" :sm="24">
        <div style="line-height: 34px;text-align: center">{{ Label }}</div>
      </el-col>
      <el-col :md="14" :sm="24">
        <el-input v-model="SecretKey" />
        <span class="help-tips help-block">{{ HelpText }}</span>
      </el-col>
      <el-col :md="4" :sm="24">
        <el-button size="mini" type="primary" style="line-height:20px " @click="userConfirm">
          {{ this.$t('common.Confirm') }}
        </el-button>
      </el-col>
    </el-row>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog'

export default {
  name: 'UserConfirmDialog',
  components: {
    Dialog
  },
  data() {
    return {
      Label: '',
      HelpText: '',
      ConfirmType: '',
      SecretKey: '',
      visible: false
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$emit('UserConfirmCancel', true)
      }
    }
  },
  mounted() {
    this.$axios.get('/api/v1/authentication/confirm/', { disableFlashErrorMsg: true }).then(() => {
      this.$emit('UserConfirmDone', true)
    }).catch(err => {
      this.$log.debug('Verify otp code error: ', err)
      const backends = err.response.data.backends
      backends.sort((a, b) => b.level - a.level)
      this.ConfirmType = backends[0].name
      if (this.ConfirmType === 'relogin') {
        return this.$message.error(this.$t('auth.ReLogin'))
      } else if (this.ConfirmType === 'mfa') {
        this.Label = 'MFA'
        this.HelpText = this.$t('common.MFARequireForSecurity')
      } else if (this.ConfirmType === 'password') {
        this.Label = this.$t('setting.password')
        this.HelpText = this.$t('common.PasswordRequireForSecurity')
      }
      this.visible = true
    })
  },
  methods: {
    userConfirm() {
      if (this.ConfirmType === 'mfa' && this.SecretKey.length !== 6) {
        return this.$message.error(this.$tc('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/confirm/`, {
          confirm_type: this.ConfirmType,
          secret_key: this.SecretKey
        }
      ).then(res => {
        this.$emit('UserConfirmDone', true)
      })
    }
  }
}
</script>

<style scoped>

</style>
