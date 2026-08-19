<template>
  <div class="el-card-table">
    <TableAction
      v-bind="headerActions"
      :reload-table="reloadTable"
      :search-table="search"
      :table-url="tableUrl"
    />
    <div v-loading="loading">
      <el-row :class="{ 'is-empty': totalData.length === 0 }" class="the-row">
        <IBox v-if="totalData.length === 0" class="empty-box">
          <el-empty
            :description="$t('NoData')"
            :image-size="200"
            class="no-data"
            style="padding: 20px"
          />
        </IBox>
        <div class="card-container">
          <el-card
            v-for="(d, index) in totalData"
            :key="index"
            :class="{ 'is-disabled': isDisabled(d) }"
            class="the-card"
            shadow="hover"
          >
            <keep-alive>
              <slot :index="index" :item="d" :on-view="onView">
                <Panel :d="d" @click="onView(d)" />
              </slot>
            </keep-alive>
          </el-card>
        </div>
      </el-row>
    </div>
    <Pagination
      v-bind="$data"
      v-show="pagination && total > paginationSize"
      ref="pagination"
      class="pagination"
      @current-size-change="handleCurrentChange"
      @size-change="handleSizeChange"
    />
    <Drawer
      v-if="detailDrawer"
      v-model:visible="detailDrawerVisible"
      :component="detailDrawer"
      :title="detailTitle"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import Pagination from '@/components/Table/Pagination'
import TableAction from '@/components/Table/ListTable/TableAction'
import IBox from '@/components/Common/IBox/index.vue'
import Panel from './Panel'
import Drawer from '@/components/Drawer/index.vue'

const defaultFirstPage = 1

