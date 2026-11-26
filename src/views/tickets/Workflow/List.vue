<template>
  <GenericListPage
    activation-refresh="always"
    :table-config="tableConfig"
    :header-actions="headerActions"
  />
  <WorkflowReferences
    v-if="references"
    :workflow="references.workflow"
    :reason="references.reason"
    @close="references = null"
  />
</template>
<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { getErrorResponseMsg } from '@/utils/common'
import WorkflowReferences from './References.vue'
import { getTicketTypeLabel } from '../const'
export default {
  components: { GenericListPage, WorkflowReferences },
  data() {
    const defaultColumns = [
      'name',
      'type',
      'org_name',
      'active_version_number',
      'enabled',
      'date_updated'
    ]
    return {
      references: null,
      tableConfig: {
        url: '/api/v1/tickets/workflows/',
        permissions: { resource: 'workflow' },
        columns: [...defaultColumns, 'org_id'],
        columnsShow: { default: [...defaultColumns, 'actions'] },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: false,
              getTitle: ({ row }) => row.display_name || row.name,
              getRoute: ({ row }) => ({ name: 'WorkflowDetail', params: { id: row.id } })
            }
          },
          type: {
            formatter: (row) =>
              getTicketTypeLabel({ value: row.type, label: row.type_label }, this.$t)
          },
          active_version_number: { label: this.$t('WFVersion') },
          enabled: { label: this.$t('Enabled') },
          actions: {
            formatterArgs: {
              canDelete: ({ row }) =>
                this.$hasPerm('tickets.delete_workflow') &&
                (this.$store.getters.currentOrgIsRoot ||
                  row.org_id === this.$store.getters.currentOrg.id),
              onDelete: this.deleteWorkflow,
              extraActions: [
                {
                  name: 'references',
                  title: this.$t('WFReferences'),
                  callback: ({ row }) => {
                    this.references = { workflow: row }
                  }
                }
              ],
              canUpdate: ({ row }) =>
                this.$hasPerm('tickets.change_workflow') &&
                !this.$store.getters.currentOrgIsRoot &&
                row.type !== 'login_confirm',
              onUpdate: ({ row }) =>
                this.$router.push({ name: 'WorkflowDetail', params: { id: row.id } })
            }
          }
        }
      },
      headerActions: {
        hasCreate: true,
        canCreate: this.$hasPerm('tickets.add_workflow'),
        hasImport: false,
        hasBulkDelete: false,
        hasMoreActions: false,
        createRoute: { name: 'WorkflowCreate' },
        onCreate: () => this.$router.push({ name: 'WorkflowCreate' })
      }
    }
  },
  methods: {
    async deleteWorkflow({ row, reload }) {
      const name = row.display_name || row.name
      const confirmed = await this.$confirm(
        `${this.$t('DeleteWarningMsg')} "${name}"?`,
        this.$t('Confirm'),
        {
          type: 'warning',
          confirmButtonClass: 'el-button--danger'
        }
      ).then(
        () => true,
        () => false
      )
      if (!confirmed) return
      try {
        await this.$axios.delete(`/api/v1/tickets/workflows/${row.id}/`, {
          disableFlashErrorMsg: true
        })
      } catch (error) {
        if (error.response?.data?.code === 'referenced_by_others') {
          this.references = { workflow: row, reason: error.response.data.detail }
          return
        }
        await this.$alert(getErrorResponseMsg(error), this.$t('Info'), { type: 'error' }).catch(
          () => {}
        )
        return
      }
      reload()
      this.$message.success(this.$t('DeleteSuccessMsg'))
    }
  }
}
</script>
