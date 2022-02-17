<template>
  <el-card class="box-card">
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
        url: '/api/v1/audits/login-logs/my/?limit=5',
        columns: [
          'ip', 'datetime'
        ],
        columnsMeta: {
          ip: {
            label: this.$t('audits.LoginIP'),
            showOverflowTooltip: true
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
  box-shadow: 0 2px 4px 0 rgb(54 58 80 / 32%);
  margin-bottom: 20px;
  &:hover {
    box-shadow: 0 4px 5px 0 rgb(54 58 80 / 42%);
  }
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
