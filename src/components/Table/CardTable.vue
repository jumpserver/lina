<template>
  <div class="el-card-table">
    <TableAction
      :reload-table="reloadTable"
      :search-table="search"
      :table-url="tableUrl"
      v-bind="headerActions"
    />
    <div style="padding-top: 15px">
      <el-row :gutter="20">
        <el-col v-for="(d, index) in totalData" :key="index" :span="8">
          <el-card
            :body-style="{ 'text-align': 'center', 'padding': '20px' }"
            class="my-card"
            shadow="hover"
            @click.native="onView(d)"
          >
            <slot :index="index" :item="d">
              <span v-if="d.edition === 'enterprise'" class="enterprise">
                {{ $t('Enterprise') }}
              </span>
              <el-row :gutter="20">
                <el-col v-if="d.icon" :span="8" class="image">
                  <img
                    v-if="d.icon.startsWith('/') || d.icon.startsWith('data:')"
                    :alt="d.display_name"
                    :src="d.icon"
                  >
                  <Icon v-else :icon="d.icon" />
                </el-col>
                <el-col :span="16" class="text-zone">
                  <div class="one-line">
                    <b>{{ d.display_name }}</b>
                    <el-tag v-if="d.version" size="mini" style="margin-left: 5px">
                      {{ d.version }}
                    </el-tag>
                  </div>
                  <el-divider class="my-divider" />
                  <div class="comment">
                    {{ d.comment }}
                  </div>
                  <div class="tag-zone">
                    <el-tag v-for="tag of d.tags" :key="tag" size="mini">
                      {{ capitalize(tag) }}
                    </el-tag>
                  </div>
                </el-col>
              </el-row>
            </slot>
          </el-card>
        </el-col>
      </el-row>
    </div>
    <Pagination
      v-if="pagination"
      ref="pagination"
      v-bind="$data"
      @currentSizeChange="handleCurrentChange"
      @sizeChange="handleSizeChange"
    />
  </div>
</template>

<script>
import TableAction from '@/components/Table/ListTable/TableAction'
import { Pagination } from '@/components'
import Icon from '@/components/Widgets/Icon/index.vue'

const defaultFirstPage = 1

export default {
  name: 'CardTable',
  components: {
    TableAction,
    Pagination,
    Icon
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
    },
    pagination: {
      type: Boolean,
      default: true
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
  mounted() {
    this.getList()
  },
  methods: {
    capitalize(str) {
      return str.charAt(0).toUpperCase() + str.slice(1)
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
    getList() {
      if (this.tableConfig.totalData) {
        this.totalData = this.tableConfig.totalData
        this.total = this.totalData.length
        return
      }
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
.my-card {
  margin: 0 0 20px 0;
  position: relative;
}

.my-divider {
  margin: 10px 0
}

.image {
  img, span {
    width: 60px;
    height: 60px;
    display: block;
    margin: 50% auto;
  }
  span {
    font-size: 36px;
    color: black;
  }
}

.one-line {
  width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.comment {
  font-size: 12px;
  height: 50px;
  overflow: hidden;
  margin-bottom: 10px;
  padding-right: 5px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
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

.my-card:hover {
  cursor: pointer;
}

.my-card:hover .closeIcon {
  visibility: visible;
}

.enterprise {
  position: absolute;
  right: -1px;
  top: -1px;
  background-color: var(--color-primary);
  color: #fff;
  padding: 3px 8px 4px 9px;
  font-size: 13px;
  border-radius: 3px 3px 3px 10px;
}

.tag-zone {
  margin-top: 20px;

  .el-tag {
    margin-right: 3px;
  }
}

.text-zone {
  text-align: left;
  height: 100%;
}

</style>
