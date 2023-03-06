<template>
  <div>
    <el-row>
      <IBox>
        <el-steps :active="active">
          <el-step @click.native="goto(1)" />
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
            <h1>安装应用</h1>
          </el-row>
          <el-row>
            <h3>请在手机端或微信小程序下载并安装 MFA 验证器应用</h3>
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
            <h3>安装完成后点击下一步进入绑定页面（如已安装，直接进入下一步）</h3>
          </el-row>
          <el-row>
            <el-button type="primary" @click="tabTwoClick()">下一步</el-button>
          </el-row>
        </div>
        <div v-if="active===3" style="text-align: center">
          <div style="width: 450px; margin: auto">
            <el-row>
              <h1>绑定MFA验证器</h1>
            </el-row>
            <el-row>
              <h3>使用 MFA 验证器应用扫描以下二维码，获取6位验证码</h3>
            </el-row>
            <el-row>
              <QRCode :url="otp_uri" />
              <p>Secret: {{ otp_secret_key }}</p>
            </el-row>
            <el-row>
              <el-input v-model="input_mfa_secret" placeholder="6 位数字" />
            </el-row>
            <el-row>
              <el-button type="primary" size="medium" @click="active=3">下一步</el-button>
            </el-row>
          </div>
        </div>
      </IBox>
    </el-row>
  </div>
</template>

<script>
import { IBox, QRCode } from '@/components'
import GenericCreateUpdateForm from '@/layout/components/GenericCreateUpdateForm'
import RowButton from '@/components/FormFields/RowButton'

export default {
  name: 'UserMFA',
  components: {
    IBox,
    QRCode,
    GenericCreateUpdateForm
  },
  props: {
    object: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      active: 2,
      otp_uri: '',
      otp_secret_key: '',
      input_mfa_secret: '',
      url: '/api/v1/users/profile/',
      fields: ['mfa_enabled', 'mfa_backends'],
      fieldsMeta: {
        mfa_enabled: {
          label: '启用 MFA(OTP)',
          disabled: this.object.mfa_force_enabled
        },
        mfa_backends: {
          label: this.$t('users.MfaLevel'),
          component: RowButton,
          el: {
            rows: this.getRows(this.object.mfa_backends)
          },
          hidden: (form) => { return !form.mfa_enabled }
        }
      }
    }
  },
  methods: {
    goto(index) {
      this.active = index
    },
    tabTwoClick() {
      const url = '/api/v1/authentication/mfa/settings/'
      this.$axios.get(url).then(resp => {
        this.otp_uri = resp.otp_uri
        this.otp_secret_key = resp.otp_secret_key
        this.active = 3
      })
    },
    getRows(rows) {
      return rows.map(row => {
        let to
        if (row.name === 'sms') {
          to = {
            name: 'ProfileSetting',
            query: { activeTab: 'ProfileUpdate' }
          }
        } else {
          to = () => {
            this.active = 2
          }
        }
        return {
          'name': row.name,
          'disabled': row.disabled,
          'can_disabled': row.can_disabled,
          'display_name': row.display_name,
          'to': to,
          'btn_type': row.disabled ? 'primary' : 'danger',
          'btn_title': row.disabled ? this.$t('common.Enable') : this.$t('common.Disable'),
          'help_text': (row.disabled ? row.help_text_of_enable : row.help_text_of_disable) || row.placeholder
        }
      })
    },
    submitMethod() {
      return 'put'
    },
    onPerformSuccess() {
      this.$refs.GenericCreateUpdateForm.$refs.form.$refs.dataForm.resetForm('form')
      this.$message.success(this.$tc('common.updateSuccessMsg'))
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
