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
      <el-alert :title="$t('IdentityConfirm.ReloginHint')" :closable="false" type="warning" />
      <div class="user-confirm-dialog__relogin-actions">
        <el-button @click="visible = false">{{ $t('Cancel') }}</el-button>
        <el-button type="primary" @click="logout">
          {{ $t('IdentityConfirm.GoToLogin') }}
        </el-button>
      </div>
    </div>
    <div v-else class="jms-form-controls">
      <p class="user-confirm-dialog__hint">
        {{ $t(showPassword ? 'IdentityConfirm.PasswordHint' : 'IdentityConfirm.MFAHint') }}
      </p>
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
      <el-row class="user-confirm-dialog__row user-confirm-dialog__row--face" :gutter="24">
        <el-col>
          <iframe v-if="passkeyVisible" :src="passkeyUrl" style="display: none" />
          <iframe
            v-if="isFaceCaptureVisible && subTypeSelected === 'face' && faceCaptureUrl"
            ref="faceCaptureFrame"
            class="user-confirm-dialog__face-frame"
            :src="faceCaptureUrl"
            allow="camera"
            sandbox="allow-scripts allow-same-origin"
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
      confirmGeneration: 0,
      isFaceCaptureVisible: false,
      faceToken: null,
      faceCaptureUrl: null,
      faceStatusTimer: null,
      faceStatusRequestPending: false,
      faceCaptureGeneration: 0,
      noCodeMFA: ['face', 'passkey'],
      sendCodeMFA: ['email', 'sms', 'otp'],
      passkeyVisible: false,
      passkeyStatusTimer: null,
      passkeyTimeout: null,
      passkeyRequestPending: false,
      passkeyGeneration: 0,
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
    window.addEventListener('message', this.handleFaceCaptureMessage)
  },
  beforeUnmount() {
    this.$eventBus.$off('showConfirmDialog', this.performConfirm)
    window.removeEventListener('message', this.handleFaceCaptureMessage)
    this.confirmGeneration += 1
    this.stopPasskeyVerification()
    this.stopFaceCapture()
  },
  methods: {
    handleSubTypeChange(val) {
      this.confirmGeneration += 1
      if (val !== 'passkey') {
        this.stopPasskeyVerification()
      }
      if (val !== 'face') {
        this.stopFaceCapture()
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
      this.closeReason = ''
      this.title = this.$t('CurrentUserVerify')
      this.callback = callback
      this.cancel = cancel
      const generation = ++this.confirmGeneration
      this.$log.debug('perform confirm action')
      const confirmType = response.data?.code
      const confirmUrl = '/api/v1/authentication/confirm/'
      this.$axios
        .get(confirmUrl, {
          params: { confirm_type: confirmType },
          disableFlashErrorMsg: true
        })
        .then((data) => {
          if (generation !== this.confirmGeneration) return
          this.confirmTypeRequired = data.confirm_type

          if (this.confirmTypeRequired === 'relogin') {
            this.title = this.$t('NeedReLogin')
            if (data.relogin_required !== false) {
              this.visible = true
              return
            }
            // A recent login is already proof of identity; no extra user action is needed.
            return this.$axios
              .post(
                confirmUrl,
                { confirm_type: 'relogin', secret_key: 'x' },
                { disableFlashErrorMsg: true }
              )
              .then(() => {
                if (generation === this.confirmGeneration) this.onSuccess()
              })
              .catch((err) => {
                if (generation !== this.confirmGeneration) return
                if (err.response?.data?.code !== 'relogin_required') throw err
                // The recent-login window may have expired since discovery. Ask before leaving.
                this.visible = true
              })
          }
          this.subTypeChoices = data.content
          const defaultSubType = this.subTypeChoices.filter((item) => !item.disabled)[0]
          this.subTypeSelected = defaultSubType.name
          this.inputPlaceholder = defaultSubType.placeholder
          this.visible = true
        })
        .catch((err) => {
          if (generation !== this.confirmGeneration) return
          const data = err.response?.data
          const msg = data?.error || data?.detail || data?.msg || this.$t('GetConfirmTypeFailed')
          this.$message.error(msg)
          this.callback = null
          this.cancel = null
          cancel(err)
        })
        .finally(() => {
          if (generation === this.confirmGeneration) this.processing = false
        })
    }, 500),
    logout() {
      const { origin, pathname, search, hash } = window.location
      const logoutUrl = new URL(LOGOUT_PATH, origin)
      logoutUrl.searchParams.set('next', `${pathname}${search}${hash}`)
      this.handleDialogClose()
      window.location.href = logoutUrl.toString()
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
      this.checkPasskeyStatus()
    },
    checkPasskeyStatus() {
      this.stopPasskeyVerification()
      this.passkeyVisible = true
      const generation = this.passkeyGeneration
      const url = '/api/v1/authentication/confirm/check/?confirm_type=mfa'
      this.passkeyStatusTimer = setInterval(() => {
        if (generation !== this.passkeyGeneration || this.passkeyRequestPending) return
        this.passkeyRequestPending = true
        this.$axios
          .get(url, { disableFlashErrorMsg: true, skipUserConfirmation: true })
          .then(() => {
            if (generation !== this.passkeyGeneration) return
            this.onSuccess()
          })
          .catch(() => {
            // No confirmation yet; keep checking until completion or timeout.
          })
          .finally(() => {
            if (generation === this.passkeyGeneration) this.passkeyRequestPending = false
          })
      }, 2000)
      this.passkeyTimeout = setTimeout(() => {
        if (generation !== this.passkeyGeneration) return
        this.stopPasskeyVerification()
        this.$message.error(this.$tc('PasskeyTimeout'))
      }, 20000)
    },
    stopPasskeyVerification() {
      this.passkeyGeneration += 1
      if (this.passkeyStatusTimer) clearInterval(this.passkeyStatusTimer)
      if (this.passkeyTimeout) clearTimeout(this.passkeyTimeout)
      this.passkeyStatusTimer = null
      this.passkeyTimeout = null
      this.passkeyRequestPending = false
      this.passkeyVisible = false
    },
    startFaceCapture() {
      const url = '/api/v1/authentication/face/context/'
      this.stopFaceCapture()
      const generation = this.faceCaptureGeneration
      this.$axios
        .post(url)
        .then((data) => {
          if (generation !== this.faceCaptureGeneration) return
          const token = data['token']
          const uiIndex = window.location.pathname.indexOf('/ui/')
          const sitePrefix = uiIndex > 0 ? window.location.pathname.slice(0, uiIndex) : ''
          this.faceToken = token
          this.faceCaptureUrl = `${sitePrefix}/luna/facelive/capture?token=${encodeURIComponent(token)}`
          this.isFaceCaptureVisible = true

          this.faceStatusTimer = setInterval(() => {
            if (this.faceStatusRequestPending) return
            this.faceStatusRequestPending = true
            this.$axios
              .get(url + `?token=${encodeURIComponent(token)}`)
              .then((state) => {
                if (generation !== this.faceCaptureGeneration) return
                if (!state['is_finished']) return
                this.clearFaceStatusTimer()
                this.isFaceCaptureVisible = false
                this.faceCaptureUrl = null
                if (state['success']) {
                  this.handleConfirm()
                } else {
                  this.$message.error(state['error_message'] || this.$tc('ConfirmFailed'))
                }
              })
              .catch((error) => {
                if (generation !== this.faceCaptureGeneration) return
                if ([403, 404].includes(error.response?.status)) {
                  this.stopFaceCapture()
                  this.$message.error(this.$tc('FailedToStartFaceCapture'))
                }
              })
              .finally(() => {
                if (generation === this.faceCaptureGeneration) this.faceStatusRequestPending = false
              })
          }, 1000)
        })
        .catch(() => {
          if (generation !== this.faceCaptureGeneration) return
          this.$message.error(this.$tc('FailedToStartFaceCapture'))
        })
    },
    handleFaceCapture() {
      this.startFaceCapture()
    },
    clearFaceStatusTimer() {
      if (this.faceStatusTimer) {
        clearInterval(this.faceStatusTimer)
        this.faceStatusTimer = null
      }
      this.faceStatusRequestPending = false
    },
    stopFaceCapture() {
      this.faceCaptureGeneration += 1
      this.clearFaceStatusTimer()
      this.faceToken = null
      this.faceCaptureUrl = null
      this.isFaceCaptureVisible = false
    },
    handleFaceCaptureMessage(event) {
      const frame = this.$refs.faceCaptureFrame
      if (!frame || event.source !== frame.contentWindow || !this.faceCaptureUrl) return
      if (event.origin !== new URL(this.faceCaptureUrl, window.location.origin).origin) return
      const message = event.data
      if (message?.source === 'jumpserver-facelive' && message.event === 'retry_requested') {
        this.startFaceCapture()
      }
    },
    resetDialogState() {
      this.secretValue = ''
      this.smsBtnText = this.$t('SendVerificationCode')
      this.smsBtnDisabled = false
      this.stopPasskeyVerification()
      this.stopFaceCapture()
      this.processing = false
    },
    handleDialogClose() {
      this.confirmGeneration += 1
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
      this.confirmGeneration += 1
      this.closeReason = 'success'
      this.secretValue = ''
      this.processing = false
      this.stopPasskeyVerification()
      this.stopFaceCapture()
      // 先捕获 callback 引用：this.visible = false 会触发 Dialog @close →
      // handleDialogClose，那里会把 this.callback 置 null,若在 nextTick 里再取
      // this.callback 就会是 null，导致 "this.callback is not a function"。
      const callback = this.callback
      this.visible = false
      this.$nextTick(() => {
        if (typeof callback === 'function') {
          callback()
        }
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
      const generation = this.confirmGeneration

      this.$axios
        .post(`/api/v1/authentication/confirm/`, data)
        .then(() => {
          if (generation === this.confirmGeneration) this.onSuccess()
        })
        .catch((err) => {
          if (generation !== this.confirmGeneration) return
          this.$message.error(err.message || this.$tc('ConfirmFailed'))
          this.stopFaceCapture()
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
}

.user-confirm-dialog__row {
  margin: 0 !important;
}

.user-confirm-dialog__hint {
  margin: 0 12px 20px;
  color: var(--color-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.user-confirm-dialog__relogin-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 20px;

  .el-button + .el-button {
    margin-left: 0;
  }
}

.user-confirm-dialog__row--field + .user-confirm-dialog__row--field {
  margin-top: 16px !important;
}

.user-confirm-dialog__row--face {
  margin-top: 16px !important;
}

.user-confirm-dialog__row--actions {
  margin-top: 20px !important;
}

.user-confirm-dialog__select,
.user-confirm-dialog__input {
  width: 100%;
}

.user-confirm-dialog__face-frame {
  display: block;
  width: 100%;
  height: 600px;
  border: 0;
}

// 验证码行:输入框自适应宽度 + 「发送验证码」按钮固定宽度,始终同一行(修复按钮掉到下一行)。
// 用 .user-confirm-dialog 作用域提升优先级:既确保 .code-row 的 flex 生效(不被 .el-col 覆盖回 block),
// 又覆盖 __input 的全局 width:100%,让输入框在 flex 行内自适应剩余空间。
.user-confirm-dialog .user-confirm-dialog__code-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
}

.user-confirm-dialog .user-confirm-dialog__code-row .user-confirm-dialog__input {
  flex: 1 1 auto;
  width: auto;
  min-width: 0;
}

.user-confirm-dialog__code-action {
  display: inline-flex;
  flex: 0 0 auto;
}

.confirm-btn {
  width: 100%;
  min-height: 30px;
  padding: 8px 12px;
  line-height: 1;
}

.user-confirm-dialog__code-button {
  width: auto;
  min-width: 112px;
  min-height: 30px;
  padding: 8px 12px;
  line-height: 1;
  white-space: nowrap;
}
</style>
