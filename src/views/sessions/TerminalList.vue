<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
    <Dialog
      :visible.sync="dialogSettings.visible"
      :destroy-on-close="true"
      :show-cancel="false"
      :title="$t('sessions.terminalUpdateStorage')"
      :show-confirm="false"
    >
      <GenericCreateUpdateForm v-bind="dialogSettings.iFormSetting" />
    </Dialog>
  </div>
</template>

<script>
import { GenericListPage, GenericCreateUpdateForm } from '@/layout/components'
import Dialog from '@/components/Dialog'
import Select2 from '@/components/Select2'
import { BooleanFormatter } from '@/components/ListTable/formatters'

export default {
  components: {
    GenericListPage,
    Dialog,
    GenericCreateUpdateForm
  },
  data() {
    return {
      dialogSettings: {
        selectedRows: [],
        visible: false,
        iFormSetting: {
          url: '/api/v1/terminal/terminals/',
          fields: [
            ['', ['command_storage', 'replay_storage']]
          ],
          fieldsMeta: {
            command_storage: {
              component: Select2,
              el: {
                ajax: {
                  url: `/api/v1/terminal/command-storages/`
                },
                multiple: false
              }
            },
            replay_storage: {
              component: Select2,
              el: {
                ajax: {
                  url: `/api/v1/terminal/replay-storages/`
                },
                multiple: false
              }
            }
          }
        }
      },
      tableConfig: {
        url: '/api/v1/terminal/terminals/',
        columns: ['name', 'remote_addr', 'session_online', 'is_active', 'is_alive', 'actions'],
        columnsMeta: {
          name: {
            sortable: 'custom'
          },
          remote_addr: {
            sortable: 'custom'
          },
          is_active: {
            label: this.$t('sessions.active'),
            formatter: BooleanFormatter,
            width: '80px',
            align: 'center'
          },
          is_alive: {
            label: this.$t('sessions.alive')
          },
          session_online: {
            label: this.$t('sessions.session')
          }
        }
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
        hasUpload: false,
        hasExport: false,
        hasImport: false,
        hasUpdate: false,
        extraActions: [
          {
            name: 'StorageConfiguration',
            title: this.$t('sessions.StorageConfiguration'),
            type: 'primary',
            has: true,
            can: true,
            callback: this.handleStorageConfiguration
          }
        ],
        extraMoreActions: [
          {
            name: 'updateSelected',
            title: this.$t('common.updateSelected'),
            can: ({ selectedRows }) => selectedRows.length > 0,
            callback: function({ selectedRows, reloadTable }) {
              this.dialogSettings.selectedRows = selectedRows
              this.dialogSettings.visible = true
            }.bind(this)
          }
        ]
      }
    }
  },
  methods: {
    handleStorageConfiguration() {
      this.$router.push('/terminal/storages')
    },
    onCancel() {
      this.dialogSettings.visible = false
    },
    onConfirm() {
      this.dialogSettings.visible = false
    }
  }
}
</script>

<style>

</style>
