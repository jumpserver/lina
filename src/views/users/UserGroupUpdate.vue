<template>
  <Page>
    <template>
      <el-card>
        <dataform fields="content" label-position="right" label-width="100px" :form="form" />
      </el-card>
    </template>
  </page>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import { Page } from '@/layout/components'
import DataForm from '@/components/DataForm'
import select2 from '@/components/Select2'
export default {
  components: {
    Page,
    dataform,
    select2
  },
  data() {
    return {
      content: [
        {
          type: 'input',
          id: 'name',
          label: 'name',
          attrs: { 'data-name': 'form1' },
          el: {
            size: 'mini',
            placeholder: 'test placeholder'
          },
          rules: [
            { required: true, message: 'miss name', trigger: 'blur' }
          ]
        },
        {
          id: 'users',
          label: this.$t('users.user'),
          el: {
            size: 'mini',
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
          component: select2
        },
        {
          type: 'input',
          id: 'comment',
          el: {
            type: 'textarea',
            rows: 3
          },
          label: this.$t('users.comment')
        }
      ]
    }
  },
  methods: {

  }
}
</script>

<style lang="less" scoped>

</style>
