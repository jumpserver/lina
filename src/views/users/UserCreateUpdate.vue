<template>
  <GenericCreateUpdatePage :fields="fields" :initial="initial" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
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
        role: 'Admin',
        date_expired: '2099-12-31 00:00:00 +0800'
      },
      fields: [
        [this.$t('users.' + 'Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.' + 'Authentication'), ['password_strategy', 'password', 'public_key', 'mfa_level', 'source']],
        [this.$t('users.' + 'Secure'), ['role', 'date_expired']],
        [this.$tc('Other'), ['phone', 'wechat', 'comment']]
      ],
      url: '/api/v1/users/users/',
      fieldsMeta: {
        password_strategy: {
          hidden: () => {
            return this.$route.params.id
          }
        },
        password: {
          hidden: (formValue) => {
            if (this.$route.meta.action === 'update') {
              return false
            }
            return formValue.password_strategy !== 1
          }
        },
        public_key: {
          hidden: (formValue, item) => {
            return this.$route.meta.action !== 'update'
          }
        },
        groups: {
          el: {
            value: [],
            url: '/api/v1/users/groups/'
          }
        }
      }
    }
  }
}
</script>

<style lang="less" scoped>
</style>
