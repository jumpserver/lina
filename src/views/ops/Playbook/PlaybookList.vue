<template>
  <div>
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
    <UploadDialog :visible.sync="uploadDialogVisible" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter } from '@/components/TableFormatters'
import UploadDialog from '@/views/ops/Playbook/UploadDialog'

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
        columns: [
          'name', 'path', 'date_updated', 'date_created', 'actions'
        ],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              route: 'AdhocDetail'
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: true,
              canUpdate: true,
              updateRoute: 'AdhocUpdate',
              hasDelete: true,
              canDelete: true,
              hasClone: false,
              extraActions: [
                {
                  title: '执行',
                  name: 'run',
                  type: 'running',
                  can: true,
                  callback: ({ row }) => {
                    this.$router.push({ name: 'JobCreate', query: { type: 'adhoc', id: row.id }})
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        canCreate: true,
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        onCreate: () => {
          this.uploadDialogVisible = true
        }
      }
    }
  }
}
</script>

<style>

</style>
