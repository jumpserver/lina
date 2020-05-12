<template>
  <GenericCreateUpdatePage v-bind="$data" @validate="console.log('hello')" />
</template>

<script>
import i18n from '@/i18n/langs'
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    const vm = this
    return {
      initial: {
        password_strategy: 0,
        mfa_level: 0,
        source: 'local',
        role: 'Admin',
        date_expired: '2099-12-31 00:00:00 +0800'
      },
      fields: [
        [this.$t('users.create.Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.create.Authentication'), ['password_strategy', 'password', 'public_key', 'mfa_level', 'source']],
        [this.$t('users.create.Secure'), ['role', 'date_expired']],
        [this.$t('common.Other'), ['phone', 'wechat', 'comment']]
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
            multiple: true,
            url: '/api/v1/users/groups/',
            value: []
          }
        }
      },
      moreButtons: [
        {
          title: 'Test',
          callback: function(values) {
            vm.$log.debug('hello: ', values)
          }
        }
      ]
    }
  },
  mounted() {
    console.log('I18n: ', i18n)
  }
}
</script>

<style lang="less" scoped>
</style>
