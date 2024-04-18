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
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24">
          <el-alert
            :title="$tc('auth.ReLoginTitle')"
            center
            style="margin-bottom: 20px;"
            type="error"
          />
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24">
          <el-button class="confirm-btn" size="mini" type="primary" @click="logout">
            {{ this.$t('auth.ReLogin') }}
          </el-button>
        </el-col>
      </el-row>
    </div>
    <div v-else>
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24" :span="24" class="add">
          <el-select
            v-model="subTypeSelected"
            style="width: 100%; margin-bottom: 20px;"
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
      <el-row :gutter="24" style="margin: 0 auto;">
        <el-col :md="24" :sm="24" style="display: flex; margin-bottom: 20px;">
          <el-input
            v-model="secretValue"
            :placeholder="inputPlaceholder"
            :show-password="showPassword"
            @keyup.enter.native="handleConfirm"
          />
          <span v-if="subTypeSelected === 'sms'" style="margin: -1px 0 0 20px;">
            <el-button
              :disabled="smsBtnDisabled"
              size="mini"
              style="line-height:20px; float: right;"
              type="primary"
              @click="sendSMSCode"
            >
              {{ smsBtnText }}
            </el-button>
          </span>
        </el-col>
      </el-row>
      <el-row :gutter="24" style="margin: 10px auto;">
        <el-col :md="24" :sm="24">
          <el-button class="confirm-btn" size="mini" type="primary" @click="handleConfirm">
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
      default: ''
    },
    handler: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      title: this.$t('common.CurrentUserVerify'),
      smsWidth: 0,
      subTypeSelected: '',
      inputPlaceholder: '',
      smsBtnText: this.$t('common.SendVerificationCode'),
      smsBtnDisabled: false,
      confirmTypeRequired: '',
      subTypeChoices: [],
      secretValue: '',
      visible: false,
      callback: null,
      cancel: null,
      processing: false
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
      this.inputPlaceholder = this.subTypeChoices.filter(item => item.name === val)[0]?.placeholder
      this.smsWidth = val === 'sms' ? 6 : 0
    },
    performConfirm: _.throttle(function({ response, callback, cancel }) {
      if (this.processing || this.visible) {
        return
      }
      this.processing = true
      this.callback = callback
      this.cancel = cancel
      this.$log.debug('perform confirm action')
      const confirmType = response.data?.code
      const confirmUrl = '/api/v1/authentication/confirm/'
      this.$axios.get(confirmUrl, { params: { confirm_type: confirmType }}).then((data) => {
        this.confirmTypeRequired = data.confirm_type

        if (this.confirmTypeRequired === 'relogin') {
          this.$axios.post(confirmUrl, { 'confirm_type': 'relogin', 'secret_key': 'x' }).then(() => {
            this.callback()
            this.visible = false
          }).catch(() => {
            this.title = this.$t('auth.NeedReLogin')
            this.visible = true
          })
          return
        }
        this.subTypeChoices = data.content
        const defaultSubType = this.subTypeChoices.filter(item => !item.disabled)[0]
        this.subTypeSelected = defaultSubType.name
        this.inputPlaceholder = defaultSubType.placeholder
        this.visible = true
      }).catch((err) => {
        const data = err.response?.data
        const msg = data?.error || data?.detail || data?.msg || this.$t('common.GetConfirmTypeFailed')
        this.$message.error(msg)
        this.cancel(err)
      }).finally(() => {
        this.processing = false
      })
    }, 300),
    logout() {
      window.location.href = `${process.env.VUE_APP_LOGOUT_PATH}?next=${this.$route.fullPath}`
    },
    sendSMSCode() {
      this.$axios.post(`/api/v1/authentication/mfa/select/`, { type: 'sms' }).then(res => {
        this.$message.success(this.$tc('common.VerificationCodeSent'))
        let time = 60
        const interval = setInterval(() => {
          const originText = this.smsBtnText
          this.smsBtnText = this.$t('common.Pending') + `: ${time}`
          this.smsBtnDisabled = true
          time -= 1

          if (time === 0) {
            this.smsBtnText = originText
            this.smsBtnDisabled = false
            clearInterval(interval)
          }
        }, 1000)
      })
    },
    handleConfirm() {
      if (this.confirmTypeRequired === 'relogin') {
        return this.logout()
      }
      if (this.subTypeSelected === 'otp' && this.secretValue.length !== 6) {
        return this.$message.error(this.$tc('common.MFAErrorMsg'))
      }
      const data = {
        confirm_type: this.confirmTypeRequired,
        mfa_type: this.confirmTypeRequired === 'mfa' ? this.subTypeSelected : '',
        secret_key: this.secretValue
      }
      this.$axios.post(`/api/v1/authentication/confirm/`, data).then(res => {
        this.callback()
        this.secretValue = ''
        this.visible = false
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
