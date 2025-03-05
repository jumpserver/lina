<template>
  <div class="el-card-table">
    <TableAction
      :reload-table="reloadTable"
      :search-table="search"
      :table-url="tableUrl"
      v-bind="headerActions"
    />
    <el-row :gutter="10" class="the-row">
      <IBox v-if="totalData.length === 0">
        <el-empty :description="$t('NoData')" :image-size="200" class="no-data" style="padding: 20px" />
      </IBox>
      <div class="card-container">
        <el-card
          v-for="(d, index) in totalData"
          :key="index"
          :body-style="{ 'text-align': 'center', 'padding': '15px' }"
          :class="{'is-disabled': isDisabled(d)}"
          class="my-card"
          shadow="hover"
          @click.native="onView(d)"
        >
          <keep-alive>
            <slot :index="index" :item="d">
              <span v-if="d.edition === 'enterprise'" class="enterprise">
                {{ $t('Enterprise') }}
              </span>
              <el-row>
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
                  <div :title="d.comment " class="comment">
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
  </div>
</template>

<script>
import TableAction from '@/components/Table/ListTable/TableAction'
import { Pagination } from '@/components'
import Icon from '@/components/Widgets/Icon/index.vue'
import { mapGetters } from 'vuex'
import IBox from '@/components/Common/IBox/index.vue'

const defaultFirstPage = 1

export default {
  name: 'CardTable',
  components: {
    IBox,
    TableAction,
    Pagination,
    Icon
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
    ...mapGetters(['hasValidLicense']),
    tableUrl() {
      return this.tableConfig.url || ''
    }
  },
  mounted() {
    this.getList()
  },
  methods: {
    isDisabled(item) {
      return item.edition?.value === 'enterprise' && !this.hasValidLicense
    },
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
      this.$axios.delete(`${this.tableConfig.url}${obj.id}/`)
    },
    onView(obj) {
      if (this.isDisabled(obj)) {
        return
      }
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
.the-row {
  margin-top: 15px;
  max-width: 1600px;
  text-align: center;

  .el-col, div {
    display: flex;
    gap: 20px;

    .my-card {
      min-width: 330px;
      position: relative;
      margin-bottom: 20px;
      height: 230px;
      width: 380px;

      ::v-deep .el-card__body {
        height: 100%;

        .el-row {
          display: flex;
          flex-wrap: nowrap;
          margin-top: 0;
          height: 100%;

          .image {
            display: flex;
            justify-content: center;
            align-items: center;

            img {
              width: 60px;
              height: 60px;
              object-fit: contain;
            }

            svg {
              width: 40px;
              height: 40px;
            }
          }

          .text-zone {
            display: flex;
            flex-direction: column;
            align-items: flex-start;

            .one-line {
              display: flex;
              flex-wrap: wrap;
              align-items: center;
              padding-top: 10px;
              text-overflow: ellipsis;
              white-space: nowrap;
              cursor: pointer;

              b {
                padding-right: 5px;
              }

              span {
                margin-left: 0 !important;
              }
            }

            .comment {
              display: -webkit-box;
              height: 120px;
              font-size: 12px;
              padding: 10px 0;
              cursor: pointer;
              overflow: hidden;
              -webkit-line-clamp: 4;
              -webkit-box-flex: 1;
              -webkit-box-orient: vertical;
              text-align: left;
            }

            .tag-zone {
              display: flex;
              height: 30%;
              align-items: center;
              cursor: pointer;
            }
          }
        }
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

.enterprise {
  position: absolute;
  right: -1px;
  top: -1px;
  background-color: var(--color-primary);
  color: #fff;
  padding: 3px 8px 4px 9px;
  font-size: 13px;
  border-radius: 3px 3px 3px 8px;
}

.tag-zone {
  margin-top: 10px;

  .el-tag {
    margin-right: 3px;
  }
}

.text-zone {
  text-align: left;
  height: 100%;
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
