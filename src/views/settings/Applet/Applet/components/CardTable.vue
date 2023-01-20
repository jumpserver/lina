<template>
  <div class="el-card-table">
    <TableAction
      :table-url="tableUrl"
      :search-table="search"
      :reload-table="reloadTable"
      v-bind="headerActions"
    />
    <div style="padding-top: 15px">
      <el-row :gutter="20">
        <el-col v-for="(d, index) in totalData" :key="index" :span="6">
          <el-card
            shadow="hover"
            :body-style="{ 'text-align': 'center', 'padding': '10px' }"
            class="my-card"
            @click.native="onView(d)"
          >
            <el-row :gutter="20">
              <el-col :span="8">
                <img :src="d.icon" class="image">
              </el-col>
              <el-col :span="16" style="text-align: left;">
                <span class="closeIcon">
                  <i class="el-icon-close" @click.stop="onDelete(d)" />
                </span>
                <div class="one-line">{{ d.display_name }}</div>
                <el-divider class="my-divider" />
                <Tooltip :content="d.comment" />
                <el-tag size="mini">{{ $tc('terminal.Author') }}: {{ d.author }}</el-tag>
              </el-col>
            </el-row>
            <el-divider class="my-divider" />
            <div style="text-align: left">
              <span>{{ $tc('common.DateCreated') }}: {{ convertData(d.date_created) }}</span>
              <el-tag
                size="mini"
                style="float: right"
                :type="d.is_active ? '': 'danger'"
              >
                {{ $tc('common.Active') }}: <span v-html="getIcon(d.is_active)" />
              </el-tag>
            </div>
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
import { Pagination, Tooltip } from '@/components'
import { toSafeLocalDateStr } from '@/utils/common'
const defaultFirstPage = 1

export default {
  name: 'CardTable',
  components: {
    TableAction,
    Pagination,
    Tooltip
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
      paginationSize: 8,
      paginationLayout: 'total, sizes, prev, pager, next',
      paginationSizes: [8, 12, 20, 36, 52, 120],
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
    getIcon(status) {
      let iconClass = 'fa-check-circle'
      if (status === false) {
        iconClass = 'fa-times-circle'
      }
      return `<i class="fa ${iconClass}" />`
    },
    convertData(data) {
      return toSafeLocalDateStr(data)
    },
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
  margin: 50% auto;
}

.one-line {
    width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
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

.my-card:hover .closeIcon {
  visibility: visible;
}

</style>
