<template>
  <div>
    <GenericListTable ref="list" :header-actions="headerActions" :table-config="tableConfig" />
    <PlaybookCreateUpdate />
    <UploadDialog v-if="uploadDialogVisible" :visible.sync="uploadDialogVisible" @completed="refreshTable" />
  </div>
</template>

<script>
import GenericListTable from '@/layout/components/GenericListTable'
import PlaybookCreateUpdate from './Playbook/PlaybookCreateUpdate.vue'
import UploadDialog from '@/views/ops/Template/Playbook/UploadDialog'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    UploadDialog,
    GenericListTable,
    PlaybookCreateUpdate
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
        createRoute: 'PlaybookCreate',
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: true,
        moreCreates: {
          callback: (item) => {
            switch (item.name) {
              case 'create':
                this.$eventBus.$emit('showCreateUpdateDrawer', 'create', { url: this.tableConfig.url })
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
