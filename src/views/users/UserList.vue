<template>
  <Page>
    <IBox>
      <DataTable :config="tableConfig" />
    </IBox>
  </Page>
</template>

<script>
import { IBox, Page } from '@/layout/components'
import DataTable from '@/components/DataTable'

export default {
  components: {
    IBox,
    Page,
    DataTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/users/users/',
        defaultAlign: 'left',
        operationAttrs: {
          label: 'Operation',
          prop: 'operation',
          key: 'prop',
          align: 'center'
        },

        extraButtons: [
          {
            type: 'primary',
            // disabled: row => row.date === '2016-05-04',
            text: this.$t('users.update'),
            // 必须使用箭头函数
            atClick: (row) => {
              this.$router.push({ name: '404' })
            }
          },
          {
            type: 'warning',
            // disabled: row => row.date === '2016-05-04',
            text: this.$t('users.delete'),
            atClick: (row) => {

            }
          }
        ],
        columns: [
          { type: 'selection' },
          // Bug
          // 应该让我插入Slot,使这个用户名可点击
          {
            prop: 'name',
            label: this.$t('users.name'),
            sortable: true // 可排序
            // url: 'UserDetail' // 第一个函数指定 路由Template
          },
          {
            prop: 'username',
            label: this.$t('users.username'),
            sortable: true,
          },
          {
            prop: 'role',
            label: this.$t('users.role'),
            sortable: true
          },
          // Bug API没有返回组织名称
          {
            prop: 'group',
            label: this.$t('users.usergroup'),
            sortable: true,
            align: 'left',
            formatter: row => {
              return <a href='http://qq.com' target='_blank'>hello</a>
            }
          },
          {
            prop: 'source',
            label: this.$t('users.source'),
            sortable: true
          }
        ]
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
