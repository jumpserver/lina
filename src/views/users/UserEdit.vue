<template>
  <Page>
    <template>
      <el-card>
        <dataform :content="content" label-position="left" label-width="140px" :form="form">
          <formgroupheader slot="id:name" title="账户" :line="false" style="margin:0 50px;" />
          <formgroupheader slot="id:passwordrule" title="认证" :line="true" style="margin:0 50px;" />
        </dataform>
      </el-card>
    </template>
  </page>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import formgroupheader from '@/components/formGroupHeader'
import { Page } from '@/layout/components'
import dataform from '@/components/DataForm'
import select2 from '@/components/Select2'
export default {
  components: {
    Page,
    dataform,
    select2,
    formgroupheader
  },
  data() {
    return {
      content: [
        {
          type: 'input',
          id: 'name',
          label: this.$t('users.name'),
          el: {
            size: 'mini'
          },
          rules: [
            { required: true, message: 'miss name', trigger: 'blur' }
          ]
        },
        {
          type: 'input',
          id: 'username',
          label: this.$t('users.username'),
          el: {
            size: 'mini'
          },
          rules: [
            { required: true, message: 'miss name', trigger: 'blur' }
          ]
        },
        {
          type: 'input',
          id: 'email',
          label: this.$t('users.email'),
          el: {
            size: 'mini'
          },
          rules: [
            { required: true, message: 'miss name', trigger: 'blur' }
          ]
        },
        {
          id: 'users',
          label: '用户组',
          el: {
            size: 'mini',
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
            size: 'small'
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
            console.log(formValue, item)
            formValue.passwordrule !== '2'
          },
          el: {
            size: 'mini',
            type: 'password'
          },
          rules: [
            { required: true, message: 'miss name', trigger: 'blur' }
          ]
        },
        {
          type: 'radio-group',
          id: 'mfa',
          label: '密码策略',
          el: {
            size: 'small'
          },
          options: [{
            label: '禁用'
          }, {
            label: '启用'
          }, {
            label: '强制启用'
          }],
          rules: [
            { required: true, message: 'miss resource', trigger: 'change' }
          ]
        }, {
          type: 'select',
          id: 'source',
          label: '来源',
          el: {
            size: 'small'
          },
          options: [{
            label: 'area1',
            value: 'shanghai'
          }]
        }
      ]
    }
  }
}
</script>

<style lang="less" scoped>
.el-form /deep/ .el-select{
  width:100%;
}
</style>
