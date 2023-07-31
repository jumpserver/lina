<template>
  <Dialog
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="visible"
    :width="'36%'"
    class="dialog-content"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <div v-if="ConfirmType === 'relogin'">
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24">
          <el-alert
            :closable="false"
            :title="$tc('auth.ReLoginTitle')"
            center
            style="margin-bottom: 20px;"
            type="info"
          />
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24">
          <el-button
            size="mini"
            style="width: 100%; line-height:20px;"
            type="primary"
            @click="logOut"
          >
            {{ this.$t('auth.ReLogin') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div v-else>
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24" :span="24" class="add">
          <el-select
            v-model="Select"
            :disabled="ConfirmType === 'password'"
            style="width: 100%; margin-bottom: 20px;"
            @change="helpText(Select)"
          >
            <el-option
              v-for="(item, i) of Content"
              :key="i"
              :disabled="item.disabled"
              :label="item.display_name"
              :value="item.name"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24" style="display: flex; margin-bottom: 20px;">
          <el-input v-model="SecretKey" :placeholder="HelpText" :show-password="showPassword" />
          <span v-if="Select === 'sms'" style="margin: -1px 0 0 20px;">
            <el-button
              :disabled="smsBtndisabled"
              size="mini"
              style="line-height:20px; float: right;"
              type="primary"
              @click="sendChallengeCode"
            >
              {{ smsBtnText }}
            </el-button>
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24">
          <el-button
            size="mini"
            style="width: 100%; line-height:20px;"
            type="primary"
            @click="userConfirm"
          >
            {{ this.$t('common.Confirm') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog/index.vue'

export default {
  name: 'UserConfirmDialog',
  components: {
    Dialog
  },
  props: {
    url: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      title: '',
      smsWidth: 0,
      Select: '',
      Level: null,
      HelpText: '',
      smsBtnText: '',
      smsBtndisabled: false,
      ConfirmType: '',
      Content: null,
      SecretKey: '',
      visible: false
    }
  },

  computed: {
    showPassword() {
      if (this.ConfirmType === 'password') {
        return true
      }
      return false
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
    this.smsBtnText = this.$t('common.SendVerificationCode')
    this.$axios.get(`${this.url}`, { disableFlashErrorMsg: true }).then(
      () => { this.$emit('UserConfirmDone', true) }).catch((err) => {
      const confirm_type = err.response.data.code
      this.$axios.get('/api/v1/authentication/confirm/', { params: { confirm_type: confirm_type }}).then((data) => {
        this.ConfirmType = data.confirm_type
        this.Content = data.content
        if (this.ConfirmType === 'relogin') {
          this.$axios.post(
            `/api/v1/authentication/confirm/`,
            {
              confirm_type: this.ConfirmType,
              secret_key: ''
            },
            { disableFlashErrorMsg: true },
          ).then(() => { this.$emit('UserConfirmDone', true) }).catch(() => {
            this.title = this.$t('auth.NeedReLogin')
            this.visible = true
          })
          return
        }
        if (this.ConfirmType === 'mfa') {
          this.Select = this.Content.filter(item => !item.disabled)[0].name
          if (this.Select === 'sms') {
            this.smsWidth = 6
          }
          this.HelpText = this.Content.filter(item => !item.disabled)[0].placeholder
        } else if (this.ConfirmType === 'password') {
          this.Select = this.$t('setting.password')
          this.HelpText = this.$t('common.PasswordRequireForSecurity')
          this.Content = [{ 'name': 'password' }]
        }
        this.title = this.$t('common.CurrentUserVerify')
        this.visible = true
      }).catch(() => {
        this.$emit('AuthMFAError', true)
      })
    })
  },
  methods: {
    helpText(val) {
      this.HelpText = this.Content.filter(item => item.name === val)[0]?.placeholder
      if (val === 'sms') {
        this.smsWidth = 6
      } else {
        this.smsWidth = 0
      }
    },
    logOut() {
      window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
    },
    sendChallengeCode() {
      this.$axios.post(
        `/api/v1/authentication/mfa/select/`, {
          type: 'sms'
        }
      ).then(res => {
        this.$message.success(this.$t('common.VerificationCodeSent'))
        let time = 60
        const interval = setInterval(() => {
          this.smsBtnText = this.$t('common.Pending') + `: ${time}`
          this.smsBtndisabled = true
          time -= 1

          if (time === 0) {
            this.smsBtnText = this.$t('common.SendVerificationCode')
            this.smsBtndisabled = false
            clearInterval(interval)
          }
        }, 1000)
      })
    },
    userConfirm() {
      if (this.Select === 'otp' && this.SecretKey.length !== 6) {
        return this.$message.error(this.$t('common.MFAErrorMsg'))
      }
      this.$axios.post(
        `/api/v1/authentication/confirm/`, {
          confirm_type: this.ConfirmType,
          mfa_type: this.ConfirmType === 'password' ? undefined : this.Select,
          secret_key: this.SecretKey
        }
      ).then(res => {
        this.$emit('UserConfirmDone', true)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
  .dialog-content >>> .el-dialog__footer {
    padding: 0;
  }

  .dialog-content >>> .el-dialog {
    padding: 8px;
  }
</style>
