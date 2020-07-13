<template>
  <GenericCreateUpdatePage v-bind="$data" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
import UserPassword from '@/components/UserPassword'
import { getDayFuture } from '@/utils/common'

export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      initial: {
        password_strategy: 0,
        mfa_level: 0,
        source: 'local',
        role: 'User',
        date_expired: getDayFuture(36500, new Date()).toISOString()
      },
      fields: [
        [this.$t('users.Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.Authentication'), ['password_strategy', 'update_password', 'password', 'set_public_key', 'public_key', 'mfa_level', 'source']],
        [this.$t('users.Secure'), ['role', 'date_expired']],
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
  }
}
</script>

<style lang="less" scoped>
</style>
