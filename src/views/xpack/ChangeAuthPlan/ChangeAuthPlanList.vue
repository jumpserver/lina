<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'

export default {
  name: 'ChangeAuthPlan',
  components: {
    GenericListPage
  },
  data() {
    const vm = this
    return {
      tableConfig: {
        url: '/api/v1/xpack/change-auth-plan/plan/',
        columns: [
          'name', 'username', 'assets_amount', 'nodes_amount', 'password_strategy_display', 'periodic_display', 'run_times',
          'comment', 'actions'
        ],
        columnsMeta: {
          password_strategy_display: {
            width: '200px',
            showOverflowTooltip: true
          },
          assets_amount: {
            label: vm.$t('xpack.Asset')
          },
          nodes_amount: {
            label: vm.$t('xpack.Node')
          }
        }
      },
      headerActions: {

      }
    }
  }
}
</script>

<style scoped>

</style>
