<template>
  <ListTable
    ref="listTable"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :create-drawer="createDrawer"
  />
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'

export default {
  components: {
    ListTable
  },
  props: {
    url: {
      type: String,
      default: '/api/v1/acls/login-acls/'
    }
  },
  data() {
    return {
      tableConfig: {
        url: this.url,
        columnsExclude: ['rules', 'users'],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'priority', 'is_active',
            'action', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'UserLoginAclDetail'
            }
          },
          reviewers_amount: {
            label: this.$t('ApproverNumbers')
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: ({ row }) => {
                return {
                  name: 'UserLoginAclUpdate',
                  params: {
                    id: row.id
                  }
                }
              }
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        createRoute: 'UserLoginAclCreate'
      },
      createDrawer: () => import('./UserLoginACLCreateUpdate.vue')
    }
  },
  activated() {
    setTimeout(() => {
      this.$refs.listTable.reloadTable()
    }, 300)
  }
}
</script>

