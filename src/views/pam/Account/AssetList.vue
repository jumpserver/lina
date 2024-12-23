<template>
  <div>
    <BaseList :table-config="tableConfig" v-bind="config" />
  </div>
</template>

<script>
import BaseList from '@/views/assets/Asset/AssetList/components/BaseList'

import { DetailFormatter } from '@/components/Table/TableFormatters'

export default {
  components: {
    BaseList
  },
  data() {
    return {
      drawerTitle: '',
      showTableUpdateDrawer: false,
      currentTemplate: null,
      config: {
        url: '/api/v1/assets/assets/',
        category: 'all'
      },
      tableConfig: {
        columnsExclude: ['date_verified'],
        columnsMeta: {
          name: {
            formatterArgs: {
              can: true,
              isPam: true,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.id },
                query: { type: 'pam' }
              })
            },
            formatter: DetailFormatter
          },
          accounts_amount: {
            formatterArgs: {
              can: true,
              isPam: true,
              getTitle: ({ row }) => row.accounts_amount,
              getRoute: ({ row }) => ({
                name: 'AssetDetail',
                params: { id: row.id },
                query: { type: 'pam', tab: 'Account' }
              })
            },
            formatter: DetailFormatter
          }
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
::v-deep .ibox {
  height: 100%;

  .el-card__body {
    height: 100%;
  }
}

::v-deep .page, .page.tab-page {
  .page-heading .el-row--flex {
    flex-wrap: wrap;

    .page-heading-left .el-button {
      display: none;
    }
  }
}
</style>
