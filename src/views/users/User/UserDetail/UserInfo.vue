<template>
  <TwoCol>
    <template>
      <AutoDetailCard
        :fields="detailFields"
        :formatters="detailFormatters"
        :object="object"
        :url="url"
      />
    </template>
    <template #right>
      <QuickActions :actions="quickActions" type="primary" />
      <RelationCard type="info" v-bind="relationConfig" />
    </template>
  </TwoCol>
</template>

<script>
import { QuickActions } from '@/components'
import RelationCard from '@/components/Cards/RelationCard'
import AutoDetailCard from '@/components/Cards/DetailCard/auto'
import TwoCol from '@/layout/components/Page/TwoColPage.vue'

export default {
  name: 'UserInfo',
  components: {
    TwoCol,
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
          title: this.$t('Active'),
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
                vm.$message.success(vm.$t('UpdateSuccessMsg'))
              }).catch(err => {
                vm.$message.error(vm.$t('UpdateErrorMsg' + ' ' + err))
              })
            }
          }
        },
        {
          title: this.$t('ResetPassword'),
          attrs: {
            type: 'primary',
            disabled: this.object.source.value !== 'local' || !vm.$hasPerm('users.change_user'),
            label: this.$t('Send')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('ResetPasswordWarningMsg')
              const warnTitle = vm.$t('Info')
              const url = `/api/v1/users/users/${vm.object.id}/password/reset/`
              const successMsg = vm.$t('ResetPasswordSuccessMsg')
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
          title: this.$t('ResetSSHKey'),
          attrs: {
            type: 'primary',
            disabled: !this.$store.state.users.profile.can_public_key_auth || !vm.$hasPerm('users.change_user'),
            label: this.$t('Send')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('ResetSSHKeyWarningMsg')
              const warnTitle = vm.$t('Info')
              const url = `/api/v1/users/users/${vm.object.id}/pubkey/reset/`
              const successMsg = vm.$t('ResetSSHKeySuccessMsg')
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
          title: this.$t('ResetMFA'),
          attrs: {
            type: 'primary',
            disabled: !vm.$hasPerm('users.change_user'),
            label: this.$t('Reset')
          },
          callbacks: {
            click: function() {
              const warnMsg = vm.$t('ResetMFAWarningMsg')
              const warnTitle = vm.$t('Info')
              const url = `/api/v1/users/users/${vm.object.id}/mfa/reset/`
              const successMsg = vm.$t('ResetMFAdSuccessMsg')
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
          title: this.$t('UnblockUser'),
          attrs: {
            type: 'primary',
            label: this.$t('Unblock'),
            disabled: !this.object.login_blocked || !vm.$hasPerm('users.change_user')
          },
          callbacks: {
            click: function(v, item) {
              const url = `/api/v1/users/users/${vm.object.id}/unblock/`
              const unblockSuccessMsg = vm.$t('UnblockSuccessMsg')
              vm.$axios.patch(url).then(() => {
                item.attrs.disabled = !item.attrs.disabled
                vm.$message.success(unblockSuccessMsg)
              })
            }
          }
        }
      ],
      url: `/api/v1/users/users/${this.object.id}`,
      detailFormatters: {
        phone: () => {
          const phoneObj = vm.object.phone
          return <div>{phoneObj?.code} {phoneObj?.phone}</div>
        },
        system_roles: () => {
          const rolesDisplay = vm.object.system_roles || []
          const dom = rolesDisplay.map(item => {
            return <el-tag size='mini'>{item.display_name}</el-tag>
          })
          return <div>{dom}</div>
        },
        org_roles: () => {
          const rolesDisplay = vm.object.org_roles || []
          const dom = rolesDisplay.map(item => {
            return <el-tag size='mini'>{item.display_name}</el-tag>
          })
          return <div>{dom}</div>
        }
      },
      detailFields: [
        {
          key: '',
          formatter: () => {
            return <img src={this.object.avatar_url} alt='' height='50'/>
          }
        },
        'id', 'name', 'username', 'email', 'phone',
        'system_roles', 'org_roles',
        {
          key: this.$t('OrgsAndRoles'),
          has: this.$store.getters.currentOrgIsRoot,
          formatter: (item, val) => {
            if (!this.$store.getters.currentOrgIsRoot) {
              return ''
            }
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
        'wecom_id', 'dingtalk_id', 'feishu_id', 'mfa_level',
        'source', 'labels',
        'created_by', 'date_joined', 'date_expired',
        'date_password_last_updated', 'last_login', 'comment'
      ],
      relationConfig: {
        icon: 'fa-user',
        title: this.$t('UserGroups'),
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

<style lang="scss" scoped>
.mfa-setting ::v-deep .el-slider__runway {
  margin-top: 0;
  margin-bottom: 0;
}

.detail-right-quick-actions {
  display: flex;

  & > div {
    margin-right: 20px;
    width: 350px;
  }

  & > div:last-child {
    margin-right: 0; /* 清除最后一个元素的多余间距 */
  }
}

</style>
