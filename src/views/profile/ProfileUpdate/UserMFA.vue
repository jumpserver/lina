<template>
  <div>
    <el-row>
      <IBox>
        <el-steps :active="active">
          <el-step v-if="hasFirst" @click.native="goto(1)" />
          <el-step @click.native="goto(2)" />
          <el-step @click.native="goto(3)" />
        </el-steps>
      </IBox>
    </el-row>
    <el-row>
      <IBox>
        <GenericCreateUpdateForm
          v-if="active===1"
          :has-reset="false"
          :default-button="false"
          :fields="fields"
          :fields-meta="fieldsMeta"
          :url="url"
          :submit-method="submitMethod"
        />
        <div v-if="active===2" style="text-align: center">
          <el-row>
            <h1>{{ this.$t('users.InstallApp') }}</h1>
          </el-row>
          <el-row>
            <h3>{{ this.$t('users.HelpText.InstallMFAApp') }}</h3>
          </el-row>
          <el-row :gutter="100">
            <el-col :span="6" :offset="6">
              <el-image
                src="/static/img/authenticator_android.png"
              />
            </el-col>
            <el-col :span="6">
              <el-image
                src="/static/img/authenticator_iphone.png"
              />
            </el-col>
          </el-row>
          <el-row>
            <h3>{{ this.$t('users.HelpText.InstallMFAAppBind') }}</h3>
          </el-row>
          <el-row>
            <el-button type="primary" @click="tabTwoClick()">{{ this.$t('common.Next') }}</el-button>
          </el-row>
        </div>
        <div v-if="active===3" style="text-align: center">
          <div style="width: 450px; margin: auto">
            <el-row>
              <h1>{{ this.$t('users.BindMFA') }}</h1>
            </el-row>
            <el-row>
              <h3>{{ this.$t('users.HelpText.MFAScanQR') }}</h3>
            </el-row>
            <el-row>
              <QRCode :url="otp_uri" />
              <p>Secret: {{ otp_secret_key }}</p>
            </el-row>
            <el-row>
              <el-input v-model="otp_code" :placeholder="$tc('common.SixNumber')" />
            </el-row>
            <el-row>
              <el-button type="primary" size="medium" @click="onBind">{{ this.$t('common.Next') }}</el-button>
            </el-row>
          </div>
        </div>
      </IBox>
    </el-row>
    <Dialog
      :visible.sync="dialogDisabledOtp"
      top="20vh"
      :title="$tc('users.DisableOtp')"
      @cancel="dialogDisabledOtp = false"
      @confirm="onDisabled"
    >
      <div style="text-align: center">
        <div class="block">
          <h3>{{ this.$t('users.helpText.AccountProtect') }}</h3>
          <el-image src="/static/img/otp_auth.png" style="width: 72px; height: 117px;" />
        </div>
        <p style="margin: 20px auto;">Open MFA Authenticator and enter the 6-bit dynamic code</p>
        <el-input v-model="otp_reset_code" :placeholder="$tc('common.SixNumber')" style="width: 50%" />
      </div>
    </Dialog>
  </div>
</template>

<script>
import { IBox, QRCode, Dialog } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import RowButton from '@/components/FormFields/RowButton'
import { getErrorResponseMsg, redirectUrl } from '@/utils/common'

export default {
  name: 'UserMFA',
  components: {
    IBox,
    QRCode,
    Dialog,
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    },
    hasFirst: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      active: this.hasFirst ? 1 : 2,
      otp_uri: '',
      otp_secret_key: '',
      otp_code: '',
      otp_reset_code: '',
      dialogDisabledOtp: false,
      url: '/api/v1/users/profile/',
      fields: ['mfa_enabled', 'mfa_backends'],
      fieldsMeta: {
        mfa_enabled: {
          label: this.$t('users.EnableOtp'),
          disabled: this.object?.mfa_force_enabled,
          on: {
            change: ([val]) => {
              this.$axios.patch(`/api/v1/users/profile/`, { mfa_level: val ? 1 : 0 })
            }
          }
        },
        mfa_backends: {
          label: this.$t('users.MfaLevel'),
          component: RowButton,
          el: {
            rows: this.getRows(this.object?.mfa_backends || [])
          },
          hidden: (form) => { return !form.mfa_enabled }
        }
      }
    }
  },
  computed: {},
  methods: {
    goto(index) {
      if (index <= this.active) {
        this.active = index
      }
    },
    tabTwoClick() {
      const url = '/api/v1/authentication/mfa/settings/'
      this.$axios.get(url).then(resp => {
        this.otp_uri = resp.otp_uri
        this.otp_secret_key = resp.otp_secret_key
        this.active = 3
      })
    },
    getBackendsTo(row) {
      let to
      if (row.name === 'sms') {
        to = { name: 'ProfileSetting', query: { activeTab: 'ProfileUpdate' }}
      } else if (row.name === 'otp' && row.can_disabled) {
        to = () => { this.dialogDisabledOtp = true }
      }
      return to
    },
    getRows(rows) {
      return rows.map(row => {
        return {
          'name': row.name,
          'disabled': row.disabled,
          'can_disabled': row.can_disabled,
          'display_name': row.display_name,
          'to': this.getBackendsTo(row),
          'btn_type': row.disabled ? 'primary' : 'danger',
          'btn_title': row.disabled ? this.$t('common.Enable') : this.$t('common.Disable'),
          'help_text': (row.disabled ? row.help_text_of_enable : row.help_text_of_disable) || row.placeholder
        }
      })
    },
    submitMethod() {
      return 'put'
    },
    onBind() {
      const url = '/api/v1/authentication/otp/'
      this.$axios.post(url, {
        action: 'bind', otp_code: this.otp_code, otp_secret_key: this.otp_secret_key
      }).then(resp => {
        redirectUrl(this.$router, resp?.redirect)
      }).catch(error => {
        const err = getErrorResponseMsg(error)
        this.$message.error(err)
      })
    },
    onDisabled() {
      const url = '/api/v1/authentication/otp/'
      this.$axios.post(url, {
        action: 'disabled', otp_code: this.otp_reset_code
      }).then(resp => {
        redirectUrl(this.$router, resp?.redirect)
      }).catch(error => {
        const err = getErrorResponseMsg(error)
        this.$message.error(err)
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.password-update >>> .el-input {
  width: 600px;
  max-width: 600px;
}
.el-row {
    margin-bottom: 20px;
    &:last-child {
      margin-bottom: 0;
    }
}
</style>
