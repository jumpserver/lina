<template>
  <div>
    <GenericListPage :header-actions="headerActions" :table-config="tableConfig" />
    <ViewSecret
      v-if="showViewSecretDialog"
      :account="account"
      :show-password-record="false"
      :url="secretUrl"
      type="template"
      :visible.sync="showViewSecretDialog"
    />
  </div>
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import ViewSecret from '@/components/Apps/AccountListTable/ViewSecret'

export default {
  name: 'AccountTemplateList',
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
        columnsExclude: ['spec_info', 'password_rules', 'push_params'],
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
          has_secret: {
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
              moreActionsTitle: this.$t('More'),
              extraActions: [
                {
                  name: 'View',
                  title: this.$t('View'),
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
        hasExport: this.$hasPerm('accounts.view_accounttemplatesecret'),
        hasMoreActions: false,
        hasLabelSearch: true,
        exportOptions: {
          url: '/api/v1/accounts/account-template-secrets/',
          mfaVerifyRequired: true,
          tips: this.$t('AccountExportTips')
        },
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
