<template>
  <GenericCreateUpdatePage
    v-if="!loading"
    class="user-create-update"
    v-bind="$data"
    @getObjectDone="afterGetUser"
    v-on="$listeners"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { PhoneInput, UserPassword } from '@/components/Form/FormFields'
import rules from '@/components/Form/DataForm/rules'
import { mapGetters } from 'vuex'
import { Select2 } from '@/components'
import store from '@/store'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const roleManage = this.$t('RoleManage')
    return {
      loading: true,
      initial: {
        need_update_password: true,
        system_roles: [],
        org_roles: []
      },
      user: {
        'can_public_key_auth': false
      },
      fields: [
        [this.$t('Basic'), ['name', 'username', 'email', 'groups']],
        [this.$t('Authentication'), [
          'password_strategy', 'update_password', 'password',
          'need_update_password', 'mfa_level', 'source'
        ]],
        [this.$t('Secure'), ['system_roles', 'org_roles', 'is_active', 'date_expired']],
        [this.$t('Other'), ['phone', 'comment']]
      ],
      url: '/api/v1/users/users/',
      fieldsMeta: {
        name: {},
        username: {},
        password_strategy: {
          hidden: (formValue) => {
            return this.$route.params.id || formValue.source !== 'local'
          }
        },
        mfa_level: {
          disabled: false,
          tips: {
            2: this.$t('forceEnableMFAHelpText')
          }
        },
        email: {
          rules: [
            rules.EmailCheck,
            rules.Required
          ]
        },
        update_password: {
          label: this.$t('ChangePassword'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.update_password) {
              return true
            }

            return this.$route.meta.action !== 'update' || formValue.source !== 'local'
          }
        },
        password: {
          component: UserPassword,
          hidden: (formValue) => {
            if (formValue.source !== 'local') {
              return true
            }
            if (formValue.password_strategy === 'custom' || formValue.update_password) {
              return false
            }
            return true
          },
          el: {
            required: false,
            userIsOrgAdmin: false
          }
        },
        need_update_password: {
          label: '',
          type: 'checkbox-group',
          component: null, // 覆盖默认生成的 component
          el: {
            style: 'margin-bottom: -10px'
          },
          options: [
            {
              label: this.$t('ResetPasswordNextLogin'),
              value: true
            }
          ],
          hidden: (formValue) => {
            if (formValue.source !== 'local') {
              return true
            }
            if (formValue.password_strategy === 'custom') {
              return false
            } else if (formValue.update_password) {
              return false
            } else {
              return true
            }
          }
        },
        system_roles: {
          component: Select2,
          el: {
            multiple: true,
            ajax: {
              url: '/api/v1/rbac/system-roles/?id!=00000000-0000-0000-0000-000000000004',
              transformOption: (item) => {
                return { label: item.display_name, value: item.id }
              }
            }
          },
          hidden: () => {
            return !this.$hasPerm('rbac.add_systemrolebinding')
          },
          value: []
        },
        org_roles: {
          component: Select2,
          label: this.$t('OrgRoles'),
          rules: this.$store.getters.currentOrgIsRoot ? [] : [rules.RequiredChange],
          helpTextFormatter: () => {
            const handleClick = () => {
              this.$router.push({ name: 'RoleList' })
              // window.open('/settings/roles', '_blank')
            }
            return (
              <el-link onClick={handleClick}>
                <i class='fa fa-external-link'></i> {roleManage}
              </el-link>
            )
          },
          el: {
            multiple: true,
            ajax: {
              url: '/api/v1/rbac/org-roles/',
              transformOption: (item) => {
                return { label: item.display_name, value: item.id }
              }
            },
            disabled: this.$store.getters.currentOrgIsRoot,
            value: []
          },
          hidden: () => {
            return !this.$store.getters.hasValidLicense ||
              !this.$hasPerm('rbac.add_orgrolebinding') ||
              this.$store.getters.currentOrgIsRoot
          }
        },
        groups: {
          helpTextAsPlaceholder: true,
          el: {
            multiple: true,
            disabled: this.$store.getters.currentOrgIsRoot,
            ajax: {
              url: '/api/v1/users/groups/'
            },
            value: []
          }
        },
        phone: {
          component: PhoneInput
        },
        is_active: {
          label: this.$t('IsActive'),
          el: {}
        }
      },
      afterGetFormValue(obj) {
        if (obj?.id) {
          obj.org_roles = obj.org_roles?.map(({ id }) => id)
          obj.system_roles = obj.system_roles?.map(({ id }) => id)
        }
        return obj
      },
      submitMethod() {
        const params = this.$route.params
        if (params.id) {
          return 'put'
        } else {
          return 'post'
        }
      },
      cleanFormValue(value) {
        const method = this.submitMethod()
        if (method === 'post' && value.password_strategy === 'email') {
          delete value['password']
          if (this.currentOrgIsRoot) {
            delete value['groups']
          }
        }
        if (value.update_password !== undefined) {
          delete value.update_password
        }
        if (value.source !== 'local') {
          delete value.need_update_password
        }
        return value
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot', 'currentUser'])
  },
  mounted() {
    if (this.currentOrgIsRoot) {
      this.fieldsMeta.groups.el.disabled = true
    }
    this.setDefaultRoles()
    this.disableMFAFieldIfNeed(null)
    this.loading = false
  },
  methods: {
    afterGetUser(user) {
      this.user = user
      if (this.user.id === this.currentUser.id) {
        const fieldsToUpdate = ['system_roles', 'org_roles', 'is_active']
        fieldsToUpdate.forEach(field => {
          const msg = this.$t('disallowSelfUpdateFields', { attr: this.fieldsMeta[field]['label'] })
          this.fieldsMeta[field].el.disabled = true
          this.fieldsMeta[field].helpTip = msg
        })
      }
      this.fieldsMeta.password.el.userIsOrgAdmin = user['is_org_admin']
      if (this.$route.query.clone_from) {
        this.user.groups = []
      }
      this.disableMFAFieldIfNeed(user)
    },
    async setDefaultRoles() {
      const roles = await this.$axios.get('/api/v1/rbac/roles/')
      this.initial.system_roles = roles.filter(role => role.name === 'User').map(role => role.id)
      this.initial.org_roles = roles.filter(role => role.name === 'OrgUser').map(role => role.id)
    },
    disableMFAFieldIfNeed(user) {
      // SECURITY_MFA_AUTH 0 不开启 1 全局开启 2 管理员开启
      const adminUserIsNeed = (user?.is_superuser || user?.is_org_admin) && this.$route.meta.action === 'update' &&
        store.getters.publicSettings['SECURITY_MFA_AUTH'] === 2
      if (store.getters.publicSettings['SECURITY_MFA_AUTH'] === 1 || adminUserIsNeed) {
        this.fieldsMeta['mfa_level'].disabled = true
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.user-create-update ::v-deep .el-form-item-need_update_password {
  margin-top: -10px;

  .el-form-item__content label {
    line-height: 30px;
  }
}

</style>
