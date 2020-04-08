<template>
  <GenericCreateUpdatePage :fields="fields" :form="form" :fields-meta="fieldsMeta" :url="url" />
</template>

<script>
import { GenericCreateUpdatePage } from '@/layout/components'
export default {
  components: {
    GenericCreateUpdatePage
  },
  data() {
    return {
      form: {
        password_strategy: 0,
        mfa_level: 0,
        source: 'local',
        role: 'Admin',
        date_expired: '2099-12-31 00:00:00 +0800'
      },
      fields: [
        [this.$t('users.' + 'Account'), ['name', 'username', 'email', 'groups']],
        [this.$t('users.' + 'Authentication'), ['password_strategy', 'password', 'mfa_level', 'source']],
        [this.$t('users.' + 'Secure'), ['role', 'date_expired']],
        [this.$tc('Other'), ['phone', 'wechat', 'comment']]
      ],
      url: '/api/v1/users/users/',
      fieldsMeta: {
        password: {
          hidden: (formValue, item) => {
            console.log('hidden password', formValue.password_strategy)
            if (this.$route.params.id === undefined) {
              return formValue.password_strategy !== 1
            } else {
              return true
            }
          }
        },
        groups: {
          el: {
            value: [],
            url: '/api/v1/users/groups/'
          },
          rules: [
            this.serverErrorRule
          ]
        }
      }
    }
  },
  methods: {
    debug() {
      console.log(this)
    },
    serverErrorRule(rule, value, callback) {
      console.log('Server error rule')
      console.log(rule)
      console.log(value)
    }
  }
}
</script>

<style lang="less" scoped>
.el-form /deep/ .el-select{
  width:100%;
}
.el-form /deep/ .el-form-item__content > .el-date-editor{
  width:100%;
}
</style>
