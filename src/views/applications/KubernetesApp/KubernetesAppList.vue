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
        url: '/api/v1/applications/applications/?category=cloud',
        columns: [
          'name', 'type_display', 'attrs.cluster',
          'created_by', 'date_created', 'date_updated', 'comment', 'org_name', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'type_display', 'attrs.cluster', 'comment', 'actions']
        },
        columnsMeta: {
          'attrs.cluster': {
            label: this.$t('applications.cluster')
          },
          comment: {
            width: '340px'
          },
          type_display: {
            label: this.$t('applications.type')
          },
          actions: {
            prop: 'actions',
            formatterArgs: {
              onClone: ({ row }) => {
                vm.$router.push({ name: 'KubernetesAppCreate', query: { type: row.type, clone_from: row.id }})
              },
              performDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/applications/applications/${row.id}/`
                ).then(res => {
                  this.$refs.GenericListTable.$refs.ListTable.$refs.ListTable.reloadTable()
                  // this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg') + ' ' + error)
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasExport: false,
        hasImport: false,
        hasBulkDelete: true,
        createRoute: 'KubernetesAppCreate',
        searchConfig: {
          exclude: ['category', 'type']
        }
      }
    }
  }
}
</script>

<style>

</style>
