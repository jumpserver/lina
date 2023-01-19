<template>
  <div class="el-card-table">
    <TableAction
      :table-url="tableUrl"
      :search-table="search"
      :reload-table="reloadTable"
      v-bind="headerActions"
    />
    <div style="padding-top: 15px">
      <el-row :gutter="40">
        <el-col v-for="(d, index) in totalData" :key="index" :span="4">
          <el-card
            shadow="hover"
            :body-style="{ 'text-align': 'center', 'padding': '10px' }"
            class="my-card"
            @click.native="onView(d)"
          >
            <span class="closeIcon">
              <i class="el-icon-close" @click.stop="onDelete(d)" />
            </span>
            <!--            <div style="padding-top: 15px">-->
            <!--              <el-button v-if="$hasPerm(tableConfig.deletePerm)" type="danger" size="mini" @click="onDelete(d)">{{ $tc('common.Delete') }}</el-button>-->
            <!--            </div>-->
            <div>
              <img :src="d.icon" class="image">
            </div>
            <div>{{ d.display_name }}</div>
            <div style="margin: 10px 0" />
            <el-tag size="mini">{{ d.author }}</el-tag>
            <el-divider class="my-divider" />
            <el-tooltip placement="top">
              <div slot="content">{{ d.comment_i18n }}</div>
              <div class="line-limit">{{ d.comment_i18n }}</div>
            </el-tooltip>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <Pagination
      ref="pagination"
      v-bind="$data"
      @sizeChange="handleSizeChange"
      @currentSizeChange="handleCurrentChange"
    />
  </div>
</template>

<script>
import TableAction from '@/components/ListTable/TableAction'
import { Pagination } from '@/components'
const defaultFirstPage = 1

export default {
  name: 'CardTable',
  components: {
    TableAction,
    Pagination
  },
  props: {
    // 定义 table 的配置
    tableConfig: {
      type: Object,
      default: () => ({})
    },
    headerActions: {
      type: Object,
      default: () => ({})
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
      paginationSizes: [12, 24, 36, 48, 60, 120],
      axiosConfig: {
        raw: 1,
        params: {
          display: 1,
          draw: 1
        }
      }
    }
  },
  computed: {
    tableUrl() {
      return this.tableConfig.url || ''
    }
  },
  watch: {},
  mounted() {
    this.getList()
  },
  methods: {
    getPageQuery(currentPage, pageSize) {
      return this.$refs.pagination.getPageQuery(currentPage, pageSize)
    },
    getList() {
      if (!this.tableUrl) {
        return
      }
      const pageQuery = this.getPageQuery(this.page, this.paginationSize)
      const query = Object.assign(this.extraQuery, pageQuery)
      const queryString = Object.keys(query).map(key => key + '=' + query[key]).join('&')
      const url = `${this.tableUrl}?${queryString}`

      this.$axios
        .get(url, this.axiosConfig)
        .then(({ data: resp }) => {
          this.total = resp?.count || 0
          this.totalData = resp?.results || []
        })
        .catch(err => {
          this.$log.error('Error occur: ', err)
          this.total = 0
        })
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
      console.log(detailRoute)
      this.$router.push(detailRoute)
    },
    defaultPerformDelete(obj) {
      this.$axios.delete(
        `${this.tableConfig.url}${obj.id}/`
      )
    },
    onView(obj) {
      const viewFunc = this.tableConfig.onView || this.defaultPerformView
      viewFunc(obj)
    },
    onDelete(obj) {
      const msg = `${this.$t('common.deleteWarningMsg')} "${obj.name}" ?`
      this.$confirm(msg, this.$t('common.Info'), {
        type: 'warning',
        confirmButtonClass: 'el-button--danger',
        beforeClose: async(action, instance, done) => {
          if (action !== 'confirm') return done()
          const deleteFunc = this.tableConfig.onDelete || this.defaultPerformDelete
          await deleteFunc(obj)
          done()
          this.reloadTable()
          this.$message.success(this.$tc('common.deleteSuccessMsg'))
        }
      }).catch(() => {
        /* 取消*/
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.my-card {
  margin: 0 0 20px 0;
}

.my-divider {
  margin: 10px 0
}

.image {
  width: 60px;
  height: 60px;
  display: block;
  margin: 0 auto;
}

.line-limit {
  line-height: 14px;
  height: 34px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.closeIcon {
  text-align: right;
  display: block;
  visibility: hidden;
  i {
    font-size: 20px;
    cursor: pointer;
  }
}

.my-card:hover .closeIcon {
  visibility: visible;
}

</style>
