<template>
  <GenericCreateUpdatePage v-if="!loading" v-bind="$data" @getObjectDone="afterGetUser" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import { PhoneInput, UserPassword } from '@/components/Form/FormFields'
import rules from '@/components/Form/DataForm/rules'
import { mapGetters } from 'vuex'
import { Select2 } from '@/components'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
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
        [this.$t('users.Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.Authentication'), [
          'password_strategy', 'update_password', 'password', 'need_update_password',
          'set_public_key', 'public_key', 'mfa_level', 'source'
        ]],
        [this.$t('users.Secure'), ['system_roles', 'org_roles', 'is_active', 'date_expired']],
        [this.$t('common.Other'), ['phone', 'wechat', 'comment']]
      ],
      url: '/api/v1/users/users/',
      fieldsMeta: {
        password_strategy: {
          hidden: (formValue) => {
            return this.$route.params.id || formValue.source !== 'local'
          }
        },
        email: {
          rules: [
            rules.EmailCheck,
            rules.Required
          ]
        },
        update_password: {
          label: this.$t('users.UpdatePassword'),
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
          label: this.$t('users.needUpdatePasswordNextLogin'),
          type: 'checkbox-group',
          component: null, // 覆盖默认生成的 component
          el: {
            style: 'margin-bottom: -10px'
          },
          options: [
            {
              label: '',
              value: true
            }
          ],
          hidden: (formValue) => {
            if (formValue.source !== 'local') {
              return true
            }
            if (formValue.password_strategy === 'custom' || formValue.update_password || this.user.can_public_key_auth) {
              return false
            }
            return true
          }
        },
        set_public_key: {
          label: this.$t('users.SetPublicKey'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.set_public_key) {
              return true
            }
            return this.$route.meta.action !== 'update'
          }
        },
        public_key: {
          type: 'input',
          el: {
            type: 'textarea'
          },
          hidden: (formValue) => {
            return !formValue.set_public_key
          }
        },
        system_roles: {
          component: Select2,
          label: this.$t('users.SystemRoles'),
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
          label: this.$t('users.OrgRoles'),
          rules: this.$store.getters.currentOrgIsRoot ? [] : [rules.RequiredChange],
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
          },
          helpText: this.$t('users.HelpText.OrgRoleHelpText')
        },
        groups: {
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
          label: this.$t('users.IsActive'),
          el: {}
        }
      },
      submitMethod() {
        const params = this.$route.params
        if (params.id) {
          return 'put'
        } else {
          return 'post'
        }
      },
      afterGetFormValue(obj) {
        if (obj?.id) {
          obj.org_roles = obj.org_roles.map(({ id }) => id)
          obj.system_roles = obj.system_roles.map(({ id }) => id)
        }
        return obj
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
  async mounted() {
    if (this.currentOrgIsRoot) {
      this.fieldsMeta.groups.el.disabled = true
    }
    await this.setDefaultRoles()
    this.loading = false
  },
  methods: {
    afterGetUser(user) {
      this.user = user
      if (this.user.id === this.currentUser.id) {
        const fieldsToUpdate = ['system_roles', 'org_roles', 'is_active']
        fieldsToUpdate.forEach(field => {
          const msg = this.$t('users.disallowSelfUpdateFields', { attr: this.fieldsMeta[field]['label'] })
          this.fieldsMeta[field].el.disabled = true
          this.fieldsMeta[field].helpTips = msg
        })
      }
      this.fieldsMeta.password.el.userIsOrgAdmin = user['is_org_admin']
      if (this.$route.query.clone_from) {
        this.user.groups = []
      }
    },
    async setDefaultRoles() {
      const roles = await this.$axios.get('/api/v1/rbac/roles/')
      this.initial.system_roles = roles.filter(role => role.name === 'User').map(role => role.id)
      this.initial.org_roles = roles.filter(role => role.name === 'OrgUser').map(role => role.id)
    }
  }
}
</script>

<style lang="less" scoped>
</style>
