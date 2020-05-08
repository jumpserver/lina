<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <DetailCard :items="detailItems" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions type="primary" :actions="quickActions" />
      <RelationCard type="info" style="margin-top: 15px" v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import { DetailCard, RelationCard, QuickActions } from '@/components'

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
          title: this.$tco('Active'),
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
              })
            }
          }
        },
        {
          title: this.$t('users.resetMFATitle'),
          attrs: {
            type: 'primary',
            label: this.$tco('Reset')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.resetMFAWarningMsg')
              const warnTitle = vm.$tco('Info')
              const url = `/api/v1/users/users/${vm.object.id}/otp/reset/`
              const successMsg = vm.$t('users.resetMFAdSuccessMsg')
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
          title: this.$t('users.resetPasswordTitle'),
          attrs: {
            type: 'primary',
            label: this.$tco('Send')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.resetPasswordWarningMsg')
              const warnTitle = vm.$tco('Info')
              const url = `/api/v1/users/users/${vm.object.id}/password/reset/`
              const successMsg = vm.$t('users.resetPasswordSuccessMsg')
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
          title: this.$t('users.resetPublicKeyTitle'),
          attrs: {
            type: 'primary',
            label: this.$tco('Send')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.resetPublicKeyWarningMsg')
              const warnTitle = vm.$tco('Info')
              const url = `/api/v1/users/users/${vm.object.id}/pubkey/reset/`
              const successMsg = vm.$t('users.resetPasswordSuccessMsg')
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
          title: this.$t('users.Unblock user'),
          attrs: {
            type: 'primary',
            label: this.$tco('Unblock'),
            disabled: !this.object.login_blocked
          },
          callbacks: {
            click: function(v, item) {
              const url = `/api/v1/users/users/${vm.object.id}/unblock/`
              const unblockSuccessMsg = vm.$t('users.unblockSuccessMsg')
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
        title: this.$t('users.User groups'),
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
      }
    }
  },
  computed: {
    detailItems() {
      return [
        {
          key: this.$tco('Name'),
          value: this.object.name
        },
        {
          key: this.$tco('Username'),
          value: this.object.username
        },
        {
          key: this.$tco('Email'),
          value: this.object.email
        },
        {
          key: this.$tco('Role'),
          value: this.object.role_display
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
          key: this.$tco('Date expired'),
          value: this.object.date_expired
        },
        {
          key: this.$tco('Created by'),
          value: this.object.created_by
        },
        {
          key: this.$tco('Date Created'),
          value: this.object.date_joined
        },
        {
          key: this.$t('users.Date last login'),
          value: this.object.last_login
        },
        {
          key: this.$t('users.Date password updated'),
          value: this.object.date_password_last_updated
        },
        {
          key: this.$tco('Comment'),
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
