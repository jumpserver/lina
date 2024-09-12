<template>
  <TabPage
    v-if="!loading"
    :active-menu.sync="activeMenu"
    :submenu="tab.submenu"
    @tab-click="changeMoreCreates"
  >
    <keep-alive>
      <AccountListTable ref="table" v-bind="tableConfig" />
    </keep-alive>
  </TabPage>
</template>

<script>
import AccountListTable from '@/components/Apps/AccountListTable/AccountList.vue'
import { TabPage } from '@/layout/components'

export default {
  name: 'AssetAccountList',
  components: {
    TabPage,
    AccountListTable
  },
  data() {
    return {
      isInit: true,
      clickedRow: null,
      iShowTree: true,
      loading: true,
      activeMenu: 'host',
      tab: {
        submenu: [
          {
            name: 'all',
            title: this.$t('All'),
            icon: 'fa-bars'
          }
        ]
      },
      tableConfig: {
        url: '/api/v1/accounts/accounts/',
        hasLeftActions: true,
        hasImport: true
      }
    }
  },
  watch: {
    activeMenu(val) {
      let url = '/api/v1/accounts/accounts/'
      if (val !== 'all') {
        url += '?category=' + val
      }
      this.tableConfig.url = url
    }
  },
  async mounted() {
    try {
      await this.setCategoriesTab()
    } finally {
      this.loading = false
    }
  },
  methods: {
    changeMoreCreates() {
    },
    async setCategoriesTab() {
      const categoryIcon = {
        host: 'fa-inbox',
        device: 'fa-microchip',
        database: 'fa-database',
        cloud: 'fa-cloud',
        web: 'fa-globe',
        gpt: 'fa-comment',
        custom: 'fa-cube'
      }
      const state = await this.$store.dispatch('assets/getAssetCategories')
      for (const item of state.assetCategories) {
        this.tab.submenu.push({
          name: item.value,
          title: item.label,
          icon: categoryIcon[item.value]
        })
      }
    }
  }
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
</style>
