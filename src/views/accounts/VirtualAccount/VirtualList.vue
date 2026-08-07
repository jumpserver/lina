<template>
  <div>
    <ListTable v-bind="config" ref="listTable" :update-drawer="updateDrawer" />
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
      updateDrawer: () => import('@/views/accounts/VirtualAccount/VirtualUpdate.vue'),
      config: {
        tableConfig: {
          url: '/api/v1/accounts/virtual-accounts/',
          columns: ['name', 'username', 'comment'],
          columnsMeta: {
            name: {
              sortable: false,
              formatterArgs: {
                drawer: true,
                getRoute: ({ row }) => {
                  return {
                    name: 'VirtualAccountDetail',
                    params: {
                      id: row.id
                    }
                  }
                }
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
      },
      activatedReloadTimer: null,
      hasBeenDeactivated: false
    }
  },
  activated() {
    if (!this.hasBeenDeactivated) {
      return
    }
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = setTimeout(() => {
      this.$refs.listTable?.reloadTable?.()
    }, 300)
  },
  deactivated() {
    this.hasBeenDeactivated = true
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  },
  beforeUnmount() {
    clearTimeout(this.activatedReloadTimer)
    this.activatedReloadTimer = null
  }
}
</script>
