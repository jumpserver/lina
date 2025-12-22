<template>
  <Dialog
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    :visible.sync="visible"
    class="dialog-content"
    v-bind="$attrs"
    width="600px"
    @confirm="visible = false"
    v-on="$listeners"
  >
    <div v-if="confirmTypeRequired === 'relogin'">
      <el-row :gutter="24" style="margin: 0 auto">
        <el-col :md="24" :sm="24">
          <el-alert :title="$tc('ReLoginTitle')" center style="margin-bottom: 20px" type="error" />
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 0 auto">
        <el-col :md="24" :sm="24">
          <el-button class="confirm-btn" size="mini" type="primary" @click="logout">
            {{ $t('ReLogin') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div v-else>
      <el-row :gutter="24" style="margin: 0 auto">
        <el-col :md="24" :sm="24" :span="24" class="add">
          <el-select
            v-model="subTypeSelected"
            style="width: 100%; margin-bottom: 20px"
            @change="handleSubTypeChange"
          >
            <el-option
              v-for="item of subTypeChoices"
              :key="item.name"
              :disabled="item.disabled"
              :label="item.display_name"
              :value="item.name"
            />
          </el-select>
        </el-col>
      </el-row>
      <el-row v-if="!noCodeMFA.includes(subTypeSelected)" :gutter="24" style="margin: 0 auto">
        <el-col :md="24" :sm="24" style="display: flex; align-items: center">
          <el-input
            v-model="secretValue"
            :placeholder="inputPlaceholder"
            :show-password="showPassword"
            @keyup.enter.native="handleConfirm"
          />
          <span
            v-if="subTypeSelected === 'sms' || subTypeSelected === 'email'"
            style="margin: -1px 0 0 20px"
          >
            <el-button
              :disabled="smsBtnDisabled"
              size="mini"
              style="line-height: 14px; float: right"
              type="primary"
              @click="sendCode"
            >
              {{ smsBtnText }}
            </el-button>
          </span>
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <iframe v-if="passkeyVisible" :src="passkeyUrl" style="display: none" />
          <iframe
            v-if="isFaceCaptureVisible && subTypeSelected === 'face' && faceCaptureUrl"
            :src="faceCaptureUrl"
            allow="camera"
            sandbox="allow-scripts allow-same-origin"
            style="width: 100%; height: 600px; border: none"
          />
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 20px auto 10px">
        <el-col :md="24" :sm="24">
          <el-button
            v-if="!noCodeMFA.includes(subTypeSelected)"
            class="confirm-btn"
            size="mini"
            type="primary"
            @click="handleConfirm"
          >
            {{ $t('Confirm') }}
          </el-button>
          <el-button
            v-if="subTypeSelected === 'face'"
            v-show="!isFaceCaptureVisible"
            class="confirm-btn"
            size="mini"
            type="primary"
            @click="handleFaceCapture"
          >
            {{ $tc('VerifyFace') }}
          </el-button>
          <el-button
            v-if="subTypeSelected === 'passkey'"
            v-loading="passkeyVisible"
            class="confirm-btn"
            size="mini"
            type="primary"
            @click="handlePasskeyVerify"
          >
            {{ $tc('Next') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
  </Dialog>
</template>
<script>
import Dialog from '@/components/Dialog/index.vue'
import { encryptPassword } from '@/utils/secure'

export default {
  name: 'UserConfirmDialog',
  components: {
    Dialog
  },
  props: {
    url: {
      type: String,
      default: ''
    },
    handler: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      title: this.$t('CurrentUserVerify'),
      smsWidth: 0,
      subTypeSelected: '',
      inputPlaceholder: '',
      smsBtnText: this.$t('SendVerificationCode'),
      smsBtnDisabled: false,
      confirmTypeRequired: '',
      subTypeChoices: [],
      secretValue: '',
      visible: false,
      callback: null,
      cancel: null,
      processing: false,
      isFaceCaptureVisible: false,
      faceToken: null,
      faceCaptureUrl: null,
      noCodeMFA: ['face', 'passkey'],
      sendCodeMFA: ['email', 'sms', 'otp'],
      passkeyVisible: false,
      passkeyUrl: '/api/v1/authentication/passkeys/login/?mfa=1'
    }
  },
  computed: {
    showPassword() {
      return this.confirmTypeRequired === 'password'
    }
  },
  mounted() {
    this.$eventBus.$on('showConfirmDialog', this.performConfirm)
  },
  beforeDestroy() {
    this.$eventBus.$off('showConfirmDialog', this.performConfirm)
  },
  methods: {
    handleSubTypeChange(val) {
      if (val !== 'face') {
        this.isFaceCaptureVisible = false
      }

      this.inputPlaceholder = this.subTypeChoices.filter(item => item.name === val)[0]?.placeholder
      this.smsWidth = val === 'sms' ? 6 : 0
    },
    performConfirm: _.debounce(function({ response, callback, cancel }) {
      if (this.processing || this.visible) {
        return
      }
      this.processing = true
      this.callback = callback
      this.cancel = cancel
      this.$log.debug('perform confirm action')
      const confirmType = response.data?.code
      const confirmUrl = '/api/v1/authentication/confirm/'
      this.$axios
        .get(confirmUrl, { params: { confirm_type: confirmType } })
        .then(data => {
          this.confirmTypeRequired = data.confirm_type

          if (this.confirmTypeRequired === 'relogin') {
            this.$axios
              .post(confirmUrl, { confirm_type: 'relogin', secret_key: 'x' })
              .then(() => {
                this.callback()
                this.visible = false
              })
              .catch(() => {
                this.title = this.$t('NeedReLogin')
                this.visible = true
              })
            return
          }
          this.subTypeChoices = data.content
          const defaultSubType = this.subTypeChoices.filter(item => !item.disabled)[0]
          this.subTypeSelected = defaultSubType.name
          this.inputPlaceholder = defaultSubType.placeholder
          this.visible = true
        })
        .catch(err => {
          const data = err.response?.data
          const msg = data?.error || data?.detail || data?.msg || this.$t('GetConfirmTypeFailed')
          this.$message.error(msg)
          this.cancel(err)
        })
        .finally(() => {
          this.processing = false
        })
    }, 500),
    logout() {
      window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
    },
    sendCode() {
      this.$axios
        .post(`/api/v1/authentication/mfa/select/`, { type: this.subTypeSelected })
        .then(res => {
          this.$message.success(this.$tc('VerificationCodeSent'))
          let time = 60
          this.smsBtnDisabled = true

          const interval = setInterval(() => {
            time -= 1
            this.smsBtnText = `${this.$t('Pending')}: ${time}`

            if (time <= 0) {
              clearInterval(interval)
              this.smsBtnText = this.$t('SendVerificationCode')
              this.smsBtnDisabled = false
            }
          }, 1000)
        })
        .catch(() => {
          this.$message.error(this.$tc('FailedToSendVerificationCode'))
        })
    },
    handlePasskeyVerify() {
      this.passkeyVisible = true
      this.checkPasskeyStatus()
    },
    checkPasskeyStatus() {
      const url = '/api/v1/authentication/confirm/check/?confirm_type=mfa'
      const t = setInterval(() => {
        this.$axios.get(url).then(data => {
          this.passkeyVisible = false
          this.onSuccess()
        })
      }, 2000)
      setTimeout(() => {
        clearInterval(t)
        if (this.passkeyVisible) {
          this.passkeyVisible = false
          this.$message.error(this.$tc('PasskeyTimeout'))
        }
      }, 20000)
    },
    startFaceCapture() {
      const url = '/api/v1/authentication/face/context/'
      this.$axios
        .post(url)
        .then(data => {
          const token = data['token']
          this.faceCaptureUrl = '/facelive/capture?token=' + token
          this.isFaceCaptureVisible = true

          const timer = setInterval(() => {
            this.$axios.get(url + `?token=${token}`).then(data => {
              if (data['is_finished']) {
                clearInterval(timer)
                this.isFaceCaptureVisible = false
                this.handleConfirm()
              }
            })
          }, 1000)
        })
        .catch(() => {
          this.$message.error(this.$tc('FailedToStartFaceCapture'))
        })
    },
    handleFaceCapture() {
      this.startFaceCapture()
    },
    onSuccess() {
      this.secretValue = ''
      this.visible = false
      this.$nextTick(() => {
        this.callback()
      })
    },
    handleConfirm() {
      if (this.confirmTypeRequired === 'relogin') {
        return this.logout()
      }
      if (this.subTypeSelected === 'otp' && this.secretValue.length !== 6) {
        return this.$message.error(this.$tc('MFAErrorMsg'))
      }

      const data = {
        confirm_type: this.confirmTypeRequired,
        mfa_type: this.confirmTypeRequired === 'mfa' ? this.subTypeSelected : '',
        secret_key:
          this.confirmTypeRequired === 'password'
            ? encryptPassword(this.secretValue)
            : this.secretValue
      }

      this.$axios
        .post(`/api/v1/authentication/confirm/`, data)
        .then(() => {
          this.onSuccess()
        })
        .catch(err => {
          this.$message.error(err.message || this.$tc('ConfirmFailed'))
          this.faceCaptureUrl = null
          this.isFaceCaptureVisible = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
.dialog-content :deep(.el-dialog__footer) {
  padding: 0;
}

.dialog-content :deep(.el-dialog) {
  padding: 8px;

  .el-dialog__body {
    padding-top: 30px;
    padding-bottom: 30px;
  }
}

.confirm-btn {
  width: 100%;
  line-height: 20px;
}
</style>
