<template>
  <GenericCreateUpdatePage v-bind="$data" @getObjectDone="afterGetUser" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import UserPassword from '@/components/FormFields/UserPassword'
import rules from '@/components/DataForm/rules'
import { mapGetters } from 'vuex'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {},
      user: {
        'can_public_key_auth': false
      },
      fields: [
        [this.$t('users.Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.Authentication'), [
          'password_strategy', 'update_password', 'password', 'need_update_password',
          'set_public_key', 'public_key', 'mfa_level', 'source'
        ]],
        [this.$t('users.Secure'), ['system_roles', 'org_roles', 'date_expired']],
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
            if (formValue.password_strategy === 'custom') {
              return false
            }
            return !formValue.update_password
          },
          el: {
            required: false,
            userIsOrgAdmin: false
          }
        },
        need_update_password: {
          label: '',
          type: 'checkbox-group',
          el: {
            style: 'margin-top: -20px;margin-bottom: -10px'
          },
          options: [
            {
              label: true,
              value: this.$t('users.needUpdatePasswordNextLogin')
            }
          ],
          hidden: (formValue) => {
            if (formValue.password_strategy === 'custom') {
              return false
            }
            return !formValue.update_password || !this.user.can_public_key_auth
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
          label: this.$t('users.SystemRoles'),
          el: {
            multiple: true,
            ajax: {
              url: '/api/v1/rbac/system-roles/',
              transformOption: (item) => {
                if (item.name !== 'SystemComponent') {
                  return { label: item.display_name, value: item.id }
                }
                return false
              }
            }
          },
          hidden: () => {
            return !this.$hasPerm('rbac.add_systemrolebinding')
          },
          value: []
        },
        org_roles: {
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
            ajax: {
              url: '/api/v1/users/groups/'
            },
            value: []
          }
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
        return value
      }
    }
  },
  computed: {
    ...mapGetters(['currentOrgIsRoot'])
  },
  mounted() {
    if (this.currentOrgIsRoot) {
      this.fieldsMeta.groups.el.disabled = true
    }
  },
  methods: {
    afterGetUser(user) {
      this.user = user
      this.fieldsMeta.password.el.userIsOrgAdmin = user.role === 'Admin' || user.org_roles.indexOf('Admin') !== -1
      if (this.$route.query.clone_from) {
        this.user.groups = []
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
