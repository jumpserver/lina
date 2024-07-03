<template>
  <Page v-bind="$attrs">
    <div>
      <el-row :gutter="20">
        <el-col :md="15" :sm="24">
          <DetailCard :items="detailCardItems" />
        </el-col>
        <el-col :md="9" :sm="24">
          <QuickActions
            :actions="authQuickActions"
            :title="$tc('AuthSettings')"
            type="primary"
          />
          <QuickActions
            :actions="messageSubscriptionQuickActions"
            :title="$tc('NotificationConfiguration')"
            fa="fa-info-circle"
            style="margin-top: 15px"
            type="info"
          />
          <IBox :title="$tc('InformationModification')" fa="fa-edit">
            <table>
              <tr>
                <td> {{ $t('Phone') }}</td>
                <td>
                  <PhoneInput :value="object.phone" />
                </td>
              </tr>
              <tr>
                <td> {{ $t('WeChat') }}</td>
                <td>
                  <el-input v-model="object.wechat" />
                </td>
              </tr>
            </table>
            <el-button
              size="small"
              style="margin-top: 10px"
              type="primary"
              @click="updateProfile"
            >
              {{ $t('Update') }}
            </el-button>
          </IBox>
        </el-col>
      </el-row>
    </div>
  </Page>
</template>

<script type="text/jsx">
import { IBox } from '@/components'
import { PhoneInput } from '@/components/Form/FormFields'
import Page from '@/layout/components/Page'
import DetailCard from '@/components/Cards/DetailCard'
import QuickActions from '@/components/QuickActions'
import { toSafeLocalDateStr } from '@/utils/time'
import store from '@/store'

