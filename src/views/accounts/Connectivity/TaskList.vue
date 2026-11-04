<template>
  <DrawerListTable
    ref="listTable"
    :create-drawer="createDrawer"
    :detail-drawer="detailDrawer"
    :drawer-props="{ connectivityType: drawerType }"
    :header-actions="headerActions"
    :table-config="tableConfig"
    :resource="$t('ConnectivityTests')"
  />
</template>

<script>
import DrawerListTable from '@/components/Table/DrawerListTable/index.vue'
import { DetailFormatter } from '@/components/Table/TableFormatters'
import AmountFormatter from '@/components/Table/TableFormatters/AmountFormatter.vue'
import { openTaskPage } from '@/utils/jms'
import { getConnectivityConfig, getConnectivityConfigForRow } from './config'

export default {
  name: 'ConnectivityTaskList',
  components: { DrawerListTable },
  data() {
    const configForRow = getConnectivityConfigForRow
    const countMeta = {
      formatter: AmountFormatter,
      formatterArgs: { async: true, drawer: false, preventClick: true }
    }
    return {
      drawerType: '',
      createDrawer: () => import('./CreateUpdate.vue'),
      detailDrawer: () => import('./Detail.vue'),
      tableConfig: {
        name: 'ConnectivityTasks',
        url: '/api/v1/accounts/connectivity-automations/',
        columns: [
          'name',
          'type',
          'assets_amount',
          'nodes_amount',
          'periodic_display',
          'last_execution_date',
          'executed_amount',
          'is_active',
          'actions'
        ],
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              can: ({ row }) => this.$hasPerm(configForRow(row).viewPermission),
              getRoute: ({ row }) => ({
                name: configForRow(row).detailRoute,
                params: { id: row.id }
              }),
              beforeClick: ({ row }) => {
                this.drawerType = configForRow(row).type
              }
            }
          },
          type: {
            label: this.$t('Type'),
            formatter: (row) => this.$t(configForRow(row).type === 'account' ? 'Account' : 'Asset')
          },
          assets_amount: { ...countMeta, label: this.$t('AssetsOfNumber') },
          nodes_amount: { ...countMeta, label: this.$t('NodeOfNumber') },
          executed_amount: {
            formatter: DetailFormatter,
            formatterArgs: {
              drawer: false,
              can: ({ row }) => this.$hasPerm(configForRow(row).viewExecutionPermission),
              getRoute: ({ row }) => ({
                name: 'ConnectivityList',
                query: { tab: configForRow(row).executionTab, automation_id: row.id }
              })
            }
          },
          actions: {
            formatterArgs: {
              hasClone: false,
              canUpdate: ({ row }) =>
                this.$hasPerm(configForRow(row).changePermission) &&
                !this.$store.getters.currentOrgIsRoot,
              canDelete: ({ row }) => this.$hasPerm(configForRow(row).deletePermission),
              onUpdate: (payload) => {
                const config = configForRow(payload.row)
                this.drawerType = config.type
                this.$refs.listTable.onUpdate({
                  ...payload,
                  route: { name: config.updateRoute, params: { id: payload.row.id } }
                })
              },
              performDelete: ({ row }) => this.$axios.delete(`${configForRow(row).url}${row.id}/`),
              extraActions: [
                {
                  name: 'execute',
                  title: this.$t('Execute'),
                  type: 'primary',
                  order: 1,
                  can: ({ row }) =>
                    row.is_active && this.$hasPerm(configForRow(row).executePermission),
                  callback: async ({ row }) => {
                    const data = await this.$axios.post(configForRow(row).executionUrl, {
                      automation: row.id
                    })
                    openTaskPage(data.task)
                  }
                }
              ]
            }
          }
        }
      }
    }
  },
  computed: {
    createTypes() {
      return ['asset', 'account']
        .map(getConnectivityConfig)
        .filter((config) => this.$hasPerm(config.addPermission))
    },
    headerActions() {
      return {
        canCreate: this.createTypes.length > 0 && !this.$store.getters.currentOrgIsRoot,
        onCreate: () => {
          if (!this.createTypes.length) return
          this.drawerType = this.createTypes[0].type
          this.$refs.listTable.onCreate()
        },
        hasBulkDelete: false,
        hasBulkUpdate: false,
        hasImport: false,
        hasExport: false,
        hasMoreActions: false,
        searchConfig: { getUrlQuery: false }
      }
    }
  }
}
</script>
