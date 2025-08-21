<template>
  <div>
    <ListTable
      :create-drawer="createDrawer"
      :detail-drawer="detailDrawer"
      :header-actions="headerActions"
      :table-config="tableConfig"
      :resource="$t('AccountTemplate')"
    />
    <ViewSecret
      v-if="showViewSecretDialog"
      :account="account"
      :show-password-record="false"
      :url="secretUrl"
      :visible.sync="showViewSecretDialog"
      type="template"
    />
  </div>
</template>

<script>
import { ActionsFormatter } from '@/components/Table/TableFormatters'
import ViewSecret from '@/components/Apps/AccountListTable/ViewSecret'
// import { DrawerListTable as ListTable } from '@/components'
import ListTable from '@/components/Table/DrawerListTable'
import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  name: 'AccountTemplateTable',
  components: {
    ListTable,
    ViewSecret
  },
  data() {
    const vm = this
    return {
      showViewSecretDialog: false,
      createDrawer: () => import('@/views/accounts/AccountTemplate/AccountTemplateCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/AccountTemplate/Detail/index.vue'),
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
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              getTitle: ({ row }) => {
                return row.name
              },
              getRoute: ({ row }) => {
                return {
                  name: 'AccountTemplateDetail',
                  params: { id: row.id }
                }
              }
            }
          },
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
        hasImport: this.$hasPerm('accounts.add_accounttemplate') || this.$hasPerm('accounts.change_accounttemplate'),
        importOptions: {
          canImportCreate: this.$hasPerm('accounts.add_accounttemplate'),
          canImportUpdate: this.$hasPerm('accounts.change_accounttemplate')
        },
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
