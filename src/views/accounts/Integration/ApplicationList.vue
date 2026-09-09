<template>
  <GenericListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
  <SecretDialog ref="secretDialog" :title="$t('ApplicationSecret')" :warning-text="''" />
</template>

<script lang="jsx">
import CopyableFormatter from '@/components/Table/TableFormatters/CopyableFormatter.vue'
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import SecretDialog from '@/components/Dialog/Secret.vue'
import { GenericListTable } from '@/layout/components'
export default {
  name: 'CloudAccountList',
  components: {
    GenericListTable,
    SecretDialog
  },
  data() {
    const vm = this
    return {
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
                  src={row.logo}
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
