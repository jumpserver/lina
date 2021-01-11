<template>
  <GenericCreateUpdatePage
    v-bind="$data"
    :clean-form-value="cleanFormValue"
  />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import UserPassword from '@/components/UserPassword'
import RoleCheckbox from '@/views/users/User/components/RoleCheckbox'
import { getDayFuture } from '@/utils/common'
import { mapGetters } from 'vuex'
import rules from '@/components/DataForm/rules'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        password_strategy: 0,
        mfa_level: 0,
        role: 'User',
        source: 'local',
        org_roles: ['User'],
        date_expired: getDayFuture(36500, new Date()).toISOString()
      },
      fields: [
        [this.$t('users.Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.Authentication'), ['password_strategy', 'update_password', 'password', 'set_public_key', 'public_key', 'mfa_level', 'source']],
        [this.$t('users.Secure'), ['role', 'org_roles', 'date_expired']],
        [this.$t('common.Other'), ['phone', 'wechat', 'comment']]
      ],
      url: '/api/v1/users/users/',
      fieldsMeta: {
        password_strategy: {
          hidden: () => {
            return this.$route.params.id
          }
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
        source: {
          hidden: () => { return true }
        },
        password: {
          component: UserPassword,
          hidden: (formValue) => {
            if (formValue.password_strategy) {
              return false
            }
            return !formValue.update_password
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
            return this.$route.meta.action !== 'update'
          }
        },
        public_key: {
          hidden: (formValue) => {
            return !formValue.set_public_key
          }
        },
        role: {
          label: this.$t('users.SuperRole'),
          hidden: () => {
            return !this.currentOrgIsDefault && this.publicSettings.role === 'Admin'
          }
        },
        org_roles: {
          rules: [rules.RequiredChange],
          label: this.$t('users.OrgRole'),
          component: RoleCheckbox,
          hidden: () => {
            return (!this.publicSettings.XPACK_LICENSE_IS_VALID)
          },
          el: {
            disabled: false,
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
    ...mapGetters(['publicSettings', 'currentOrg']),
    currentOrgIsDefault() {
      return this.currentOrg.id === 'DEFAULT' || this.currentOrg.id === ''
    }
  },
  mounted() {
    if (this.currentOrgIsDefault) {
      this.fieldsMeta.org_roles.el.disabled = true
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
    }
  }
}
</script>

<style lang="less" scoped>
</style>
