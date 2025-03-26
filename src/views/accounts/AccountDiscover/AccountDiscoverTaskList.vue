<template>
  <GenericListTable
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :resource="$tc('AccountDiscoverTask')"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountDiscoverTaskList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('@/views/accounts/AccountDiscover/AccountDiscoverTaskCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/AccountDiscover/TaskDetail/index.vue'),
      showViewSecretDialog: false,
      showTableUpdateDrawer: false,
      currentTemplate: null,
      drawerTitle: '',
      tableConfig: {
        name: 'AccountDiscoverTaskList',
        url: '/api/v1/accounts/gather-account-automations/',
        permissions: {
          app: 'accounts',
          resource: 'gatheraccountsautomation'
        },
        columns: [
          'name', 'nodes', 'assets', 'is_periodic',
          'periodic_display', 'executed_amount'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'nodes', 'assets', 'is_periodic',
            'periodic_display', 'executed_amount'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              getRoute: ({ row }) => ({
                name: 'AccountDiscoverTaskDetail',
                params: { id: row.id },
                query: { type: 'pam' }
              })
            }
          },
          nodes: {
            formatter: function(row, column, cellValue, index) {
              return cellValue.map(v => v['name']).join(', ')
            }
          },
          is_periodic: {
            formatterArgs: {
              showFalse: false
            },
            width: '150px'
          },
          periodic_display: {},
          executed_amount: {
            formatter: (row) => {
              const can = vm.$hasPerm('accounts.view_gatheraccountsexecution')
              return <el-link onClick={ () => this.handleExecAmount(row) } disabled={ !can }>{ row.executed_amount }</el-link>
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountDiscoverTaskUpdate',
              hasClone: false,
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  type: 'primary',
                  order: 1,
                  can: vm.$hasPerm('accounts.add_gatheraccountsexecution'),
                  callback: function(data) {
                    this.$axios.post(
                      `/api/v1/accounts/gather-account-executions/`,
                      {
                        automation: data.row.id,
                        type: data.row.type.value
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    }).catch(res => {
                    })
                  }
                }
              ]
            }
          }
        }
      },
      headerActions: {
        hasBulkDelete: false,
        hasImport: false,
        hasExport: false,
        hasMoreActions: false,
        createRoute: 'AccountDiscoverTaskCreate',
        searchConfig: {
          getUrlQuery: false
        }
      }
    }
  },
  methods: {
    handleExecAmount(row) {
      this.$router.push({
        name: 'AccountDiscoverList',
        query: {
          tab: 'AccountDiscoverTaskExecutionList',
          automation_id: row.id
        }
      })
    }
  }
}
</script>
