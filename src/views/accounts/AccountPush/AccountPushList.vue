<template>
  <GenericListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :header-actions="headerActions"
    :table-config="tableConfig"
  />
</template>

<script lang="jsx">
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import { openTaskPage } from '@/utils/jms/index'
import { GenericListTable } from '@/layout/components'
import AutomationAssetAmountFormatter from '@/views/accounts/components/AutomationAssetAmountFormatter.vue'
export default {
  name: 'AccountPushList',
  components: {
    GenericListTable
  },
  data() {
    const vm = this
    return {
      createDrawer: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
      detailDrawer: () => import('@/views/accounts/AccountPush/Detail/index.vue'),
      tableConfig: {
        url: '/api/v1/accounts/push-account-automations/',
        columns: [
          'name',
          'accounts',
          'assets',
          'nodes',
          'secret_strategy',
          'is_periodic',
          'periodic_display',
          'executed_amount',
          'is_active',
          'actions'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name',
            'accounts',
            'assets',
            'nodes',
            'periodic_display',
            'executed_amount',
            'is_active',
            'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountPushDetail'
            }
          },
          accounts: {
            formatter: function (row) {
              return <span> {row.accounts.join(', ')} </span>
            }
          },
          assets: {
            formatter: AutomationAssetAmountFormatter,
            formatterArgs: {
              async: false,
              drawer: false,
              preventClick: true
            }
          },
          nodes: {
            formatter: AmountFormatter,
            formatterArgs: {
              async: false,
              drawer: false,
              preventClick: true
            }
          },
          secret_strategy: {
            formatter: function (row) {
              return <span> {row.secret_strategy.label} </span>
            }
          },
          assets_amount: {
            label: vm.$t('AssetsOfNumber')
          },
          nodes_amount: {
            label: vm.$t('NodeOfNumber')
          },
          password_strategy_display: {
            label: vm.$t('PasswordStrategy'),
            showOverflowTooltip: true
          },
          executed_amount: {
            formatter: (row) => {
              const can = vm.$hasPerm('accounts.view_pushaccountexecution')
              return (
                <el-link onClick={() => this.handleExecAmount(row)} disabled={!can}>
                  {row.executed_amount}
                </el-link>
              )
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              updateRoute: 'AccountPushUpdate',
              cloneRoute: 'AccountPushCreate',
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  order: 1,
                  type: 'primary',
                  can: ({ row }) => {
                    return row.is_active && vm.$hasPerm('accounts.add_pushaccountexecution')
                  },
                  callback: function ({ row }) {
                    this.$axios
                      .post(`/api/v1/accounts/push-account-executions/`, {
                        automation: row.id,
                        type: row.type.value
                      })
                      .then((res) => {
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
        createRoute: 'AccountPushCreate',
        extraMoreActions: [
          {
            name: 'BatchDisable',
            title: this.$t('DisableSelected'),
            icon: 'fa fa-ban',
            can: ({ selectedRows }) =>
              selectedRows.length > 0 && this.$hasPerm('accounts.change_pushaccountautomation'),
            callback: ({ selectedRows, reloadTable }) =>
              this.bulkDisableCallback(selectedRows, reloadTable)
          },
          {
            name: 'BatchActivate',
            title: this.$t('ActivateSelected'),
            icon: 'fa fa-check-circle-o',
            can: ({ selectedRows }) =>
              selectedRows.length > 0 && this.$hasPerm('accounts.change_pushaccountautomation'),
            callback: ({ selectedRows, reloadTable }) =>
              this.bulkActivateCallback(selectedRows, reloadTable)
          }
        ]
      }
    }
  },
  methods: {
    handleExecAmount(row) {
      this.$router.push({
        name: 'AccountPushList',
        query: {
          tab: 'AccountPushExecutionList',
          automation_id: row.id
        }
      })
    },
    bulkDisableCallback(selectedRows, reloadTable) {
      const url = '/api/v1/accounts/push-account-automations/'
      const data = selectedRows.map((row) => {
        return {
          id: row.id,
          is_active: false
        }
      })
      if (data.length === 0) return
      this.$axios
        .patch(url, data)
        .then(() => {
          reloadTable()
          this.$message.success(this.$t('DisableSuccessMsg'))
        })
        .catch((error) => {
          this.$message.error(this.$t('UpdateErrorMsg') + ' ' + error)
        })
    },
    bulkActivateCallback(selectedRows, reloadTable) {
      const url = '/api/v1/accounts/push-account-automations/'
      const data = selectedRows.map((row) => {
        return {
          id: row.id,
          is_active: true
        }
      })
      if (data.length === 0) return
      this.$axios
        .patch(url, data)
        .then(() => {
          reloadTable()
          this.$message.success(this.$t('DisableSuccessMsg'))
        })
        .catch((error) => {
          this.$message.error(this.$t('UpdateErrorMsg') + ' ' + error)
        })
    }
  }
}
</script>
