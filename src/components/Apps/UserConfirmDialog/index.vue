<template>
  <Dialog
    v-bind="$attrs"
    v-model:visible="visible"
    :close-on-click-modal="false"
    :destroy-on-close="true"
    :show-cancel="false"
    :show-confirm="false"
    :title="title"
    class="user-confirm-dialog"
    width="600px"
    @close="handleDialogClose"
    @confirm="visible = false"
  >
    <div v-if="confirmTypeRequired === 'relogin'">
      <el-row class="user-confirm-dialog__row" :gutter="24">
        <el-col :md="24" :sm="24">
          <el-alert :title="$tc('ReLoginTitle')" center style="margin-bottom: 20px" type="error" />
        </el-col>
      </el-row>
      <el-row class="user-confirm-dialog__row" :gutter="24">
        <el-col :md="24" :sm="24">
          <el-button class="confirm-btn" type="primary" @click="logout">
            {{ $t('ReLogin') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div v-else>
      <el-row class="user-confirm-dialog__row user-confirm-dialog__row--field" :gutter="24">
        <el-col :md="24" :sm="24" :span="24" class="add">
          <el-select
            v-model="subTypeSelected"
            class="user-confirm-dialog__select"
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
      <el-row
        v-if="!noCodeMFA.includes(subTypeSelected)"
        class="user-confirm-dialog__row user-confirm-dialog__row--field"
        :gutter="24"
      >
        <el-col :md="24" :sm="24" class="user-confirm-dialog__code-row">
          <el-input
            v-model="secretValue"
            class="user-confirm-dialog__input"
            :placeholder="inputPlaceholder"
            :show-password="showPassword"
            @keyup.enter="handleConfirm"
          />
          <span
            v-if="subTypeSelected === 'sms' || subTypeSelected === 'email'"
            class="user-confirm-dialog__code-action"
          >
            <el-button
              :disabled="smsBtnDisabled"
              class="user-confirm-dialog__code-button"
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
      <el-row class="user-confirm-dialog__row user-confirm-dialog__row--actions" :gutter="24">
        <el-col :md="24" :sm="24">
          <el-button
            v-if="!noCodeMFA.includes(subTypeSelected)"
            class="confirm-btn"
            type="primary"
            @click="handleConfirm"
          >
            {{ $t('Confirm') }}
          </el-button>
          <el-button
            v-if="subTypeSelected === 'face'"
            v-show="!isFaceCaptureVisible"
            class="confirm-btn"
            type="primary"
            @click="handleFaceCapture"
          >
            {{ $tc('VerifyFace') }}
          </el-button>
          <el-button
            v-if="subTypeSelected === 'passkey'"
            :loading="passkeyVisible"
            class="confirm-btn"
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
import { LOGOUT_PATH } from '@/utils/env'
import Dialog from '@/components/Dialog/index.vue'
import { encryptPassword } from '@/utils/secure'
import _ from 'lodash'

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
      passkeyUrl: '/api/v1/authentication/passkeys/login/?mfa=1',
      closeReason: ''
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
  beforeUnmount() {
    this.$eventBus.$off('showConfirmDialog', this.performConfirm)
  },
  methods: {
    handleSubTypeChange(val) {
      if (val !== 'face') {
        this.isFaceCaptureVisible = false
      }

      this.inputPlaceholder = this.subTypeChoices.filter(
        (item) => item.name === val
      )[0]?.placeholder
      this.smsWidth = val === 'sms' ? 6 : 0
    },
    performConfirm: _.debounce(function ({ response, callback, cancel }) {
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
        .then((data) => {
          this.confirmTypeRequired = data.confirm_type

          if (this.confirmTypeRequired === 'relogin') {
            this.$axios
              .post(confirmUrl, { confirm_type: 'relogin', secret_key: 'x' })
              .then(() => {
                this.closeReason = 'success'
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
          const defaultSubType = this.subTypeChoices.filter((item) => !item.disabled)[0]
          this.subTypeSelected = defaultSubType.name
          this.inputPlaceholder = defaultSubType.placeholder
          this.visible = true
        })
        .catch((err) => {
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
      window.location.href = `${LOGOUT_PATH}?next=${this.$route.fullPath}`
    },
    sendCode() {
      this.$axios
        .post(`/api/v1/authentication/mfa/select/`, { type: this.subTypeSelected })
        .then(() => {
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
        this.$axios.get(url).then(() => {
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
        .then((data) => {
          const token = data['token']
          this.faceCaptureUrl = '/facelive/capture?token=' + token
          this.isFaceCaptureVisible = true

          const timer = setInterval(() => {
            this.$axios.get(url + `?token=${token}`).then((data) => {
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
    resetDialogState() {
      this.secretValue = ''
      this.smsBtnText = this.$t('SendVerificationCode')
      this.smsBtnDisabled = false
      this.passkeyVisible = false
      this.faceCaptureUrl = null
      this.isFaceCaptureVisible = false
      this.processing = false
    },
    handleDialogClose() {
      const shouldCancel = this.closeReason !== 'success'
      this.resetDialogState()
      this.visible = false
      if (shouldCancel && this.cancel) {
        this.cancel(new Error('confirm dialog closed'))
      }
      this.closeReason = ''
      this.callback = null
      this.cancel = null
    },
    onSuccess() {
      this.closeReason = 'success'
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
        .catch((err) => {
          this.$message.error(err.message || this.$tc('ConfirmFailed'))
          this.faceCaptureUrl = null
          this.isFaceCaptureVisible = false
        })
    }
  }
}
</script>

<style lang="scss">
.el-dialog.dialog.user-confirm-dialog {
  .el-dialog__body {
    padding: 22px 40px 30px !important;
  }

  .user-confirm-dialog__select,
  .user-confirm-dialog__input {
    min-height: 30px;
  }

  .user-confirm-dialog__select .el-tooltip__trigger,
  .user-confirm-dialog__input,
  .el-input__wrapper,
  .el-select__wrapper {
    border-radius: 0;
  }

  .user-confirm-dialog__input .el-input__wrapper,
  .user-confirm-dialog__select .el-select__wrapper {
    min-height: 30px;
    height: 30px;
    box-sizing: border-box;
    padding: 0 11px;
    overflow: hidden;
    box-shadow: none !important;
    border: 1px solid var(--el-border-color) !important;
  }

  .user-confirm-dialog__input .el-input__wrapper:hover,
  .user-confirm-dialog__select .el-select__wrapper:hover {
    border-color: var(--el-border-color-hover) !important;
  }

  .user-confirm-dialog__input .el-input__wrapper.is-focus,
  .user-confirm-dialog__select .el-select__wrapper.is-focused {
    box-shadow: none !important;
    border-color: var(--el-color-primary) !important;
  }

  .user-confirm-dialog__input .el-input__inner,
  .user-confirm-dialog__select .el-select__selection,
  .user-confirm-dialog__select .el-select__selected-item,
  .user-confirm-dialog__select .el-select__placeholder {
    min-height: 100%;
    height: 100%;
    line-height: 28px;
    background: transparent !important;
    border: 0 !important;
    box-shadow: none !important;
    padding-left: 0 !important;
    margin-left: 0 !important;
  }
}

.user-confirm-dialog__row {
  margin: 0 !important;
}

.user-confirm-dialog__row--field + .user-confirm-dialog__row--field {
  margin-top: 16px !important;
}

.user-confirm-dialog__row--actions {
  margin-top: 20px !important;
}

.user-confirm-dialog__select,
.user-confirm-dialog__input {
  width: 100%;
}

.user-confirm-dialog__code-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-confirm-dialog__code-action {
  display: inline-flex;
  flex: 0 0 auto;
}

.user-confirm-dialog__code-button,
.confirm-btn {
  width: 100%;
  min-height: 30px;
  padding: 8px 12px;
  line-height: 1;
}

.user-confirm-dialog__code-button {
  min-width: 112px;
}
</style>
