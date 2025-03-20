<template>
  <DrawerListTable
    ref="drawer"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :resource="$tc('CommandGroup')"
    :table-config="tableConfig"
  />
</template>

<script>
import { DrawerListTable } from '@/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'CommandGroupList',
  components: {
    DrawerListTable
  },
  data() {
    const _id = this.$route.query.command_filters
    const url = `/api/v1/acls/command-groups/${_id ? `?command_filters=${_id}` : ''}`
    return {
      createDrawer: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupCreateUpdate.vue'),
      detailDrawer: () => import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupDetail/index.vue'),
      tableConfig: {
        url: url,
        permissions: {
          app: 'acls',
          resource: 'commandgroup'
        },
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'content', 'actions']
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'CommandGroupDetail'
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'CommandGroupUpdate',
              cloneRoute: 'CommandGroupCreate'
            }
          }
        }
      },
      headerActions: {
        hasRightActions: true,
        hasExport: false,
        hasImport: false,
        hasRefresh: true,
        hasSearch: true,
        hasMoreActions: false,
        createRoute: 'CommandGroupCreate',
        canCreate: () => {
          return this.$hasPerm('acls.add_commandgroup') && !this.$store.getters.currentOrgIsRoot
        },
        onCreate: () => {
          this.$refs.drawer.onCreate()
        }
      }
    }
  }
}
</script>
