<template>
  <Page>
    <IBox>
      <DataForm :form="form" :fields="fields">
        <FormGroupHeader slot="id:name" title="账户" :line="false" />
        <FormGroupHeader slot="id:passwordrule" title="认证" :line="true" />
        <FormGroupHeader slot="id:role" title="角色安全" :line="true" />
        <FormGroupHeader slot="id:phone" title="认证" :line="true" />
      </DataForm>
    </IBox>
  </Page>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import FormGroupHeader from '@/components/formGroupHeader'
import { Page, IBox } from '@/layout/components'
import DataForm from '@/components/DataForm'
import rules from '@/components/DataForm/rules'
import select2 from '@/components/Select2'
export default {
  components: {
    Page,
    IBox,
    DataForm,
    select2,
    FormGroupHeader
  },
  data() {
    return {
      form: {
        passwordrule: '1',
        mfa_level: 0,
        source: 'local',
        role: 'Admin',
        date_expired: '2099-12-31 00:00:00 +0800'
      },
      fields: [
        {
          type: 'input',
          id: 'name',
          label: this.$t('users.name'),
          el: {
          },
          rules: [
            rules.Required
          ]
        },
        {
          type: 'input',
          id: 'username',
          label: this.$t('users.username'),
          el: {
          },
          rules: [
            rules.Required
          ]
        },
        {
          type: 'input',
          id: 'email',
          label: this.$t('users.email'),
          el: {
          },
          rules: [
            rules.Required
          ]
        },
        {
          id: 'users',
          label: '用户组',
          el: {
            placeholder: '添加到用户组',
            value: [
              {
                label: 'hello',
                value: '1a775bbf-6861-4acb-8ae4-2f684794c8cc'
              },
              {
                label: 'test',
                value: '4dccdf84-7728-4de0-a507-67c905b3091b'
              },
              {
                label: 'whold',
                value: 'c5ec4b91-1fb2-478e-89bc-5a4abc0f9c6c'
              }
            ],
            url: '/api/v1/users/users/'
          },
          // 自定义组件
          // 可以取到自定义组件的值
          // https://femessage.github.io/el-form-renderer/#/Guide?id=guide-custom-component

          component: select2
        }, {
          type: 'radio-group',
          id: 'passwordrule',
          label: '密码策略',
          el: {
          },
          hidden: (formValue, item) => {
            return this.$route.params.id
          },
          options: [{
            label: '生成重置密码链接，通过邮件发送给用户',
            value: '1'
          }, {
            label: '设置密码',
            value: '2'
          }],
          rules: [
            { required: true, message: 'miss resource', trigger: 'change' }
          ]
        }, {
          type: 'input',
          id: 'password',
          label: '密码',
          hidden: (formValue, item) => {
            if (this.$route.params.id === undefined) {
              return (formValue.passwordrule !== '2')
            } else {
              return true
            }
          },
          el: {
            type: 'password'
          }
        },
        {
          type: 'input',
          id: 'sshkey',
          label: 'ssh公钥',
          hidden: (formValue, item) => {
            return !this.$route.params.id
          },
          el: {
            placeholder: 'ssh-rsa AAAA...',
            type: 'textarea',
            rows: 3
          }
        },
        {
          type: 'radio-group',
          id: 'mfa_level',
          label: '多因子认证',
          el: {
          },
          size: 0,
          options: [{
            label: '禁用',
            value: 0
          }, {
            label: '启用',
            value: 1
          }, {
            label: '强制启用',
            value: 2
          }],
          rules: [
            rules.Required
          ]
        }, {
          type: 'select',
          id: 'source',
          label: '来源',
          el: {
          },
          default: '数据库',
          options: [{
            label: '数据库',
            value: 'local'
          }],
          rules: [
            rules.Required
          ]
        },
        {
          type: 'select',
          id: 'role',
          label: '角色',
          el: {
          },
          default: 'User',
          options: [{
            label: '管理员',
            value: 'Admin'
          }, {
            label: '用户',
            value: 'User'
          }, {
            label: '审计员',
            value: 'Auditor'
          }],
          rules: [
            rules.Required
          ]
        },
        {
          type: 'date-picker',
          id: 'date_expired',
          label: '过期时间',
          el: {
            type: 'datetime',
            placeholder: 'select date'
          },
          rules: [
            rules.Required
          ]
        },
        {
          type: 'input',
          id: 'phone',
          label: '手机',
          el: {
          }
        }, {
          type: 'input',
          id: 'wechat',
          label: '微信',
          el: {
          }
        }, {
          type: 'input',
          id: 'comment',
          label: '备注',
          el: {
            type: 'textarea',
            row: '4'
          }
        }
      ]
    }
  },
  methods: {
    debug() {
      console.log(this)
    }
  },
  mounted() {
    console.log('>>>>>>>>>>')
    console.log(rules)
    console.log(rules.Required)
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
