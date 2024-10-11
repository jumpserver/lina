<template>
  <div>
    <div>
      <!-- Todo: 未来移动到通用 table 中 -->
      <div class="expanded-filter-zone">
        <div class="item-zone">
          <h5>过滤</h5>
          <div>
            <span class="item">全部账号</span>
            <span class="item">拥有的</span>
            <span class="item">收藏夹</span>
            <span class="item">最近访问</span>
          </div>
        </div>
        <div class="item-zone">
          <h5>风险账号</h5>
          <div>
            <span class="item">过期的密码</span>
            <span class="item">冲突的密码</span>
            <span class="item">违法策略</span>
            <span class="item">禁用的资源</span>
            <span class="item">回收站</span>
          </div>
        </div>
        <div class="item-zone">
          <h5>账号类型</h5>
          <div>
            <span class="item">全部</span>
            <span class="item">主机</span>
            <span class="item">数据库</span>
            <span class="item">网络设备</span>
            <span class="item">云服务</span>
            <span class="item">其他</span>
          </div>
        </div>
      </div>
      <div class="expand-zone">
        <div class="expand-bar">
          <i class="fa fa-angle-double-up" />
        </div>
      </div>
    </div>
    <AccountListTable ref="table" v-bind="tableConfig" />
  </div>
</template>

<script>
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'

export default {
  name: 'AssetAccountList',
  components: {
    AccountListTable
  },
  data() {
    return {
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true,
        hasImport: true
      }
    }
  },
  async mounted() {
  },
  methods: {}
}
</script>

<style lang="scss" scoped>
  .asset-table ::v-deep .row-clicked, .asset-user-table ::v-deep .row-background-color {
    background-color: #f5f7fa;
  }

  .asset-table {
    &:hover {
      cursor: pointer;
    }

    & ::v-deep .table-content {
      margin-left: 21px;
    }

    & ::v-deep .el-table__row {
      height: 40px;

      & > td {
        padding: 0;
      }
    }
  }

  .noDataR {
    width: 100%;
    height: 40vh;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-direction: column;

    .hintWrap {
      color: #D4D6E6;
      display: flex;
      align-items: flex-start;
      justify-content: center;
      flex-direction: column;
    }
  }

  .asset-user-table {
    padding-left: 20px;
  }

  .expand-bar {
    text-align: center;

    i {
      cursor: pointer;
      //transform: rotateY(90deg);
    }
  }

  .expanded-filter-zone {
    display: flex;

    h5 {
      font-weight: 600;
      text-transform: uppercase;
      font-size: 12px;
      margin-bottom: .5rem;
      line-height: 1.2;
      display: inline-block;
    }

    .item-zone {
      margin-right: 30px;
      margin-bottom: 5px;
    }

    .item {
      display: inline-block;
      margin-right: 10px;
      border-radius: 5px;
      background-color: #f5f7fa;
      color: #303133;
      font-size: 12px;
      cursor: pointer;

      &:hover {
        color: var(--color-primary);
      }
    }

    ul {
      list-style: none outside none;
      margin-block-start: 0;
      padding-left: 0;
    }
  }
</style>
