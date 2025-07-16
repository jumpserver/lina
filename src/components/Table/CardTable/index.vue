<template>
  <div class="el-card-table">
    <TableAction
      :reload-table="reloadTable"
      :search-table="search"
      :table-url="tableUrl"
      v-bind="headerActions"
    />
    <el-row v-loading="loading" class="the-row">
      <IBox v-if="totalData.length === 0" class="empty-box">
        <el-empty :description="$t('NoData')" :image-size="200" class="no-data" style="padding: 20px" />
      </IBox>
      <div class="card-container">
        <el-card
          v-for="(d, index) in totalData"
          :key="index"
          :class="{'is-disabled': isDisabled(d)}"
          class="the-card"
          shadow="hover"
        >
          <keep-alive>
            <slot :index="index" :item="d" :onView="onView">
              <Panel :d="d" @click.native="onView(d)" />
            </slot>
          </keep-alive>
        </el-card>
      </div>
    </el-row>
    <Pagination
      v-show="pagination && total > paginationSize"
      ref="pagination"
      class="pagination"
      v-bind="$data"
      @currentSizeChange="handleCurrentChange"
      @sizeChange="handleSizeChange"
    />
    <Drawer
      v-if="detailDrawer"
      :component="detailDrawer"
      :title="detailTitle"
      :visible.sync="detailDrawerVisible"
    />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import { Pagination } from '@/components'
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
      paginationSize: 6,
      paginationLayout: 'total, sizes, prev, pager, next',
      paginationSizes: [6, 18, 27],
      loading: true,
      axiosConfig: {
        raw: 1,
        params: {
          display: 1,
          draw: 1
        }
      },
      detailDrawerVisible: false,
      detailTitle: ''
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
      return this.$refs.pagination.getPageQuery(currentPage, pageSize)
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
      const queryString = Object.keys(query).map(key => key + '=' + query[key]).join('&')
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
      this.$axios.delete(`${this.tableConfig.url}${obj.id}/`)
    },
    async onView(obj) {
      if (this.isDisabled(obj)) {
        return
      }
      if (this.detailDrawer) {
        await this.$store.dispatch('common/setDrawerActionMeta', {
          action: 'detail', row: obj, col: {}, id: obj.id
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
        beforeClose: async(action, instance, done) => {
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

  ::v-deep {
    .el-empty {
      margin: 0 auto;
    }
  }
}

.the-row {
  margin-top: 15px;
  max-width: 1600px;
  text-align: center;

  .card-container {
    display: flex;
    justify-content: left;
    flex-wrap: wrap;
  }

  .el-col, div {
    gap: 20px;

    .the-card {
      min-width: 330px;
      position: relative;
      margin-bottom: 20px;
      //height: 230px;
      //width: 380px;
      padding: 15px;

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

.el-col {
  //min-width: 330px; 设置完后，remote app 列表会有问题
}

.no-data {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 65vh;
  width: 100%;
}
</style>
