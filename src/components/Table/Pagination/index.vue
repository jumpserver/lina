<template>
  <div class="el-page">
    <el-pagination
      v-if="hasPagination"
      v-bind="{
        ...normalizedExtraPaginationAttrs,
        currentPage: paginationCurrentPage,
        pageSize: paginationPageSize,
        background: paginationBackground,
        layout: paginationLayout,
        pageSizes: paginationSizes,
        total: total || 0,
        'onUpdate:current-page': handleCurrentChange,
        'onUpdate:page-size': handleSizeChange
      }"
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
  computed: {
    paginationCurrentPage: {
      get() {
        return this.page
      },
      set(val) {
        this.handleCurrentChange(val)
      }
    },
    paginationPageSize: {
      get() {
        return this.size
      },
      set(val) {
        this.handleSizeChange(val)
      }
    },
    normalizedExtraPaginationAttrs() {
      const attrs = { ...(this.extraPaginationAttrs || {}) }
      if ('small' in attrs) {
        if (attrs.small && !attrs.size) {
          attrs.size = 'small'
        }
        delete attrs.small
      }
      return attrs
    }
  },
  methods: {
    handleSizeChange(val) {
      if (this.size === val) return
      this.size = val
      this.$emit('update:page-size', val)
      this.$emit('sizeChange', val)
    },
    handleCurrentChange(val) {
      if (this.page === val) return
      this.$emit('update:current-page', val)
      this.$emit('currentSizeChange', val)
    },
    getPageQuery(currentPage, pageSize) {
      // 构造query对象
      let query = {}
      query[this.pageSizeKey] = this.hasPagination ? pageSize : this.noPaginationSize

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
:deep(.el-pagination) {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  width: 100%;
  padding: 15px 20px;
}

:deep(.el-pagination .el-pagination__total) {
  margin-right: auto;
  font-size: 12px;
  line-height: 28px;
  white-space: nowrap;
}

:deep(.el-pagination .el-pagination__sizes .el-select) {
  width: 100px;
  font-size: 13px;
}

:deep(.el-pagination .el-pagination__sizes .el-select__wrapper) {
  min-height: 28px !important;
  height: 28px !important;
  padding-top: 0;
  padding-bottom: 0;
  box-sizing: border-box;
}

:deep(.el-pagination .el-pagination__sizes .el-select__selected-item),
:deep(.el-pagination .el-pagination__sizes .el-select__placeholder) {
  font-size: 13px;
  line-height: 28px;
}

:deep(.el-pagination.is-background .el-pager li) {
  margin: 0 1px;
  padding: 0 2px;
  min-width: 28px;
  height: 28px;
  line-height: 26px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  font-size: 12px;
  font-weight: 400;
}

:deep(.el-pagination.is-background .btn-prev),
:deep(.el-pagination.is-background .btn-next) {
  margin: 0 5px;
  padding: 0 2px;
  min-width: 28px;
  height: 28px;
  line-height: 26px;
  box-sizing: border-box;
  border: 1px solid #dcdfe6;
  border-radius: 2px;
  background-color: #fff;
  font-size: 12px;
  font-weight: 400;
}

:deep(.el-pagination.is-background .btn-prev:disabled),
:deep(.el-pagination.is-background .btn-next:disabled) {
  background-color: #fff;
}
</style>
