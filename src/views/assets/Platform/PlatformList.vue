<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
export default {
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/assets/platforms/',
        columns: [
          'name', 'category', 'type',
          'comment', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'category', 'type', 'actions']
        },
        columnsMeta: {
          base: {
            width: '140px'
          },
          actions: {
            formatterArgs: {
              canClone: vm.$hasPerm('assets.add_platform'),
              canUpdate: ({ row }) => !row.internal && vm.$hasPerm('assets.change_platform'),
              canDelete: ({ row }) => !row.internal && vm.$hasPerm('assets.delete_platform')
            }
          }
        }
      },
      headerActions: {
        hasRightActions: true,
        hasMoreActions: false,
        hasBulkDelete: false,
        createRoute: 'PlatformCreate'
      }
    }
  }
}
</script>

<style>

</style>
