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
    return {
      tableConfig: {
        url: '/api/v1/applications/applications/?category=cloud',
        columns: [
          'name', 'type', 'attrs.cluster', 'comment', 'actions'
        ],
        columnsMeta: {
          'attrs.cluster': {
            label: this.$t('applications.cluster')
          },
          comment: {
            width: '340px'
          },
          type: {
            width: '140px'
          },
          actions: {
            prop: '',
            formatterArgs: {
              hasClone: true,
              performDelete: function({ row, col, cellValue, reload }) {
                this.$axios.delete(
                  `/api/v1/applications/applications/${row.id}/`
                ).then(res => {
                  this.$refs.GenericListTable.$refs.ListTable.reloadTable()
                  // this.$message.success(this.$t('common.deleteSuccessMsg'))
                }).catch(error => {
                  this.$message.error(this.$t('common.deleteErrorMsg' + ' ' + error))
                })
              }.bind(this)
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasExport: false,
        hasImport: false,
        createRoute: 'KubernetesAppCreate'
      }
    }
  }
}
</script>

<style>

</style>
