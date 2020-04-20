<template>
  <GenericListPage :table-config="tableConfig" :header-actions="headerActions" :help-message="notice" />
</template>

<script>
import { GenericListPage } from '@/layout/components'
import { DetailFormatter, ActionsFormatter } from '@/components/ListTable/formatters/index'

export default {
  components: {
    GenericListPage
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/assets/domains/',
        columns: [
          {
            prop: 'name',
            label: this.$t('assets.name'),
            formatter: DetailFormatter,
            sortable: true,
            route: 'DomainDetail'
          },
          {
            prop: 'asset_count',
            label: this.$t('assets.asset')
          },
          {
            prop: 'gateway_count',
            label: this.$t('assets.gateway'),
            formatter: DetailFormatter,
            route: 'GatewayList'
          },
          {
            prop: 'comment',
            label: this.$t('assets.comment'),
            sortable: 'custom'
          },
          {
            prop: 'id',
            label: this.$tc('Action'),
            align: 'center',
            formatter: ActionsFormatter,
            width: '200px',
            actions: {
              performDelete: ({ row, col }) => {
                const id = row.id
                const url = `/api/v1/assets/domains/${id}/`
                return this.$axios.delete(url)
              }
            }
          }
        ]
      },
      headerActions: {
        hasRightActions: false,
        hasExport: false,
        hasImport: false,
        hasRefresh: false,
        hasBulkDelete: false,
        hasSearch: false,
        createRoute: 'DomainCreate'
      },
      notice: this.$t('网域功能是为了解决部分环境（如：混合云）无法直接连接而新增的功能，原理是通过网关服务器进行跳转登录。JMS => 网域网关 => 目标资产')
    }
  }
}
</script>

<style>

</style>
