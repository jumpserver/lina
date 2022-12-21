<template>
  <div>
    <GenericListTable :table-config="tableConfig" :header-actions="headerActions" />
    <UploadDialog :visible.sync="uploadDialogVisible" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import { ActionsFormatter } from '@/components/TableFormatters'
import UploadDialog from '@/views/ops/ScriptManage/Playbook/UploadDialog'

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
          'name', 'comment', 'date_created', 'date_updated', 'creator', 'actions'
        ],
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
        hasMoreActions: true,
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
