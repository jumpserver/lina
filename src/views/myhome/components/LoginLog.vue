<template>
  <el-card class="box-card" shadow="never">
    <div slot="header" class="title">
      <span>{{ i18n.t('route.LoginLog') }}</span>
    </div>
    <ListTable
      class="ListTable"
      :table-config="tableConfig"
      :header-actions="headerActions"
    />
  </el-card>
</template>

<script>
import i18n from '@/i18n/i18n'
import ListTable from '@/components/ListTable/index'

export default {
  name: 'Log',
  components: {
    ListTable
  },
  props: {
    headerActions: {
      type: Object,
      default: () => {
        return {
          hasLeftActions: false,
          hasRightActions: false,
          hasSearch: false
        }
      }
    }
  },
  data() {
    return {
      i18n,
      cardConfig: {
        title: i18n.t('route.LoginLog'),
        icon: 'fa-history'
      },
      tableConfig: {
        url: '/api/v1/audits/my-login-logs/?limit=5',
        columns: [
          'city', 'datetime'
        ],
        columnsMeta: {
          city: {
            showOverflowTooltip: true,
            formatter: (row) => {
              return <span>{ row.city }({ row.ip })</span>
            }
          },
          datetime: {
            showOverflowTooltip: true
          }
        },
        hasSelection: false,
        paginationSize: 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.box-card {
  margin-bottom: 20px;

  &>>> .el-card__header {
    margin-bottom: -10px;
  }
  .title {
    font-weight: 500;
  }
}
.ListTable >>> .el-data-table .el-pagination {
  display: none;
}
</style>
