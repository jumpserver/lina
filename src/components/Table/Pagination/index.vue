<template>
  <div class="el-page">
    <el-pagination
      v-if="hasPagination"
      :current-page="page"
      :page-sizes="paginationSizes"
      :page-size="size"
      :total="total"
      :background="paginationBackground"
      :layout="paginationLayout"
      v-bind="extraPaginationAttrs"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
  </div>
</template>

<script>
const defaultFirstPage = 1

export default {
  name: 'Pagination',
  components: {},
  props: {
    hasPagination: {
      type: Boolean,
      default: true
    },
    firstPage: {
      type: Number,
      default: defaultFirstPage
    },
    pageSizeKey: {
      type: String,
      default: 'limit'
    },
    pageKey: {
      type: String,
      default: 'offset'
    },
    page: {
      type: Number,
      default: 1
    },
    noPaginationSize: {
      type: Number,
      default: -1
    },
    paginationSize: {
      type: Number,
      default: 10
    },
    total: {
      type: Number,
      default: 0
    },
    paginationSizes: {
      type: Array,
      default: () => [10, 20, 30, 40, 50, 100]
    },
    paginationBackground: {
      type: Boolean,
      default: true
    },
    paginationLayout: {
      type: String,
      default: 'total, sizes, prev, pager, next, jumper'
    },
    extraPaginationAttrs: {
      type: Object,
      default: () => {}
    },
    transformQuery: {
      type: Function,
      default: null
    }
  },
  data() {
    return {
      size: this.paginationSize || this.paginationSizes[0]
    }
  },
  methods: {
    handleSizeChange(val) {
      this.$emit('sizeChange', val)
    },
    handleCurrentChange(val) {
      this.$emit('currentSizeChange', val)
    },
    getPageQuery(currentPage, pageSize) {
      // 构造query对象
      let query = {}
      query[this.pageSizeKey] = this.hasPagination
        ? pageSize
        : this.noPaginationSize

      const offset = (currentPage - 1) * pageSize
      query[this.pageKey] = offset
      if (this.transformQuery) {
        query = this.transformQuery(query)
      }
      return query
    }
  }
}
</script>

<style scoped>
>>> .el-pagination {
  text-align: right;
}
>>> .el-pagination__total {
  float: left;
}
</style>
