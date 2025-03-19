<template>
  <ListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :resource="$t('UserLoginACL')"
    :table-config="tableConfig"
  />
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'

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
      createDrawer: () => import('./UserLoginACLCreateUpdate.vue'),
      detailDrawer: () => import('./UserDetail/index.vue'),
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
      }
    }
  }

}
</script>

