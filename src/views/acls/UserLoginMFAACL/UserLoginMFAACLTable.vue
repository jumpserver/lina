<template>
  <ListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :resource="$t('UserLoginMFAACL')"
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
      default: '/api/v1/acls/login-mfa-acls/'
    }
  },
  data() {
    return {
      createDrawer: () => import('./UserLoginMFAACLCreateUpdate.vue'),
      detailDrawer: () => import('./UserDetail/index.vue'),
      tableConfig: {
        url: this.url,
        columnsExclude: ['rules', 'users', 'reviewers'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'priority', 'is_active', 'mfa_type', 'action', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              route: 'UserLoginMFAACLDetail'
            }
          },
          mfa_type: {
            label: this.$t('MFAType')
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              updateRoute: ({ row }) => {
                return {
                  name: 'UserLoginMFAACLUpdate',
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
        createRoute: 'UserLoginMFAACLCreate'
      }
    }
  },
  activated() {
    setTimeout(() => {
      this.$refs.listTable.reloadTable()
    }, 300)
  }
}
</script>
