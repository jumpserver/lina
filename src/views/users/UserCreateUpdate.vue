<template>
  <Page>
    <IBox>
      <AutoDataForm :form="form" :fields="fields" :fields-meta="fieldsMeta">
        <FormGroupHeader slot="id:name" title="账户" :line="false" />
        <FormGroupHeader slot="id:password_strategy" title="认证" :line="true" />
        <FormGroupHeader slot="id:role" title="角色安全" :line="true" />
        <FormGroupHeader slot="id:phone" title="认证" :line="true" />
      </AutoDataForm>
    </IBox>
  </Page>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import FormGroupHeader from '@/components/formGroupHeader'
import { Page, IBox } from '@/layout/components'
import DataForm from '@/components/DataForm'
import AutoDataForm from '@/components/AutoDataForm'
import Select2 from '@/components/Select2'
export default {
  components: {
    Page,
    IBox,
    DataForm,
    Select2,
    FormGroupHeader,
    AutoDataForm
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
        'name', 'username', 'email', 'groups', 'password_strategy', 'password', 'mfa_level',
        'source', 'role', 'date_expired', 'phone', 'wechat', 'comment'
      ],
      fieldsMeta: {
        password: {
          el: {
            type: 'password'
          },
          hidden: (formValue, item) => {
            console.log('hidden password', formValue.password_strategy)
            if (this.$route.params.id === undefined) {
              return formValue.password_strategy !== 1
            } else {
              return true
            }
          }
        },
        email: {
          el: {
            type: 'email'
          }
        },
        groups: {
          el: {
            value: [],
            url: '/api/v1/users/groups/'
          }
        },
        comment: {
          el: {
            type: 'textarea'
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
