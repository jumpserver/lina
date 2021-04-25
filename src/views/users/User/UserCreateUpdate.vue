<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :clean-form-value="cleanFormValue"
    @getObjectDone="afterGetUser"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import UserPassword from '@/components/UserPassword'
import RoleCheckbox from '@/views/users/User/components/RoleCheckbox'
import rules from '@/components/DataForm/rules'
import { mapGetters } from 'vuex'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
      },
      user: {
        'can_public_key_auth': false
      },
      fields: [
        [this.$t('users.Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.Authentication'), [
          'password_strategy', 'update_password', 'password', 'set_public_key',
          'public_key', 'mfa_level', 'source'
        ]],
        [this.$t('users.Secure'), ['role', 'org_roles', 'date_expired']],
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
            if (formValue.password_strategy) {
              return false
            }
            return !formValue.update_password || !formValue.can_public_key_auth
          },
          el: {
            required: false
          }
        },
        set_public_key: {
          label: this.$t('users.SetPublicKey'),
          type: 'checkbox',
          hidden: (formValue) => {
            if (formValue.set_public_key) {
              return true
            }
            return this.$route.meta.action !== 'update' || !this.user.can_public_key_auth
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
        role: {
          label: this.$t('users.SuperRole'),
          hidden: () => {
            return !this.$store.getters.currentUserIsSuperAdmin
          }
        },
        org_roles: {
          rules: [rules.RequiredChange],
          label: this.$t('users.OrgRole'),
          component: RoleCheckbox,
          hidden: () => {
            return !this.$store.getters.hasValidLicense
          },
          el: {
            disabled: this.$store.getters.currentOrgIsRoot,
            rule: []
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
    cleanFormValue(value) {
      const method = this.getMethod()
      if (method === 'post' && !value.password_strategy) {
        delete value['password']
      }
      return value
    },
    getMethod() {
      const params = this.$route.params
      if (params.id) {
        return 'put'
      } else {
        return 'post'
      }
    },
    afterGetUser(user) {
      this.user = user
    }
  }
}
</script>

<style lang="less" scoped>
</style>
