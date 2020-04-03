<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
// import DetailFormatter from '@/components/DataTable/formatters/DetailFormatter'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        axiosConfig: {
          raw: 1,
          params: {
            display: 1,
            is_finished: 0
          }
        },
        hasSelection: false,
        hasOperation: false,
        url: '/api/v1/terminal/commands/',
        columns: [
          {
            type: 'expand'
          },
          {
            prop: 'input',
            label: this.$t('sessions.command')
          },
          {
            prop: 'output',
            label: '命令输出结果 (怎么放到隐藏内容 ？？)',
            expand: true
          },
          {
            prop: 'risk_level',
            label: this.$t('sessions.RiskLevel')
          },
          {
            prop: 'user',
            label: this.$t('sessions.user'),
            sortable: true
          },
          {
            prop: 'asset',
            label: this.$t('sessions.asset')
          },
          {
            prop: 'system_user',
            label: this.$t('sessions.systemUser')
          },
          {
            prop: 'session',
            label: this.$t('sessions.session')
          },
          {
            prop: 'timestamp',
            label: this.$t('sessions.date')
          }
        ],
        tableActions: {
          hasEdit: false,
          hasDelete: false
        }
      },
      headerActions: {
        hasCreate: false,
        hasDelete: false,
        hasUpdate: false
      }
    }
  }
}
</script>

<style>

</style>
