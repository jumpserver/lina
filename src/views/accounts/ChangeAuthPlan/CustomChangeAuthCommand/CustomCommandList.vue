<template>
  <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DateFormatter, DisplayFormatter, ArrayFormatter } from '@/components/TableFormatters'
export default {
  name: 'CustomCommandList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/change-auth-plan/custom-auth-commands/',
        columns: ['name', 'commands', 'comment', 'date_created', 'actions'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'commands', 'comment', 'date_created', 'actions']
        },
        columnsMeta: {
          name: {
            label: vm.$t('common.Name'),
            formatter: DisplayFormatter
          },
          commands: {
            label: vm.$t('xpack.Command'),
            formatter: ArrayFormatter
          },
          comment: {
            width: '180px'
          },
          date_created: {
            label: vm.$t('common.dateCreated'),
            showOverflowTooltip: true,
            formatter: DateFormatter
          },
          actions: {
            width: '164px',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'CustomAuthCommandCreate', query: { clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'CustomAuthCommandUpdate', params: { id: row.id }})
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
        createRoute: 'CustomAuthCommandCreate'
      }
    }
  }
}
</script>

<style scoped>
</style>
