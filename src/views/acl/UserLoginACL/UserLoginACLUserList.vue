<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :title="title" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/ListTable/formatters'
export default {
  name: 'UserLoginACLList',
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/acls/login-acls/users/',
        columns: ['name', 'username', 'login_acls'],
        columnsShow: {
          min: ['name', 'login_acls', 'actions'],
          default: ['name', 'username', 'login_acls']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              getRoute: ({ row }) => {
                return {
                  name: 'UserLoginACLDetail',
                  params: { id: row.id }
                }
              }
            }
          },
          login_acls: {
            label: this.$t('assets.Rules'),
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ cellValue }) => {
                return cellValue.length
              },
              getRoute: ({ row }) => {
                return {
                  name: 'UserLoginACLDetail',
                  params: { id: row.id }
                }
              }
            }
          }
        }
      },
      headerActions: {
        hasImport: false,
        hasExport: false,
        hasMoreActions: false
      },
      title: '用户登录控制'
    }
  }
}
</script>

<style scoped>

</style>