export default {
  name: 'CardTable',
  components: {
    Drawer,
    IBox,
    Panel,
    TableAction,
    Pagination
  },
  props: {
    // 定义 table 的配置
    columns: {
      type: Number,
      default: 3
    },
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
    },
    pagination: {
      type: Boolean,
      default: true
    },
    subComponent: {
      type: Object,
      default: () => null
    },
    subComponentProps: {
      type: Object,
      default: () => ({})
    },
    detailDrawer: {
      type: [String, Function],
      default: ''
    }
  },
  data() {
    return {
      total: 0,
      totalData: [],
      page: defaultFirstPage,
      extraQuery: {},
      paginationSize: 12,
      paginationLayout: 'total, sizes, prev, pager, next',
      paginationSizes: [12, 24, 36],
      loading: true,
      axiosConfig: {
        raw: 1,
        params: {
          display: 1,
          draw: 1
        }
      },
      detailDrawerVisible: false,
      detailTitle: '',
      skipNextActivate: true
    }
  },
  computed: {
    ...mapGetters(['hasValidLicense']),
    tableUrl() {
      return this.tableConfig.url || ''
    }
  },
  async mounted() {
    try {
      await this.getList()
    } finally {
      this.loading = false
    }
  },
  activated() {
    // First keep-alive insert also fires activated after mounted; skip that one.
    if (this.skipNextActivate) {
      this.skipNextActivate = false
      return
    }
    this.reloadTable()
  },
  methods: {
    isDisabled(item) {
      return item.edition?.value === 'enterprise' && !this.hasValidLicense
    },
    getIcon(status) {
      let iconClass = 'fa-check-circle'
      if (status === false) {
        iconClass = 'fa-times-circle'
      }
      return `<i class="fa ${iconClass}" />`
    },
    getPageQuery(currentPage, pageSize) {
      // TagSearch emits immediately during setup, before Pagination is mounted.
      if (this.$refs.pagination) {
        return this.$refs.pagination.getPageQuery(currentPage, pageSize)
      }
      return {
        limit: pageSize,
        offset: (currentPage - 1) * pageSize
      }
    },
    async getList() {
      if (this.tableConfig.totalData) {
        this.totalData = this.tableConfig.totalData
        this.total = this.totalData.length
        return
      }
      if (!this.tableUrl) {
        return
      }
      const pageQuery = this.getPageQuery(this.page, this.paginationSize)
      const query = Object.assign(this.extraQuery, pageQuery, this.tableConfig.extraQuery)
      const queryString = Object.keys(query)
        .map((key) => key + '=' + query[key])
        .join('&')
      const connector = this.tableUrl.indexOf('?') === -1 ? '?' : '&'
      const url = `${this.tableUrl}${connector}${queryString}`

      const resp = await this.$axios.get(url, this.axiosConfig)
      const data = resp.data
      this.total = data?.count || 0
      this.totalData = data?.results || []
    },
    reloadTable() {
      this.getList()
    },
    search(attrs) {
      this.extraQuery = attrs
      this.getList()
    },
    handleSizeChange(val) {
      this.page = defaultFirstPage
      this.paginationSize = val
      this.getList()
    },
    handleCurrentChange(val) {
      this.page = val
      this.getList()
    },
    defaultPerformView(obj) {
      const defaultRoute = this.$route.name.replace('List', 'Detail')
      const route = this.headerActions.detailRoute || defaultRoute
      let detailRoute = { replace: true }
      if (typeof route === 'string') {
        detailRoute.name = route
        detailRoute.params = { id: obj.id }
      } else {
        detailRoute = route
      }
      this.$router.push(detailRoute)
    },
    defaultPerformDelete(obj) {
      return this.$axios.delete(`${this.tableConfig.url}${obj.id}/`)
    },
    async onView(obj) {
      if (this.isDisabled(obj)) {
        return
      }
      if (this.detailDrawer) {
        await this.$store.dispatch('common/setDrawerActionMeta', {
          action: 'detail',
          row: obj,
          col: {},
          id: obj.id
        })
        this.detailTitle = `${this.$t('Detail')}: ${obj.name}`
        this.detailDrawerVisible = true
      } else {
        const viewFunc = this.tableConfig.onView || this.defaultPerformView
        await viewFunc(obj)
      }
    },
    onDelete(obj) {
      const msg = `${this.$t('DeleteWarningMsg')} "${obj.name}" ?`
      this.$confirm(msg, this.$tc('Info'), {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async (action, instance, done) => {
          if (action !== 'confirm') return done()
          const deleteFunc = this.tableConfig.onDelete || this.defaultPerformDelete
          await deleteFunc(obj)
          done()
          this.reloadTable()
          this.$message.success(this.$tc('DeleteSuccessMsg'))
        }
      }).catch(() => {
        /* 取消*/
      })
    }
  }
}
</script>
<style lang="scss" scoped>
.the-row .empty-box {
  display: block;
  // max-width controls the row; the empty card still needs an explicit flex size to fill it.
  flex: 0 0 100%;
  width: 100%;
  box-sizing: border-box;

  :deep(.el-empty) {
    margin: 0 auto;
  }

  :deep(.el-card__body) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

.the-row {
  margin-top: 15px;
  max-width: 1600px;
  text-align: center;

  // 空状态时不受卡片网格 1600px 上限约束,让 empty 卡片撑满整行宽度
  &.is-empty {
    max-width: none;
  }

  .card-container {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(auto-fill, minmax(330px, 1fr));
    gap: 20px;

    .el-card .el-card__body div {
      height: inherit;
    }

    .the-card {
      position: relative;
      height: 180px;
      padding: 20px;

      ::v-deep .el-card__body {
        height: 100%;
        width: 100%;
        padding: 0;
      }

      &.is-disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &:hover {
        .closeIcon {
          visibility: visible;
        }
      }

      .closeIcon {
        float: right;
        display: block;
        visibility: hidden;

        i {
          font-size: 20px;
          cursor: pointer;
        }
      }
    }
  }
}

.pagination {
  padding-top: 10px;
  border-top: 1px solid #e7eaec;
}

// .el-col {
//   min-width: 330px; 设置完后，remote app 列表会有问题
// }

.no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 65vh;
  width: 100%;
}
</style>
