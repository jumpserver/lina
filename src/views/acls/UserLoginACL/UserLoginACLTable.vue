<template>
  <ListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :header-actions="headerActions"
    :resource="$t('UserLoginACL')"
    :table-config="tableConfig"
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
              route: 'UserLoginACLDetail'
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
                  name: 'UserLoginACLUpdate',
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
        createRoute: 'UserLoginACLCreate'
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

