<template>
  <GenericCreateUpdatePage :fields="fields" :form="form" :fields-meta="fieldsMeta" :url="url">
    <!--    <FormGroupHeader slot="id:name" title="账户" :line="false" />-->
    <!--    <FormGroupHeader slot="id:password_strategy" title="认证" :line="true" />-->
    <!--    <FormGroupHeader slot="id:role" title="角色安全" :line="true" />-->
    <!--    <FormGroupHeader slot="id:phone" title="认证" :line="true" />-->
  </GenericCreateUpdatePage>
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
        source: 'ldap',
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
          }
        }
      }
    }
  },
  methods: {
    debug() {
      console.log(this)
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
