<template>
  <Page v-bind="$attrs">
    <div>
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <DetailCard :items="detailCardItems" />
        </el-col>
        <el-col :md="10" :sm="24">
          <QuickActions
            type="primary"
            :title="this.$t('users.AuthSettings')"
            :actions="authQuickActions"
          />
          <QuickActions
            type="info"
            style="margin-top: 15px"
            :title="this.$t('users.MessageSubscription')"
            fa="fa-info-circle"
            :actions="messageSubscriptionQuickActions"
          />
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
          <el-col :md="4" :sm="24">
            <div style="line-height: 34px">{{ $t('assets.Password') }}</div>
          </el-col>
          <el-col :md="14" :sm="24">
            <el-input v-model="passwordInput" type="password" />
            <span class="help-tips help-block">{{ $t('common.PasswordRequireForSecurity') }}</span>
          </el-col>
          <el-col :md="4" :sm="24">
            <el-button size="mini" type="primary" style="line-height:20px " @click="passConfirm">{{ this.$t('common.Confirm') }}</el-button>
          </el-col>
        </el-row>
      </Dialog>
    </div>
  </Page>
</template>

<script type="text/jsx">
import Page from '@/layout/components/Page'
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import Dialog from '@/components/Dialog'
import { toSafeLocalDateStr } from '@/utils/common'
import store from '@/store'

export default {
  name: 'ProfileInfo',
  components: {
    Page,
    DetailCard,
    QuickActions,
    Dialog
  },
  props: {
    object: {
      type: Object,
      default: () => store.state.users.profile
    }
  },
  data() {
    return {
      url: `/api/v1/users/profile/`,
      showPasswordDialog: false,
      passwordInput: '',
      currentEdit: '',
      authQuickActions: [
        {
          title: this.$t('users.setWeCom'),
          attrs: {
            type: 'primary',
            label: this.$store.state.users.profile.is_wecom_bound ? this.$t('common.unbind') : this.$t('common.bind')
          },
          has: this.$store.getters.publicSettings.AUTH_WECOM,
          callbacks: {
            click: function() {
              this.currentEdit = 'wecom'
              this.showPasswordDialog = true
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setDingTalk'),
          attrs: {
            type: 'primary',
            label: this.$store.state.users.profile.is_dingtalk_bound ? this.$t('common.unbind') : this.$t('common.bind')
          },
          has: this.$store.getters.publicSettings.AUTH_DINGTALK,
          callbacks: {
            click: function() {
              this.currentEdit = 'dingtalk'
              this.showPasswordDialog = true
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setFeiShu'),
          attrs: {
            type: 'primary',
            label: this.$store.state.users.profile.is_feishu_bound ? this.$t('common.unbind') : this.$t('common.bind')
          },
          has: this.$store.getters.publicSettings.AUTH_FEISHU,
          callbacks: {
            click: function() {
              this.currentEdit = 'feishu'
              this.showPasswordDialog = true
            }.bind(this)
          }
        },
        {
          title: this.$t('users.SetMFA'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Setting')
          },
          callbacks: {
            click: function() {
              window.location.href = `/core/auth/profile/mfa/`
            }
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
              this.$router.push({ name: 'ProfileSetting', query: { activeTab: 'PasswordUpdate' }})
            }.bind(this)
          }
        },
        {
          title: this.$t('users.UpdateSSHKey'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Update'),
            disabled: !this.$store.state.users.profile.can_public_key_auth
          },
          callbacks: {
            click: function() {
              this.$router.push({ name: 'ProfileSetting', query: { activeTab: 'SSHUpdate' }})
            }.bind(this)
          }
        },
        {
          title: this.$t('users.ResetPublicKeyAndDownload'),
          attrs: {
            type: 'primary',
            label: this.$t('common.Reset'),
            disabled: !this.$store.state.users.profile.can_public_key_auth
          },
          callbacks: {
            click: function() {
              window.open(`/core/auth/profile/pubkey/generate/`, '_blank')
            }
          }
        }
      ],
      messageSubscriptionQuickActions: [
        {
          title: this.$t('notifications.SiteMessage'),
          type: 'switcher',
          attrs: {
            disabled: true,
            name: 'site_msg',
            model: this.object.receive_backends.indexOf('site_msg') !== -1
          },
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.Email'),
          type: 'switcher',
          attrs: {
            name: 'email',
            model: this.object.receive_backends.indexOf('email') !== -1
          },
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.WeCom'),
          type: 'switcher',
          attrs: {
            name: 'wecom',
            model: this.object.receive_backends.indexOf('wecom') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_WECOM,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.DingTalk'),
          type: 'switcher',
          attrs: {
            name: 'dingtalk',
            model: this.object.receive_backends.indexOf('dingtalk') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_DINGTALK,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.FeiShu'),
          type: 'switcher',
          attrs: {
            name: 'feishu',
            model: this.object.receive_backends.indexOf('feishu') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_FEISHU,
          callbacks: {
            change: this.updateUserReceiveBackends
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
          value: this.object.system_roles_display,
          key: this.$t('users.SystemRoles')
        },
        {
          value: this.object.org_roles_display,
          key: this.$t('users.OrgRoles')
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
    updateUserReceiveBackends(val) {
      this.$axios.patch(
        `/api/v1/notifications/user-msg-subscription/${this.object.id}/`,
        { 'receive_backends': this.getReceiveBackendList() }
      ).then(res => {
        this.$message.success(this.$t('common.updateSuccessMsg'))
      }).catch(err => {
        this.$message.error(this.$t('common.updateErrorMsg' + ' ' + err))
      })
    },
    getReceiveBackendList() {
      const backendList = []
      for (const backend of this.messageSubscriptionQuickActions) {
        const name = backend.attrs.name
        const enabled = backend.attrs.model
        if (enabled) {
          backendList.push(name)
        }
      }
      return backendList
    },
    passConfirm() {
      this.$axios.post(
        `/api/v1/authentication/password/verify/`, {
          password: this.passwordInput
        }
      ).then(res => {
        if (!this.object[`is_${this.currentEdit}_bound`]) {
          window.location.href = `/core/auth/${this.currentEdit}/qr/bind/?redirect_url=${this.$route.fullPath}`
        } else {
          this.$axios.post(`/api/v1/authentication/${this.currentEdit}/qr/unbind/`).then(res => {
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
