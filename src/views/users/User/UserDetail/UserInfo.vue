<template>
  <el-row :gutter="20">
    <el-col :md="14" :sm="24">
      <AutoDetailCard :fields="detailFields" :object="object" :url="url" />
    </el-col>
    <el-col :md="10" :sm="24">
      <QuickActions :actions="quickActions" type="primary" />
      <RelationCard style="margin-top: 15px" type="info" v-bind="relationConfig" />
    </el-col>
  </el-row>
</template>

<script>
import QuickActions from '@/components/QuickActions'
import RelationCard from '@/components/Cards/RelationCard'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'

export default {
  name: 'UserInfo',
  components: {
    RelationCard,
    QuickActions,
    AutoDetailCard
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
          type: 'switch',
          attrs: {
            model: this.object.is_active,
            disabled: !vm.$hasPerm('users.change_user')
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
            disabled: !vm.$hasPerm('users.change_user'),
            label: this.$t('common.Reset')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('users.quickUpdate.resetMFAWarningMsg')
              const warnTitle = vm.$t('common.Info')
              const url = `/api/v1/users/users/${vm.object.id}/mfa/reset/`
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
          title: this.$t('users.quickUpdate.resetPassword'),
          attrs: {
            type: 'primary',
            disabled: this.object.source.value !== 'local' || !vm.$hasPerm('users.change_user'),
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
            disabled: !this.$store.state.users.profile.can_public_key_auth || !vm.$hasPerm('users.change_user'),
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
            disabled: !this.object.login_blocked || !vm.$hasPerm('users.change_user')
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
      url: `/api/v1/users/users/${this.object.id}`,
      detailFields: [
        {
          key: '',
          formatter: () => {
            return <img src={this.object.avatar_url} alt='' height='50'/>
          }
        },
        'id', 'name', 'username', 'email',
        {
          key: this.$t('users.Phone'),
          formatter: () => {
            const phoneObj = this.object.phone
            return <div>{phoneObj?.code} {phoneObj?.phone}</div>
          }
        },
        'wecom_id', 'dingtalk_id', 'feishu_id',
        {
          key: this.$t('users.Role'),
          formatter: (item, val) => {
            const rolesDisplay = this.object.org_roles.concat(this.object.system_roles || [])
            const dom = rolesDisplay.map(item => {
              return <el-tag size='mini'>{item.display_name}</el-tag>
            })
            return <div>{dom}</div>
          }
        },
        {
          key: this.$t('users.OrgsAndRoles'),
          has: this.$store.getters.currentOrgIsRoot,
          formatter: (item, val) => {
            const doms = []
            const orgsRoles = this.object.orgs_roles
            const allowKeyMaxLength = 50
            Object.entries(orgsRoles).forEach(([key, value]) => {
              let prettyKey = key
              if (key.length >= allowKeyMaxLength) {
                prettyKey = key.substring(0, allowKeyMaxLength - 3) + '...'
              }
              const item = prettyKey + ': ' + value.join(', ')
              doms.push([item, <br/>])
            })
            return <div>{doms}</div>
          }
        },
        'mfa_level', 'source', 'created_by', 'date_joined', 'date_expired',
        'date_password_last_updated', 'last_login', 'comment'
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
      }
    }
  },
  computed: {},
  watch: {
    group(iNew, iOld) {
      this.$log.debug('Group has changed')
      this.relationConfig.hasObjectsId = iNew.users
    }
  },
  methods: {}
}
</script>

<style scoped>
  .mfa-setting >>> .el-slider__runway {
    margin-top: 0;
    margin-bottom: 0;
  }

</style>
