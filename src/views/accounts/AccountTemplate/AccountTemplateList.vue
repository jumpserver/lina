<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
    <ViewSecret v-if="showViewSecretDialog" :visible.sync="showViewSecretDialog" :account="account" :url="secretUrl" />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/TableFormatters'
import ViewSecret from '@/components/AccountListTable/ViewSecret'

export default {
  name: 'AccountBackupPlanList',
  components: {
    GenericListPage,
    ViewSecret
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      account: {},
      secretUrl: '',
      tableConfig: {
        url: '/api/v1/assets/account-templates/',
        columns: ['name', 'username', 'privileged', 'actions'],
        columnsShow: {
          min: ['name', 'actions']
        },
        columnsMeta: {
          privileged: {
            width: '100px'
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: false, // can set function(row, value)
              hasDelete: false, // can set function(row, value)
              hasClone: this.hasClone,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  can: this.$hasPerm('assets.view_accounttemplatesecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.secretUrl = `/api/v1/assets/account-template-secrets/${row.id}/`
                    vm.account = row
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
                    })
                  }
                },
                {
                  name: 'Delete',
                  title: this.$t('common.Delete'),
                  can: this.$hasPerm('assets.delete_account'),
                  type: 'primary',
                  callback: ({ row }) => {
                    this.$axios.delete(`/api/v1/assets/account-templates/${row.id}/`).then(() => {
                      this.$message.success(this.$tc('common.deleteSuccessMsg'))
                      this.$refs.ListTable.reloadTable()
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        hasMoreActions: false,
        createRoute: () => {
          return {
            name: 'AccountTemplateCreate'
          }
        }
      }
    }
  }
}
</script>

<style scoped>

</style>
