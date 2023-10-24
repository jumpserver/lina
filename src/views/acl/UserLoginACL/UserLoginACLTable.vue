<template>
  <div>
    <ListTable :header-actions="headerActions" :table-config="tableConfig" />
    <UserLoginACLCreateUpdate />
  </div>
</template>

<script>
import ListTable from '@/components/Table/ListTable/index.vue'
import UserLoginACLCreateUpdate from './UserLoginACLCreateUpdate.vue'

export default {
  components: {
    ListTable,
    UserLoginACLCreateUpdate
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
            'action', 'comment', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'UserLoginAclDetail'
            }
          },
          reviewers_amount: {
            label: this.$t('common.ApproverNumbers')
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
      }
    }
  }
}
</script>

<style>

</style>
