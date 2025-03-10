<template>
  <GenericListTable ref="listTable" :header-actions="headerActions" :table-config="tableConfig" />
</template>

<script>
import { DetailFormatter } from '@/components/Table/TableFormatters'
import { GenericListTable } from '@/layout/components'
import RiskSummaryFormatter from './RiskSummaryFormatter.vue'

export default {
  name: 'AccountPushList',
  components: {
    GenericListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/account-risks/assets/',
        columns: [
          'name', 'address', 'platform', 'risk_total', 'risk_summary'
        ],
        columnsShow: {
          min: ['name', 'actions'],
          default: [
            'name', 'address', 'platform', 'risk_total',
            'risk_summary', 'actions'
          ]
        },
        columnsMeta: {
          name: {
            formatter: DetailFormatter,
            formatterArgs: {
              route: 'AccountCheckDetail'
            }
          },
          risk_summary: {
            formatter: RiskSummaryFormatter
          },
          risk_total: {
            width: '80px'
          },
          platform: {
            width: '80px'
          },
          address: {
            width: '160px'
          },
          actions: {
            formatterArgs: {
              hasUpdate: false,
              hasDelete: false,
              hasClone: false,
              extraActions: [
                {
                  title: this.$t('View'),
                  type: 'primary',
                  action: function() {
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
        hasImport: false
      }
    }
  }
}
</script>
