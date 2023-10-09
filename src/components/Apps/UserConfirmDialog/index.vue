<template>
  <Dialog
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
            type="info"
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
          <el-input v-model="secretValue" :placeholder="inputPlaceholder" :show-password="showPassword" />
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
      visible: false
    }
  },
  computed: {
    showPassword() {
      return this.confirmTypeRequired === 'password'
    },
    iHandler() {
      if (this.handler === null) {
        return () => this.$axios.get(this.url, { disableFlashErrorMsg: true })
      }
      return this.handler
    }
  },
  watch: {
    visible(val) {
      if (!val) {
        this.$emit('onConfirmCancel', true)
      }
    }
  },
  mounted() {
    this.performConfirm()
  },
  methods: {
    handleSubTypeChange(val) {
      this.inputPlaceholder = this.subTypeChoices.filter(item => item.name === val)[0]?.placeholder
      this.smsWidth = val === 'sms' ? 6 : 0
    },
    performConfirm() {
      this.iHandler().then((res) => {
        this.$emit('onConfirmDone', res)
      }).catch((err) => {
        const confirmType = err.response.data?.code
        const confirmUrl = '/api/v1/authentication/confirm/'
        this.$axios.get(confirmUrl, { params: { confirm_type: confirmType }}).then((data) => {
          this.subTypeChoices = data.content
          this.confirmTypeRequired = data.confirm_type

          if (this.confirmTypeRequired === 'relogin') {
            const data = {
              confirm_type: this.confirmTypeRequired,
              secret_key: ''
            }
            this.$axios.post(confirmUrl, data, { disableFlashErrorMsg: true }).then(() => {
              this.afterConfirm()
            }).catch(() => {
              this.title = this.$t('auth.NeedReLogin')
            })
            return
          }
          const defaultSubType = this.subTypeChoices.filter(item => !item.disabled)[0]
          this.subTypeSelected = defaultSubType.name
          this.inputPlaceholder = defaultSubType.placeholder
          this.visible = true
        }).catch(() => {
          this.$emit('AuthMFAError', true)
        })
      })
    },
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
    afterConfirm() {
      this.iHandler().then(res => {
        this.$emit('onConfirmDone', res)
      }).catch((e) => {
        this.$emit('onHandlerError', e)
      }).finally(() => {
        this.visible = false
      })
    },
    handleConfirm() {
      if (this.subTypeSelected === 'otp' && this.secretValue.length !== 6) {
        return this.$message.error(this.$tc('common.MFAErrorMsg'))
      }
      const data = {
        confirm_type: this.confirmTypeRequired,
        mfa_type: this.confirmTypeRequired === 'mfa' ? this.subTypeSelected : '',
        secret_key: this.secretValue
      }
      this.$axios.post(`/api/v1/authentication/confirm/`, data).then(res => {
        this.afterConfirm()
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
