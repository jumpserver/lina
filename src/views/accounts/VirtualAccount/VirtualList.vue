<template>
  <ListTable v-bind="config" />
</template>

<script>
import { ListTable } from '@/components'

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
  }
}
</script>

<style scoped>

</style>
