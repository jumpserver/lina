<template>
  <div>
    <GenericListTable
      ref="list"
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :table-config="tableConfig"
    />
    <UploadDialog
      v-if="uploadDialogVisible"
      :visible.sync="uploadDialogVisible"
      @completed="refreshTable"
    />
  </div>
</template>

<script>
import GenericListTable from '@/components/Table/DrawerListTable'
import UploadDialog from '@/views/ops/Template/Playbook/UploadDialog'
import { ActionsFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    UploadDialog,
    GenericListTable
  },
  data() {
    const currentUserID = this.$store.state.users.profile.id
    return {
      createDrawer: () => import('@/views/ops/Template/Playbook/PlaybookCreateUpdate.vue'),
      detailDrawer: () => import('@/views/ops/Template/Playbook/PlaybookDetail/index.vue'),
      createDialogVisible: false,
      uploadDialogVisible: false,
      tableConfig: {
        url: '/api/v1/ops/playbooks/',
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'comment', 'scope', 'date_created', 'actions']
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
              canUpdate: ({ row }) => {
                return this.$hasPerm('ops.change_playbook') && row.creator === currentUserID
              },
              updateRoute: 'PlaybookUpdate',
              hasDelete: true,
              canDelete: ({ row }) => {
                return this.$hasPerm('ops.delete_playbook') && row.creator === currentUserID
              },
              hasClone: true
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
                this.handleCreate()
                break
              case 'upload':
                this.uploadDialogVisible = true
                break
            }
          },
          dropdown: [
            {
              name: 'create',
              title: this.$t('Create') + ' playbook',
              has: true
            },
            {
              name: 'upload',
              title: this.$t('Upload') + ' playbook',
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
    },
    handleCreate() {
      this.$refs.list.onCreate()
    }
  }
}
</script>

<style>

</style>
