<template>
  <Page v-bind="$attrs">
    <div>
      <el-row :gutter="20">
        <el-col :md="14" :sm="24">
          <DetailCard :items="detailCardItems" />
        </el-col>
        <el-col :md="10" :sm="24">
          <QuickActions
            :actions="authQuickActions"
            :title="$tc('users.AuthSettings')"
            type="primary"
          />
          <QuickActions
            :actions="messageSubscriptionQuickActions"
            :title="$tc('users.MessageSubscription')"
            fa="fa-info-circle"
            style="margin-top: 15px"
            type="info"
          />
        </el-col>
      </el-row>
    </div>
  </Page>
</template>

<script type="text/jsx">
import Page from '@/layout/components/Page'
import DetailCard from '@/components/Cards/DetailCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/common'
import store from '@/store'

export default {
  name: 'ProfileInfo',
  components: {
    Page,
    DetailCard,
    QuickActions
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
      currentEdit: '',
      authQuickActions: [
        {
          title: this.$t('users.setWeCom'),
          attrs: {
            type: 'primary',
            label: this.getLabel('wecom'),
            disabled: this.isDisabled('wecom'),
            showTip: this.isDisabled('wecom'),
            tip: this.$t('users.UnbindHelpText')
          },
          has: this.$store.getters.publicSettings.AUTH_WECOM,
          callbacks: {
            click: function() {
              this.currentEdit = 'wecom'
              this.verifyDone()
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setDingTalk'),
          attrs: {
            type: 'primary',
            label: this.getLabel('dingtalk'),
            disabled: this.isDisabled('dingtalk'),
            showTip: this.isDisabled('dingtalk'),
            tip: this.$t('users.UnbindHelpText')
          },
          has: this.$store.getters.publicSettings.AUTH_DINGTALK,
          callbacks: {
            click: function() {
              this.currentEdit = 'dingtalk'
              this.verifyDone()
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setFeiShu'),
          attrs: {
            type: 'primary',
            label: this.getLabel('feishu'),
            disabled: this.isDisabled('feishu'),
            showTip: this.isDisabled('feishu'),
            tip: this.$t('users.UnbindHelpText')
          },
          has: this.$store.getters.publicSettings.AUTH_FEISHU,
          callbacks: {
            click: function() {
              this.currentEdit = 'feishu'
              this.verifyDone()
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setLark'),
          attrs: {
            type: 'primary',
            label: this.getLabel('lark'),
            disabled: this.isDisabled('lark'),
            showTip: this.isDisabled('lark'),
            tip: this.$t('users.UnbindHelpText')
          },
          has: this.$store.getters.publicSettings.AUTH_LARK,
          callbacks: {
            click: function() {
              this.currentEdit = 'lark'
              this.verifyDone()
            }.bind(this)
          }
        },
        {
          title: this.$t('users.setSlack'),
          attrs: {
            type: 'primary',
            label: this.getLabel('slack'),
            disabled: this.isDisabled('slack'),
            showTip: this.isDisabled('slack'),
            tip: this.$t('users.UnbindHelpText')
          },
          has: this.$store.getters.publicSettings.AUTH_SLACK,
          callbacks: {
            click: function() {
              this.currentEdit = 'slack'
              this.verifyDone()
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
            disabled: !this.isUserFromSource('local')
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
          type: 'switch',
          attrs: {
            disabled: true,
            name: 'site_msg',
            model: this.object?.receive_backends.indexOf('site_msg') !== -1
          },
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.Email'),
          type: 'switch',
          attrs: {
            name: 'email',
            model: this.object?.receive_backends.indexOf('email') !== -1
          },
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.WeCom'),
          type: 'switch',
          attrs: {
            name: 'wecom',
            model: this.object?.receive_backends.indexOf('wecom') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_WECOM,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.DingTalk'),
          type: 'switch',
          attrs: {
            name: 'dingtalk',
            model: this.object?.receive_backends.indexOf('dingtalk') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_DINGTALK,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.FeiShu'),
          type: 'switch',
          attrs: {
            name: 'feishu',
            model: this.object?.receive_backends.indexOf('feishu') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_FEISHU,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: 'Lark',
          type: 'switch',
          attrs: {
            name: 'lark',
            model: this.object?.receive_backends.indexOf('lark') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_LARK,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('setting.Slack'),
          type: 'switch',
          attrs: {
            name: 'slack',
            model: this.object?.receive_backends.indexOf('slack') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_SLACK,
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
          value: this.object.system_roles.map(item => item.display_name).join(' ｜ '),
          key: this.$t('users.SystemRoles')
        },
        {
          value: this.object.org_roles.map(item => item.display_name).join(' ｜ '),
          key: this.$t('users.OrgRoles')
        },
        {
          value: this.object.email,
          key: this.$t('users.Email')
        },
        {
          value: this.object.is_active,
          key: this.$t('users.IsActive')
        },
        {
          value: this.object,
          key: 'SSHKey',
          formatter: (item, val) => {
            const comment = val.public_key_comment
            const md5 = val.public_key_hash_md5
            return <span>{comment} <br/> {md5}</span>
          }
        },
        {
          value: this.object.mfa_level.label,
          key: this.$t('users.MfaLevel')
        },
        {
          value: this.object.source.label,
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
          value: this.object.groups.map(item => item.name).join(' ｜ '),
          key: this.$t('users.UserGroups')
        },
        {
          value: this.object.comment,
          key: this.$t('users.Comment')
        }
      ]
    },
    confirmUrl() {
      return '/api/v1/authentication/confirm-oauth/'
    },
    bindOrUnbindUrl() {
      let url = ''
      if (!this.object[`${this.currentEdit}_id`]) {
        url = `/core/auth/${this.currentEdit}/qr/bind/?redirect_url=${this.$route.fullPath}`
      } else {
        url = `/api/v1/authentication/${this.currentEdit}/qr/unbind/`
      }
      return url
    }
  },
  methods: {
    isBind(sourceName) {
      return !!this.$store.state.users.profile[`${sourceName}_id`]
    },
    getLabel(sourceName) {
      return this.isBind(sourceName) ? this.$t('common.unbind') : this.$t('common.bind')
    },
    isUserFromSource(sourceName) {
      return this.$store.state.users.profile.source.value === sourceName
    },
    isDisabled(sourceName) {
      return this.isBind(sourceName) && this.isUserFromSource(sourceName)
    },
    updateUserReceiveBackends(val) {
      this.$axios.patch(
        `/api/v1/notifications/user-msg-subscription/${this.object.id}/`,
        { 'receive_backends': this.getReceiveBackendList() }
      ).then(res => {
        this.$message.success(this.$tc('common.updateSuccessMsg'))
        this.$store.dispatch('users/getProfile', true)
      }).catch(err => {
        this.$message.error(this.$tc('common.updateErrorMsg' + ' ' + err))
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
    verifyDone() {
      this.$axios.get(this.confirmUrl).then(() => {
        const url = this.bindOrUnbindUrl
        if (!this.object[`${this.currentEdit}_id`]) {
          window.open(url, 'Bind', 'width=800,height=600')
        } else {
          this.$axios.post(url).then(res => {
            this.$message.success(this.$tc('common.updateSuccessMsg'))
            this.$store.dispatch('users/getProfile')
          })
        }
      })
    },
    exit() {
      this.$emit('update:visible', false)
    }
  }
}
</script>

<style lang='less' scoped>
</style>
