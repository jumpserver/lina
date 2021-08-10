<template>
  <GenericListPage ref="GenericListTable" :table-config="tableConfig" :header-actions="headerActions" />
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
        url: '/api/v1/tickets/templates/',
        columns: [
          'title', 'type_display', 'created_by', 'date_created', 'date_updated', 'org_name'
        ],
        columnsShow: {
          min: ['title'],
          default: ['title', 'type_display', 'created_by', 'date_created', 'date_updated', 'org_name']
        },
        columnsMeta: {
          actions: {
            prop: 'actions',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'TemplateCreate', query: { type: row.type, clone_from: row.id }})
              },
              onUpdate: ({ row }) => {
                vm.$router.push({ name: 'TemplateUpdate', params: { id: row.id }, query: { type: row.type }})
              }
            }
          }
        }
      },
      headerActions: {
        hasSearch: false,
        hasCreate: false,
        hasExport: false,
        hasImport: false,
        hasBulkDelete: false,
        createRoute: 'TemplateCreate',
        moreCreates: {
          callback: (item) => {
            vm.$router.push({ name: 'TemplateCreate', query: { type: item.name.toLowerCase() }})
          },
          dropdown: [
            {
              name: 'apply_asset',
              title: this.$t('tickets.RequestAssetPerm')
            },
            {
              name: 'apply_application',
              title: this.$t('tickets.RequestApplicationPerm')
            }
          ]
        }
      }
    }
  }
}
</script>

<style>

</style>
