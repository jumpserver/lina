<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage,
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/ops/tasks/',
        columns: [
          {
            prop: 'name',
            label: this.$tc('Name'),
            formatter: DetailFormatter,
            sortable: 'custom',
            route: 'UserDetail'
          },
          {
            prop: 'latest_execution',
            label: this.$t('jobcenter.RunTimes')
          },
          {
            prop: 'latest_execution.hosts_amount',
            label: this.$t('jobcenter.hosts')
          },
          {
            prop: 'latest_execution.is_success',
            label: this.$t('jobcenter.success')
          },
          {
            prop: 'latest_execution.date_start',
            label: this.$t('jobcenter.date'),
            sortable: 'custom'
          },
          {
            prop: 'latest_execution.timedelta',
            label: this.$t('jobcenter.time')
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            actions: [
            ]
          }
        ],
        hasEdit: false,
        hasDelete: false
      },
      headerActions: {
        hasCreate: false,
        hasBulkDelete: false,
      }
    }
  }
}
</script>

<style lang="less" scoped>

</style>
