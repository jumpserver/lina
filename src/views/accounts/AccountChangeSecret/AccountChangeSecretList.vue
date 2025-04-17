<template>
  <GenericListTable
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :resource="$tc('ChangeSecret')"
    :table-config="tableConfig"
  />
</template>

<script>
import { GenericListTable } from '@/layout/components'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'

export default {
  name: 'AccountChangeSecretList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('@/views/accounts/AccountChangeSecret/AccountChangeSecretCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/AccountChangeSecret/Detail/index.vue'),
      tableConfig: {
        url: '/api/v1/accounts/change-secret-automations/',
        columnsExclude: ['password_rules'],
        columns: [
          'name', 'accounts', 'secret_strategy', 'is_periodic',
          'periodic_display', 'executed_amount', 'is_active', 'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'accounts', 'periodic_display',
            'executed_amount', 'is_active', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountChangeSecretDetail'
            }
          },
          accounts: {
            formatter: function(row) {
              return <span> {row.accounts.join(', ')} </span>
            }
          },
          secret_strategy: {
            formatter: function(row) {
              return <span> {row.secret_strategy.label} </span>
            }
          },
          is_periodic: {
            formatterArgs: {
              showFalse: false
            },
            width: '180px'
          },
          executed_amount: {
            formatter: (row) => {
              const can = vm.$hasPerm('accounts.view_changesecretexecution')
              return <el-link onClick={ () => this.handleExecAmount(row) } disabled={ !can }>{ row.executed_amount }</el-link>
            }
          },
          actions: {
            formatterArgs: {
              updateRoute: 'AccountChangeSecretUpdate',
              cloneRoute: 'AccountChangeSecretCreate',
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  order: 1,
                  can: ({ row }) => {
                    return row.is_active && vm.$hasPerm('accounts.add_changesecretexecution')
                  },
                  type: 'primary',
                  disabled: ({ row }) => !row.is_active,
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/change-secret-executions/`,
                      {
                        automation: row.id,
                        type: row.type.value
                      }
                    ).then(res => {
                      openTaskPage(res['task'])
                    })
                  }.bind(this)
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
        createRoute: 'AccountChangeSecretCreate'
      }
    }
  },
  methods: {
    handleExecAmount(row) {
      this.$router.push({
        name: 'AccountChangeSecretList',
        query: {
          tab: 'AccountChangeSecretExecutionList',
          automation_id: row.id
        }
      })
    }
  }
}
</script>
