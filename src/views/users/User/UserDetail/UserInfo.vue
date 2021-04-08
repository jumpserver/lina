<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
      <RelationCard v-bind="relationConfig" type="info" style="margin-top: 15px" />
      <RelationCard v-if="this.$store.getters.publicSettings.LOGIN_CONFIRM_ENABLE" v-bind="loginConfirmSetting" type="warning" style="margin-top: 15px" />
    </el-col>
  </el-row>
</template>

<script>
import DetailCard from '@/components/DetailCard'
import QuickActions from '@/components/QuickActions'
import RelationCard from '@/components/RelationCard'
import { toSafeLocalDateStr } from '@/utils/common'

export default {
  name: 'UserInfo',
  components: {
    DetailCard,
    RelationCard,
    QuickActions
  },
  props: {
    object: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    const vm = this
    return {
      quickActions: [
        {
          title: this.$t('common.Activate'),
          type: 'switcher',
          attrs: {
            model: this.object.is_active
          },
          callbacks: {
            change: function(v, item) {
              const url = `/api/v1/users/users/${vm.object.id}/`
              const data = { is_active: v }
              vm.$axios.patch(url, data).catch(() => {
                item.attrs.model = !v
              }).then(res => {
                vm.$message.success(vm.$t('common.updateSuccessMsg'))
              }).catch(err => {
                vm.$message.error(vm.$t('common.updateErrorMsg' + ' ' + err))
              })
            }
          }
        },
        {
          title: this.$t('users.quickUpdate.resetMFA'),
          attrs: {
            type: 'primary',
            disabled: !this.object.mfa_enabled,
            label: this.$t('common.Reset')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.quickUpdate.resetMFAWarningMsg')
              const warnTitle = vm.$t('common.Info')
              const url = `/api/v1/users/users/${vm.object.id}/otp/reset/`
              const successMsg = vm.$t('users.quickUpdate.resetMFAdSuccessMsg')
              vm.$confirm(warnMsg, warnTitle, {
                type: 'warning',
                confirmButtonClass: 'el-button--warning',
                showCancelButton: true,
                beforeClose: async(action, instance, done) => {
                  if (action !== 'confirm') return done()
                  instance.confirmButtonLoading = true
                  try {
                    await vm.$axios.get(url)
                    done()
                    vm.$message.success(successMsg)
                  } finally {
                    instance.confirmButtonLoading = false
                  }
                }
              })
            }
          }
        },
        {
          title: this.$t('users.quickUpdate.resetWechat'),
          attrs: {
            type: 'primary',
            disabled: !this.object.is_wecom_bound,
            label: this.$t('users.quickUpdate.unbind')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.quickUpdate.resetWechatLoginWarningMsg')
              const warnTitle = vm.$t('common.Info')
              const url = `/api/v1/authentication/wecom/qr/unbind/${vm.object.id}/`
              const successMsg = vm.$t('users.quickUpdate.resetWechatLoginSuccessMsg')
              vm.$confirm(warnMsg, warnTitle, {
                type: 'warning',
                confirmButtonClass: 'el-button--warning',
                showCancelButton: true,
                beforeClose: async(action, instance, done) => {
                  if (action !== 'confirm') return done()
                  instance.confirmButtonLoading = true
                  try {
                    await vm.$axios.post(url)
                    done()
                    vm.$message.success(successMsg)
                  } finally {
                    instance.confirmButtonLoading = false
                  }
                }
              })
            }
          }
        },
        {
          title: this.$t('users.quickUpdate.resetPassword'),
          attrs: {
            type: 'primary',
            disabled: this.object.source !== 'local',
            label: this.$t('users.quickUpdate.send')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.quickUpdate.resetPasswordWarningMsg')
              const warnTitle = vm.$t('common.Info')
              const url = `/api/v1/users/users/${vm.object.id}/password/reset/`
              const successMsg = vm.$t('users.quickUpdate.resetPasswordSuccessMsg')
              vm.$confirm(warnMsg, warnTitle, {
                type: 'warning',
                confirmButtonClass: 'el-button--warning',
                showCancelButton: true,
                beforeClose: async(action, instance, done) => {
                  if (action !== 'confirm') return done()
                  instance.confirmButtonLoading = true
                  try {
                    await vm.$axios.patch(url, {})
                    done()
                    vm.$message.success(successMsg)
                  } finally {
                    instance.confirmButtonLoading = false
                  }
                }
              })
            }
          }
        },
        {
          title: this.$t('users.quickUpdate.resetSSHKey'),
          attrs: {
            type: 'primary',
            label: this.$t('users.quickUpdate.send')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.quickUpdate.resetSSHKeyWarningMsg')
              const warnTitle = vm.$t('common.Info')
              const url = `/api/v1/users/users/${vm.object.id}/pubkey/reset/`
              const successMsg = vm.$t('users.quickUpdate.resetSSHKeySuccessMsg')
              vm.$confirm(warnMsg, warnTitle, {
                type: 'warning',
                confirmButtonClass: 'el-button--warning',
                showCancelButton: true,
                beforeClose: async(action, instance, done) => {
                  if (action !== 'confirm') return done()
                  instance.confirmButtonLoading = true
                  try {
                    await vm.$axios.patch(url, {})
                    done()
                    vm.$message.success(successMsg)
                  } finally {
                    instance.confirmButtonLoading = false
                  }
                }
              })
            }
          }
        },
        {
          title: this.$t('users.quickUpdate.unblockUser'),
          attrs: {
            type: 'primary',
            label: this.$t('users.quickUpdate.unblock'),
            disabled: !this.object.login_blocked
          },
          callbacks: {
            click: function(v, item) {
              const url = `/api/v1/users/users/${vm.object.id}/unblock/`
              const unblockSuccessMsg = vm.$t('users.quickUpdate.unblockSuccessMsg')
              vm.$axios.patch(url).then(() => {
                item.attrs.disabled = !item.attrs.disabled
                vm.$message.success(unblockSuccessMsg)
              })
            }
          }
        }
      ],
      relationConfig: {
        icon: 'fa-user',
        title: this.$t('users.UserGroups'),
        objectsAjax: {
          url: '/api/v1/users/groups/?fields_size=mini&order=name'
        },
        hasObjectsId: this.object.groups,
        performDelete: (item) => {
          const itemId = item.value
          const objectId = this.object.id
          const relationUrl = `/api/v1/users/users-groups-relations/?user=${objectId}&usergroup=${itemId}`
          return this.$axios.delete(relationUrl)
        },
        performAdd: (items) => {
          const relationUrl = `/api/v1/users/users-groups-relations/`
          const objectId = this.object.id
          const data = items.map(v => {
            return {
              usergroup: v.value,
              user: objectId
            }
          })
          return this.$axios.post(relationUrl, data)
        }
      },
      loginConfirmSetting: {
        icon: 'fa-user',
        title: this.$t('users.LoginConfirm'),
        objectsAjax: {
          url: '/api/v1/users/users/'
        },
        hasObjectsId: this.object.login_confirm_settings,
        performDelete: (item) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/authentication/login-confirm-settings/${objectId}/`
          const data = {
            reviewers: this.object.login_confirm_settings.filter(approver => approver !== item.value)
          }
          return this.$axios.patch(relationUrl, data)
        },
        performAdd: (items) => {
          const objectId = this.object.id
          const relationUrl = `/api/v1/authentication/login-confirm-settings/${objectId}/`
          const data = {
            reviewers: [...this.object.login_confirm_settings || [], ...items.map(v => {
              return v.value
            })]
          }
          return this.$axios.patch(relationUrl, data)
        }
      }
    }
  },
  computed: {
    loginConfirmEnabled() {
      return this.$store.getters.publicSettings.LOGIN_CONFIRM_ENABLE
    },
    detailItems() {
      return [
        {
          key: this.$t('users.Name'),
          value: this.object.name
        },
        {
          key: this.$t('users.Username'),
          value: this.object.username
        },
        {
          key: this.$t('users.Email'),
          value: this.object.email
        },
        {
          key: this.$t('users.Role'),
          value: this.object.total_role_display
        },
        {
          key: this.$t('users.MFA'),
          value: this.object.mfa_level_display
        },
        {
          key: this.$t('users.Source'),
          value: this.object.source_display
        },
        {
          key: this.$t('common.CreatedBy'),
          value: this.object.created_by
        },
        {
          key: this.$t('users.DateJoined'),
          value: toSafeLocalDateStr(this.object.date_joined)
        },
        {
          key: this.$t('users.DateExpired'),
          value: toSafeLocalDateStr(this.object.date_expired)
        },
        {
          key: this.$t('users.DatePasswordUpdated'),
          value: toSafeLocalDateStr(this.object.date_password_last_updated)
        },
        {
          key: this.$t('users.DateLastLogin'),
          value: toSafeLocalDateStr(this.object.last_login)
        },
        {
          key: this.$t('common.Comment'),
          value: this.object.comment
        }
      ]
    }
  },
  watch: {
    group(iNew, iOld) {
      this.$log.debug('Group has changed')
      this.relationConfig.hasObjectsId = iNew.users
    }
  },
  methods: {
  }
}
</script>

<style scoped>
  .mfa-setting >>> .el-slider__runway {
    margin-top: 0;
    margin-bottom: 0;
  }

</style>
