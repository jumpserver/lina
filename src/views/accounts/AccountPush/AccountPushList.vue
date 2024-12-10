<template>
  <div>
    <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />

    <Drawer v-if="showTableUpdateDrawer" :title="drawerTitle" @close-drawer="showTableUpdateDrawer = !showTableUpdateDrawer">
      <component :is="currentTemplate" />
    </Drawer>
  </div>
</template>

<script>
import { ActionsFormatter, DetailFormatter } from '@/components/Table/TableFormatters'
import { openTaskPage } from '@/utils/jms'
import { GenericListTable } from '@/layout/components'
import Drawer from '@/components/Drawer/index.vue'

export default {
  name: 'AccountPushList',
  components: {
    Drawer,
    GenericListTable,
    AccountPushUpdate: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue'),
    AccountPushCreate: () => import('@/views/accounts/AccountPush/AccountPushCreateUpdate.vue')
  },
  data() {
    const vm = this
    return {
      drawerTitle: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      tableConfig: {
        url: '/api/v1/accounts/push-account-automations/',
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
              isPam: true,
              getRoute: ({ row }) => ({
                name: 'AccountPushDetail',
                params: { id: row.id },
                query: { type: 'pam' }
              })
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
          username: {
            showOverflowTooltip: true,
            formatter: ({ username }) => {
              if (username === '@USER') {
                return this.$t('DynamicUsername')
              } else {
                return username
              }
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
            formatter: DetailFormatter,
            formatterArgs: {
              can: vm.$hasPerm('accounts.view_pushaccountexecution'),
              getRoute({ row }) {
                return {
                  name: 'AccountPushList',
                  query: {
                    tab: 'AccountPushExecutionList',
                    automation_id: row.id
                  }
                }
              }
            }
          },
          actions: {
            formatter: ActionsFormatter,
            formatterArgs: {
              isPam: true,
              updateRoute: 'AccountPushUpdate',
              onUpdate: ({ row }) => {
                this.$route.params.id = row.id

                // 解决表单详情中的跳转
                this.$route.query.type = 'pam'

                this.currentTemplate = 'AccountPushUpdate'
                this.drawerTitle = this.$t('AccountPushUpdate')
                this.showTableUpdateDrawer = true
              },
              extraActions: [
                {
                  title: vm.$t('Execute'),
                  name: 'execute',
                  can: ({ row }) => {
                    return row.is_active && vm.$hasPerm('accounts.add_pushaccountexecution')
                  },
                  type: 'info',
                  callback: function({ row }) {
                    this.$axios.post(
                      `/api/v1/accounts/push-account-executions/`,
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
      helpMsg: this.$t('WebHelpMessage'),
      headerActions: {
        hasRefresh: true,
        hasExport: false,
        hasImport: false,
        onCreate: () => {
          this.currentTemplate = 'AccountPushCreate'
          this.drawerTitle = this.$t('AccountPushCreate')
          this.showTableUpdateDrawer = true
        }
      }
    }
  }
}
</script>
