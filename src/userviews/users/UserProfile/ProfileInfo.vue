<template>
  <div>
    <el-row :gutter="20">
      <el-col :span="14">
        <DetailCard :items="detailCardItems" />
      </el-col>
      <el-col :span="10">
        <QuickActions type="primary" :actions="quickActions" />
      </el-col>
    </el-row>
    <Dialog
      width="50"
      top="20vh"
      :title="this.$t('common.PasswordConfirm')"
      :visible.sync="showPasswordDialog"
      :show-confirm="false"
      :show-cancel="false"
      :destroy-on-close="true"
    >
      <el-row :gutter="20">
        <el-col :span="4">
          <div style="line-height: 34px;text-align: center">{{ $t('assets.Password') }}</div>
        </el-col>
        <el-col :span="14">
          <el-input v-model="passwordInput" type="password" />
          <span class="help-tips help-block">{{ $t('common.PasswordRequireForSecurity') }}</span>
        </el-col>
        <el-col :span="4">
          <el-button size="mini" type="primary" style="line-height:20px " @click="passConfirm">{{ this.$t('common.Confirm') }}</el-button>
        </el-col>
      </el-row>
    </Dialog>
  </div>

</template>

<script type="text/jsx">
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import Dialog from '@/components/Dialog'
import { toSafeLocalDateStr } from '@/utils/common'
export default {
  name: 'ProfileInfo',
  components: {
    DetailCard,
    Dialog,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      url: `/api/v1/users/profile/`,
      showPasswordDialog: false,
      passwordInput: '',
      quickActions: [
        {
          title: this.$t('users.setWeCom'),
          attrs: {
            type: 'primary',
            label: this.$store.state.users.profile.is_wecom_bound ? this.$t('common.unbind') : this.$t('common.bind'),
            disabled: this.$store.state.users.profile.source !== 'local'
          },
          has: this.$store.getters.publicSettings.AUTH_WECOM,
          callbacks: {
            click: function() {
              this.showPasswordDialog = true
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setDingTalk'),
          attrs: {
            type: 'primary',
            label: this.$store.state.users.profile.is_dingtalk_bound ? this.$t('common.unbind') : this.$t('common.bind'),
            disabled: this.$store.state.users.profile.source !== 'local'
          },
          has: this.$store.getters.publicSettings.AUTH_DINGTALK,
          callbacks: {
            click: function() {
              this.showPasswordDialog = true
            }.bind(this)
          }
        },
        {
          title: this.$t('users.SetMFA'),
          attrs: {
            type: 'primary',
            label: this.object.mfa_enabled ? this.$t('common.Disable') : this.$t('common.Enable'),
            disabled: this.object.mfa_force_enabled
          },
          callbacks: {
            click: function() {
              if (this.object.mfa_enabled) {
                if (!this.object.mfa_force_enabled) {
                  window.location.href = `/core/auth/profile/otp/disable/authentication/?next=${this.$route.fullPath}`
                }
              } else {
                window.location.href = `/core/auth/profile/otp/enable/start/?next=${this.$route.fullPath}`
              }
            }.bind(this)
          }
        },
        {
          title: this.$t('users.UpdateMFA'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update')
          },
          has: this.object.mfa_enabled,
          callbacks: {
            click: function() {
              window.location.href = `/core/auth/profile/otp/update/?next=${this.$route.fullPath}`
            }.bind(this)
          }
        },
        {
          title: this.$t('users.UpdatePassword'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update'),
            disabled: this.$store.state.users.profile.source !== 'local'
          },
          callbacks: {
            click: function() {
              this.$emit('update:activeMenu', 'PasswordUpdate')
            }.bind(this)
          }
        },
        {
          title: this.$t('users.UpdateSSHKey'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update'),
            disabled: this.$store.state.users.profile.source !== 'local'
          },
          callbacks: {
            click: function() {
              this.$emit('update:activeMenu', 'SSHUpdate')
            }.bind(this)
          }
        },
        {
          title: this.$t('users.ResetPublicKeyAndDownload'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Reset')
          },
          callbacks: {
            click: function() {
              window.open(`/core/auth/profile/pubkey/generate/`, '_blank')
            }
          }
        }
      ]
    }
  },
  computed: {
    detailCardItems() {
      return [
        {
          value: this.object.username,
          key: this.$t('users.Username')
        },
        {
          value: this.object.name,
          key: this.$t('users.Name')
        },
        {
          value: this.object.role_display,
          key: this.$t('users.Role')
        },
        {
          value: this.object.email,
          key: this.$t('users.Email')
        },
        {
          value: `${this.object.is_active}`,
          key: this.$t('users.IsActive')
        },
        {
          value: this.object,
          key: 'SSHKey',
          formatter: (item, val) => {
            const comment = val.public_key_comment
            const md5 = val.public_key_hash_md5
            return <span>{ comment } <br /> { md5 }</span>
          }
        },
        {
          value: this.object.mfa_level_display,
          key: this.$t('users.MfaLevel')
        },
        {
          value: this.object.source_display,
          key: this.$t('users.Source')
        },
        {
          value: toSafeLocalDateStr(this.object.date_joined),
          key: (this.$t('users.DateJoined'))
        },
        {
          value: toSafeLocalDateStr(this.object.last_login),
          key: this.$t('users.DateLastLogin')
        },
        {
          value: toSafeLocalDateStr(this.object.date_password_last_updated),
          key: this.$t('users.DatePasswordLastUpdated')
        },
        {
          value: toSafeLocalDateStr(this.object.date_expired),
          key: this.$t('users.DateExpired')
        },
        {
          value: this.object.groups_display,
          key: this.$t('users.UserGroups')
        },
        {
          value: this.object.comment,
          key: this.$t('users.Comment')
        }
      ]
    }
  },
  methods: {
    passConfirm() {
      this.$axios.post(
        `/api/v1/authentication/password/verify/`, {
          password: this.passwordInput
        }
      ).then(res => {
        if (!this.object.is_wecom_bound) {
          window.location.href = `/core/auth/wecom/qr/bind/?redirect_url=${this.$route.fullPath}`
        } else {
          this.$axios.post(`/api/v1/authentication/wecom/qr/unbind/`).then(res => {
            this.$message.success(this.$t('common.updateSuccessMsg'))
            this.$store.dispatch('users/getProfile')
          })
        }
      })
      this.passwordInput = ''
      this.showPasswordDialog = false
    }
  }
}
</script>

<style lang='less' scoped>
</style>
