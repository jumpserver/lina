<template>
  <div>
    <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
    <ViewSecret
      v-if="showViewSecretDialog"
      :visible.sync="showViewSecretDialog"
      :url="secretUrl"
      :account="account"
      :show-password-record="false"
    />
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
        url: '/api/v1/accounts/account-templates/',
        columns: null,
        columnsExclude: ['spec_info'],
        columnsShow: {
          min: ['name', 'actions'],
          default: ['name', 'username', 'secret_type', 'has_secret', 'privileged', 'actions']
        },
        columnsMeta: {
          privileged: {
            width: '120px',
            formatterArgs: {
              showText: false,
              showFalse: false
            }
          },
          secret_type: {
            width: '120px'
          },
          has_secret: {
            width: '120px',
            formatterArgs: {
              showFalse: false,
              showText: false
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasUpdate: true,
              hasDelete: true,
              hasClone: this.hasClone,
              moreActionsTitle: this.$t('common.More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('common.View'),
                  can: this.$hasPerm('accounts.view_accounttemplatesecret'),
                  type: 'primary',
                  callback: ({ row }) => {
                    vm.secretUrl = `/api/v1/accounts/account-template-secrets/${row.id}/`
                    vm.account = row
                    vm.showViewSecretDialog = false
                    setTimeout(() => {
                      vm.showViewSecretDialog = true
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
