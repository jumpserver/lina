<template>
  <Page v-bind="$attrs">
    <TwoCol>
      <DetailCard :items="detailCardItems" />
      <template #right>
        <QuickActions :actions="authQuickActions" :title="$tc('AuthSettings')" type="primary" />
        <QuickActions
          :actions="messageSubscriptionQuickActions"
          :title="$tc('NotificationConfiguration')"
          fa="fa-info-circle"
          style="margin-top: 15px"
          type="info"
        />
        <QuickActions
          v-if="biometricFeaturesActions.some((action) => action.has)"
          :actions="biometricFeaturesActions"
          :title="$tc('BiometricFeatures')"
          style="margin-top: 15px"
          type="warning"
        />
        <IBox
          v-if="!store.getters.publicSettings['PRIVACY_MODE']"
          :title="$tc('InformationModification')"
          class="update-info"
          fa="fa-edit"
        >
          <el-form class="update-info-form" label-position="left" label-width="80px">
            <el-form-item :label="$t('Phone')">
              <PhoneInput :value="object.phone" />
            </el-form-item>
            <el-form-item :label="$t('WeChat')">
              <el-input v-model="object.wechat" />
            </el-form-item>
            <el-form-item label=" ">
              <el-button type="primary" @click="updateProfile">
                {{ $t('Update') }}
              </el-button>
            </el-form-item>
          </el-form>
        </IBox>
      </template>
    </TwoCol>
  </Page>
</template>

<script>
import { createVNode as createVNodeCompat, createTextVNode as createTextVNodeCompat } from 'vue'
import { IBox, QuickActions } from '@/components'
import { PhoneInput } from '@/components/Form/FormFields'
import Page from '@/layout/components/Page'
import DetailCard from '@/components/Cards/DetailCard'
import { toSafeLocalDateStr } from '@/composables/useDateTime'
import store from '@/store'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'
export default {
  components: {
    TwoCol,
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
      biometricFeaturesActions: [
        {
          title: this.$t('FacialFeatures'),
          has:
            this.$store.getters.publicSettings.FACE_RECOGNITION_ENABLED &&
            !store.getters.publicSettings['PRIVACY_MODE'],
          attrs: {
            type: 'primary',
            label: this.$store.state.users.profile.is_face_code_set
              ? this.$t('Unbind')
              : this.$t('Bind')
          },
          callbacks: {
            click: () => {
              const next_url = this.$store.state.users.profile.is_face_code_set
                ? '/core/auth/profile/face/disable/'
                : '/core/auth/profile/face/enable/'
              window.open(next_url, '_blank')
            }
          }
        }
      ],
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
          has:
            this.$store.getters.publicSettings.AUTH_WECOM &&
            !store.getters.publicSettings['PRIVACY_MODE'],
          callbacks: {
            click: function () {
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
          has:
            this.$store.getters.publicSettings.AUTH_DINGTALK &&
            !store.getters.publicSettings['PRIVACY_MODE'],
          callbacks: {
            click: function () {
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
          has:
            this.$store.getters.publicSettings.AUTH_FEISHU &&
            !store.getters.publicSettings['PRIVACY_MODE'],
          callbacks: {
            click: function () {
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
          has:
            this.$store.getters.publicSettings.AUTH_LARK &&
            !store.getters.publicSettings['PRIVACY_MODE'],
          callbacks: {
            click: function () {
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
          has:
            this.$store.getters.publicSettings.AUTH_SLACK &&
            !store.getters.publicSettings['PRIVACY_MODE'],
          callbacks: {
            click: function () {
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
            click: function () {
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
            click: function () {
              this.$router.push({
                name: 'SSHKeyList',
                query: {
                  tab: 'Password'
                }
              })
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
            click: function () {
              this.$router.push({
                name: 'SSHKeyList',
                query: {
                  tab: 'SSHKeyList'
                }
              })
            }.bind(this)
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
    store() {
      return store
    },
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
              return createVNodeCompat('span', null, [
                val.code,
                createTextVNodeCompat(' '),
                val.phone
              ])
            } else {
              return '-'
            }
          },
          has: !store.getters.publicSettings['PRIVACY_MODE']
        },
        {
          value: this.object.groups?.map((item) => item.name).join(' ｜ '),
          key: this.$t('UserGroups')
        },
        {
          value: this.object.system_roles?.map((item) => item.display_name).join(' ｜ '),
          key: this.$t('SystemRoles')
        },
        {
          value: this.object.org_roles?.map((item) => item.display_name).join(' ｜ '),
          key: this.$t('OrgRoles'),
          has: !!this.object.org_roles
        },
        {
          value: this.object,
          key: 'SSH Key',
          formatter: (item, val) => {
            const comment = val.public_key_comment || '-'
            const md5 = val.public_key_hash_md5 || '-'
            return createVNodeCompat('span', null, [
              comment,
              createTextVNodeCompat(' '),
              createVNodeCompat('br', null, null),
              createTextVNodeCompat(' '),
              md5
            ])
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
          key: this.$t('DateJoined')
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
      this.$axios
        .patch(url, data)
        .then(() => {
          this.$message.success(this.$tc('UpdateSuccessMsg'))
        })
        .catch((err) => {
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
      this.$axios
        .patch(`/api/v1/notifications/user-msg-subscription/${this.object.id}/`, {
          receive_backends: this.getReceiveBackendList()
        })
        .then((res) => {
          this.$message.success(this.$tc('UpdateSuccessMsg'))
          this.$store.dispatch('users/getProfile', true)
        })
        .catch((err) => {
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
<style lang="scss" scoped>
.update-info {
  .update-info-form {
    // 不沿用全局 .el-card__body .el-form 的 margin-top/right，改为 flex 纵向布局自控间距
    margin: 0 !important;
    display: flex;
    flex-direction: column;
    gap: 20px; // FormItem 间距统一 20px

    :deep(.el-form-item) {
      margin-bottom: 0;

      // 标签与 30px 高的输入框垂直居中对齐
      .el-form-item__label {
        height: 30px;
        line-height: 30px;
        display: inline-flex;
        align-items: center;
      }
    }

    // 与 DataForm 一致的单层边框方案：边框只画在 .el-input__wrapper 上（box-shadow 关掉、
    // 用真实 1px border），内部 .el-input__inner 彻底去边框，避免 wrapper 与 inner 各描一层
    // 形成 border 套 border。整体高度 30px / 内部 28px，与表单标准统一。
    //
    // 注意：用直接子选择器把规则限定在「普通 el-input」上，PhoneInput 自带单层容器边框，
    // 不能被这里的 wrapper 描边规则命中，否则又会双层。
    :deep(.el-form-item__content > .el-input) {
      --el-input-height: 30px;

      .el-input__wrapper {
        border-radius: 0;
        box-shadow: none !important;
        border: 1px solid var(--el-border-color);

        &:hover {
          border-color: var(--el-border-color-hover);
        }

        &.is-focus {
          border-color: var(--el-color-primary);
        }
      }

      .el-input__inner {
        height: 28px;
        line-height: 28px;
        border: 0 !important;
        box-shadow: none !important;
      }
    }
  }
}
</style>
