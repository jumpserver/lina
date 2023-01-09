<template>
  <div>
    <GenericListTable ref="list" :table-config="tableConfig" :header-actions="headerActions" />
    <UploadDialog :visible.sync="uploadDialogVisible" @completed="refreshTable" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import UploadDialog from '@/views/ops/Template/Playbook/UploadDialog'
import { ActionsFormatter } from '@/components/TableFormatters'

export default {
  components: {
    UploadDialog,
    GenericListTable
  },
  data() {
    return {
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/ops/playbooks/',
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'comment', 'date_created', 'actions']
        },
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              route: 'PlaybookDetail'
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: true,
              canUpdate: true,
              updateRoute: 'PlaybookUpdate',
              hasDelete: true,
              canDelete: true,
              hasClone: false
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: true,
        onCreate: () => {
          this.uploadDialogVisible = true
        }
      }
    }
  },
  methods: {
    refreshTable() {
      this.$refs.list.$refs.ListTable.reloadTable()
    }
  }
}
</script>

<style>

</style>
