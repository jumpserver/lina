<template>
  <div>
    <GenericListTable ref="list" :table-config="tableConfig" :header-actions="headerActions" />
    <UploadDialog v-if="uploadDialogVisible" :visible.sync="uploadDialogVisible" @completed="refreshTable" />
    <CreatePlaybookDialog v-if="createDialogVisible" :visible.sync="createDialogVisible" @completed="refreshTable" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import UploadDialog from '@/views/ops/Template/Playbook/UploadDialog'
import { ActionsFormatter } from '@/components/TableFormatters'
import CreatePlaybookDialog from '@/views/ops/Template/Playbook/CreatePlaybookDialog.vue'

export default {
  components: {
    UploadDialog,
    GenericListTable,
    CreatePlaybookDialog
  },
  data() {
    return {
      createDialogVisible: false,
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
              canUpdate: this.$hasPerm('ops.change_playbook'),
              updateRoute: 'PlaybookUpdate',
              hasDelete: true,
              canDelete: this.$hasPerm('ops.delete_playbook'),
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
        },
        moreCreates: {
          callback: (item) => {
            switch (item.name) {
              case 'create':
                this.createDialogVisible = true
                break
              case 'upload':
                this.uploadDialogVisible = true
                break
            }
          },
          dropdown: [
            {
              name: 'create',
              title: this.$t('common.Create') + ' playbook',
              has: true
            },
            {
              name: 'upload',
              title: this.$t('common.Upload') + ' playbook',
              has: true
            }
          ]
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
