<template>
  <GenericListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
  <SecretDialog
    ref="secretDialog"
    :title="$t('ApplicationSecret')"
    :warning-text="$t('ApplicationSecretWarning')"
    mask-secret
  />
  <ApplicationEventSendDialog
    v-if="eventApplications.length"
    v-model:visible="eventDialogVisible"
    :applications="eventApplications"
  />
</template>

<script lang="jsx">
import CopyableFormatter from '@/components/Table/TableFormatters/CopyableFormatter.vue'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import SecretDialog from '@/components/Dialog/Secret.vue'
import { GenericListTable } from '@/layout/components'
import { copy } from '@/utils/common/index'
import ApplicationEventSendDialog from './components/ApplicationEventSendDialog.vue'
export default {
  name: 'IntegrationApplicationList',
  components: {
    GenericListTable,
    SecretDialog,
    ApplicationEventSendDialog
  },
  data() {
    const vm = this
    return {
      eventApplications: [],
      eventDialogVisible: false,
      createDrawer: () => import('@/views/accounts/Integration/ApplicationCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/Integration/ApplicationDetail/index.vue'),
      drawerTitle: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      tableConfig: {
        url: '/api/v1/accounts/integration-applications/',
        columnsExclude: ['accounts'],
        columnsMeta: {
          id: {
            width: '300px',
            formatter: CopyableFormatter
          },
          logo: {
            width: '80px',
            formatter: (row) => {
              return (
                <img
                  src={row.logo?.replace(/^http:/, location.protocol)}
                  alt={row.name}
                  style="width: 28px; height: 28px; border-radius: 50%;"
                />
              )
            }
          },
          accounts_amount: {
            width: '100px',
            formatter: (row) => {
              return row.accounts_amount
            }
          },
          name: {
            formatterArgs: {
              getRoute: ({ row }) => ({
                name: 'IntegrationApplicationDetail',
                params: {
                  id: row.id
                }
              }),
              drawer: true
            },
            formatter: DetailFormatter
          },
          secret: {
            label: vm.$t('ApplicationSecret'),
            formatter: CopyableFormatter,
            formatterArgs: {
              shadow: true,
              getText: async function ({ row }) {
                const app = await vm.$axios.get(
                  `/api/v1/accounts/integration-applications/${row.id}/secret/`
                )
                return app.secret
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              hasClone: false,
              extraActions: [
                {
                  name: 'copy-account-info',
                  title: vm.$t('CopyApplicationAccountInfo'),
                  icon: 'fa-regular fa-copy',
                  has: vm.$hasPerm('accounts.change_integrationapplication'),
                  callback: async ({ row }) => {
                    const app = await vm.$axios.get(
                      `/api/v1/accounts/integration-applications/${row.id}/secret/`
                    )
                    await copy(
                      JSON.stringify(
                        {
                          endpoint: app.endpoint,
                          app_id: app.id,
                          app_secret: app.secret,
                          org_id: app.org_id
                        },
                        null,
                        2
                      )
                    )
                  }
                },
                {
                  name: 'reset-secret',
                  title: vm.$t('ResetApplicationSecret'),
                  can: vm.$hasPerm('accounts.change_integrationapplication'),
                  type: 'danger',
                  callback: async ({ row }) => {
                    await vm.$confirm(vm.$t('ResetApplicationSecretConfirm'), vm.$t('Warning'), {
                      confirmButtonText: vm.$t('Confirm'),
                      type: 'warning'
                    })
                    const app = await vm.$axios.post(
                      `/api/v1/accounts/integration-applications/${row.id}/reset-secret/`
                    )
                    vm.$refs.secretDialog.show(app)
                    vm.$message.success(vm.$t('ResetApplicationSecretSuccess'))
                  }
                }
              ]
            }
          }
        },
        columnsExtra: ['secret'],
        columnsShow: {
          default: ['logo', 'name', 'id', 'secret', 'accounts_amount', 'date_last_used', 'active']
        },
        permissions: {
          app: 'accounts',
          resource: 'integrationapplication'
        }
      },
      headerActions: {
        hasImport: false,
        extraMoreActions: [
          {
            name: 'send-event',
            title: vm.$t('SendApplicationEvent'),
            icon: 'fa-solid fa-paper-plane',
            has: vm.$hasPerm('accounts.change_integrationapplication'),
            can: ({ selectedRows }) =>
              selectedRows.length > 0 && selectedRows.every((row) => row.is_active),
            callback: ({ selectedRows }) => {
              vm.eventApplications = selectedRows.map((row) => ({ ...row }))
              vm.eventDialogVisible = true
            }
          }
        ],
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
:deep(.el-table__body .copyable) {
  display: inline-flex;
  width: auto;
  max-width: 100%;
}
</style>
