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
    return {
      createDrawer: () =>
        import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupCreateUpdate.vue'),
      detailDrawer: () =>
        import('@/views/acls/CommandFilterACL/CommandGroup/CommandGroupDetail/index.vue'),
      tableConfig: {
        url: '/api/v1/acls/command-groups/',
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
        searchConfig: {
          fieldLabels: {
            command_filters: this.$t('CommandFilterACL')
          }
        },
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