export default {
  components: {
    Page,
    IBox,
    PhoneInput,
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
          title: this.$t('WeComOAuth'),
          attrs: {
            type: 'primary',
            label: this.getLabel('wecom'),
            disabled: this.isDisabled('wecom'),
            showTip: this.isDisabled('wecom'),
            tip: this.$t('UnbindHelpText')
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
          title: this.$t('DingTalkOAuth'),
          attrs: {
            type: 'primary',
            label: this.getLabel('dingtalk'),
            disabled: this.isDisabled('dingtalk'),
            showTip: this.isDisabled('dingtalk'),
            tip: this.$t('UnbindHelpText')
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
          title: this.$t('FeiShuOAuth'),
          attrs: {
            type: 'primary',
            label: this.getLabel('feishu'),
            disabled: this.isDisabled('feishu'),
            showTip: this.isDisabled('feishu'),
            tip: this.$t('UnbindHelpText')
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
          title: this.$t('LarkOAuth'),
          attrs: {
            type: 'primary',
            label: this.getLabel('lark'),
            disabled: this.isDisabled('lark'),
            showTip: this.isDisabled('lark'),
            tip: this.$t('UnbindHelpText')
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
          title: this.$t('SlackOAuth'),
          attrs: {
            type: 'primary',
            label: this.getLabel('slack'),
            disabled: this.isDisabled('slack'),
            showTip: this.isDisabled('slack'),
            tip: this.$t('UnbindHelpText')
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
          title: this.$t('SetMFA'),
          attrs: {
            type: 'primary',
            label: this.$t('Setting')
          },
          callbacks: {
            click: function() {
              window.open('/core/auth/profile/mfa/', '_blank')
            }
          }
        },
        {
          title: this.$t('ChangePassword'),
          attrs: {
            type: 'primary',
            label: this.$t('Update'),
            disabled: !this.isUserFromSource('local')
          },
          callbacks: {
            click: function() {
              this.$router.push({ name: 'PasswordAndSSHKey', query: { tab: 'Password' }})
            }.bind(this)
          }
        },
        {
          title: this.$t('UpdateSSHKey'),
          attrs: {
            type: 'primary',
            label: this.$t('Update'),
            disabled: !this.$store.state.users.profile.can_public_key_auth
          },
          callbacks: {
            click: function() {
              this.$router.push({ name: 'PasswordAndSSHKey', query: { tab: 'SSHKey' }})
            }.bind(this)
          }
        },
        {
          title: this.$t('ResetPublicKeyAndDownload'),
          attrs: {
            type: 'primary',
            label: this.$t('Reset'),
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
          title: this.$t('SiteMessage'),
          type: 'switch',
          attrs: {
            disabled: true,
            name: 'site_msg',
            model: this.object?.receive_backends?.indexOf('site_msg') !== -1
          },
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('Email'),
          type: 'switch',
          attrs: {
            name: 'email',
            model: this.object?.receive_backends?.indexOf('email') !== -1
          },
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('WeCom'),
          type: 'switch',
          attrs: {
            name: 'wecom',
            model: this.object?.receive_backends?.indexOf('wecom') !== -1
          },
          has: this.$store.getters.publicSettings.AUTH_WECOM,
          callbacks: {
            change: this.updateUserReceiveBackends
          }
        },
        {
          title: this.$t('DingTalk'),
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
          title: this.$t('FeiShu'),
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
          title: 'Slack',
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
          value: this.object.name,
          key: this.$t('Name')
        },
        {
          value: this.object.username,
          key: this.$t('Username')
        },
        {
          value: this.object.email,
          key: this.$t('Email')
        },
        {
          value: this.object.phone,
          key: this.$t('Phone'),
          formatter: (item, val) => {
            if (val) {
              return <span>{val.code} {val.phone}</span>
            } else {
              return '-'
            }
          }
        },
        {
          value: this.object.groups?.map(item => item.name).join(' ｜ '),
          key: this.$t('UserGroups')
        },
        {
          value: this.object.system_roles?.map(item => item.display_name).join(' ｜ '),
          key: this.$t('SystemRoles')
        },
        {
          value: this.object.org_roles?.map(item => item.display_name).join(' ｜ '),
          key: this.$t('OrgRoles'),
          has: !!this.object.org_roles
        },
        {
          value: this.object,
          key: 'SSH Key',
          formatter: (item, val) => {
            const comment = val.public_key_comment || '-'
            const md5 = val.public_key_hash_md5 || '-'
            return <span>{comment} <br/> {md5}</span>
          }
        },
        {
          value: this.object.mfa_level.label,
          key: this.$t('MfaLevel')
        },
        {
          value: this.object.source.label,
          key: this.$t('Source')
        },
        {
          value: this.object.is_active,
          key: this.$t('IsActive')
        },
        {
          value: toSafeLocalDateStr(this.object.last_login),
          key: this.$t('DateLastLogin')
        },
        {
          value: toSafeLocalDateStr(this.object.date_password_last_updated),
          key: this.$t('DatePasswordLastUpdated')
        },
        {
          value: toSafeLocalDateStr(this.object.date_joined),
          key: (this.$t('DateJoined'))
        },
        {
          value: toSafeLocalDateStr(this.object.date_expired),
          key: this.$t('DateExpired')
        },
        {
          value: this.object.comment,
          key: this.$t('Comment')
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
    updateProfile() {
      const url = `/api/v1/users/profile/`
      const data = {
        phone: this.object.phone,
        wechat: this.object.wechat
      }
      this.$axios.patch(url, data).then(() => {
        this.$message.success(this.$tc('UpdateSuccessMsg'))
      }).catch(err => {
        const errMsg = err.request.response
        this.$message.error(this.$tc('Error') + ': ' + errMsg)
      })
    },
    isBind(sourceName) {
      return !!this.$store.state.users.profile[`${sourceName}_id`]
    },
    getLabel(sourceName) {
      return this.isBind(sourceName) ? this.$t('Unbind') : this.$t('Bind')
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
        this.$message.success(this.$tc('UpdateSuccessMsg'))
        this.$store.dispatch('users/getProfile', true)
      }).catch(err => {
        this.$message.error(this.$tc('UpdateErrorMsg' + ' ' + err))
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
          this.$axios.post(url).then(() => {
            this.$message.success(this.$tc('UpdateSuccessMsg'))
            this.$store.dispatch('users/getProfile')
            // 此处对子组件使用 key 或 $forceUpdate 都无法使得子组件中 button 文本更新
            window.location.reload()
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
<style scoped>
.ibox ::v-deep table {
  width: 100%;
}

.ibox ::v-deep tr > td > span:first-child {
  line-height: 1.43;
  padding-right: 30px;
  vertical-align: top;
  font-size: 13px;
  width: 50%;
}

.ibox ::v-deep tr > td > span:last-child {
  float: right;
}
</style>
