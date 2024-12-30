<template>
  <div>
    <ListTable ref="listTable" v-bind="config" />
  </div>
</template>

<script>
import { DrawerListTable as ListTable } from '@/components'

export default {
  name: 'VirtualAccountList',
  components: {
    ListTable
  },
  data() {
    return {
      config: {
        tableConfig: {
          url: '/api/v1/accounts/virtual-accounts/',
          columns: ['name', 'username', 'comment'],
          columnsMeta: {
            name: {
              sortable: false,
              formatterArgs: {
                route: 'VirtualAccountDetail'
              }
            },
            actions: {
              formatterArgs: {
                hasClone: false,
                hasDelete: false,
                updateRoute: 'VirtualAccountUpdate',
                canUpdate: ({ row }) => {
                  return row.alias === '@USER'
                }
              }
            }
          }
        },
        headerActions: {
          hasLeftActions: false,
          hasImport: false,
          hasExport: false
        }
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
